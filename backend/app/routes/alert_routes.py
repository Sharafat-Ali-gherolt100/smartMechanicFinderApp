from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from app.models.emergency_alert import EmergencyAlert
from bson import ObjectId
from datetime import datetime

alert_bp = Blueprint('alerts', __name__)


def _enrich(alert, db):
    """Attach user name/email to an alert dict."""
    user_name = 'Unknown'
    user_email = ''
    try:
        user = db.users.find_one({'_id': ObjectId(alert['user_id'])})
        if user:
            user_name  = user.get('name', 'Unknown')
            user_email = user.get('email', '')
    except Exception:
        pass
    return EmergencyAlert.to_dict(alert, user_name=user_name, user_email=user_email)


# ─── User endpoints ────────────────────────────────────────────────────────────

@alert_bp.route('/create', methods=['POST'])
@jwt_required()
def create_alert():
    """Create a new Emergency Service Alert (authenticated users only)."""
    try:
        user_id = get_jwt_identity()
        data    = request.get_json() or {}

        message = (data.get('message') or '').strip()
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        alert_type = data.get('alert_type', 'other')
        if alert_type not in EmergencyAlert.VALID_TYPES:
            return jsonify({
                'error': f'Invalid alert_type. Must be one of: {", ".join(EmergencyAlert.VALID_TYPES)}'
            }), 400

        alert_id = EmergencyAlert.create(
            user_id       = user_id,
            alert_type    = alert_type,
            message       = message,
            location_name = data.get('location_name'),
            vehicle_type  = data.get('vehicle_type'),
            latitude      = data.get('latitude'),
            longitude     = data.get('longitude'),
        )

        # Optionally notify admins in-app
        try:
            db = get_db()
            from app.utils.notifications import send_in_app_notification
            admins = list(db.users.find({'is_admin': True}))
            for admin in admins:
                send_in_app_notification(
                    str(admin['_id']),
                    'emergency_alert',
                    'New Emergency Alert',
                    f'A user has submitted an emergency: {message[:80]}',
                    {'alert_id': str(alert_id)},
                )
        except Exception:
            pass  # Notification failure must never block the response

        return jsonify({
            'message':  'Emergency alert submitted successfully',
            'alert_id': str(alert_id),
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_alerts():
    """Get the current user's own alerts."""
    try:
        user_id = get_jwt_identity()
        db      = get_db()
        alerts  = EmergencyAlert.find_by_user(user_id, limit=50)

        return jsonify({
            'alerts': [_enrich(a, db) for a in alerts],
            'count':  len(alerts),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Admin endpoints ────────────────────────────────────────────────────────────

def _require_admin(user_id):
    db   = get_db()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    return user and user.get('is_admin', False)


@alert_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def admin_get_all_alerts():
    """Admin: list all emergency alerts with optional status filter."""
    try:
        admin_id = get_jwt_identity()
        if not _require_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403

        db            = get_db()
        page          = request.args.get('page',   1,    type=int)
        limit         = request.args.get('limit',  50,   type=int)
        status_filter = request.args.get('status', None)

        skip   = (page - 1) * limit
        alerts = EmergencyAlert.find_all(status_filter=status_filter, limit=limit, skip=skip)
        total  = EmergencyAlert.count_all(status_filter=status_filter)

        return jsonify({
            'alerts': [_enrich(a, db) for a in alerts],
            'total':  total,
            'page':   page,
            'limit':  limit,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/admin/<alert_id>', methods=['GET'])
@jwt_required()
def admin_get_alert(alert_id):
    """Admin: get a single alert by ID."""
    try:
        admin_id = get_jwt_identity()
        if not _require_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403

        db    = get_db()
        alert = EmergencyAlert.find_by_id(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        return jsonify({'alert': _enrich(alert, db)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/admin/<alert_id>/status', methods=['PUT'])
@jwt_required()
def admin_update_alert_status(alert_id):
    """Admin: update alert status and optional admin note."""
    try:
        admin_id = get_jwt_identity()
        if not _require_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403

        data   = request.get_json() or {}
        status = data.get('status')

        if not status:
            return jsonify({'error': 'Status is required'}), 400
        if status not in EmergencyAlert.VALID_STATUSES:
            return jsonify({
                'error': f'Invalid status. Must be one of: {", ".join(EmergencyAlert.VALID_STATUSES)}'
            }), 400

        alert = EmergencyAlert.find_by_id(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        updated = EmergencyAlert.update_status(
            alert_id    = alert_id,
            status      = status,
            admin_note  = data.get('admin_note'),
            resolved_by = admin_id if status in ('resolved', 'dismissed') else None,
        )

        if not updated:
            return jsonify({'error': 'No changes made'}), 400

        # Notify the user that their alert was updated
        try:
            db = get_db()
            from app.utils.notifications import send_in_app_notification
            status_labels = {
                'acknowledged': 'acknowledged — we are looking into it',
                'in_progress':  'being handled by our team',
                'resolved':     'resolved',
                'dismissed':    'reviewed and dismissed',
            }
            label = status_labels.get(status, status)
            send_in_app_notification(
                alert['user_id'],
                'emergency_alert_update',
                'GetFix: Emergency Alert Update',
                f'Your emergency alert has been {label}.',
                {'alert_id': alert_id, 'status': status},
            )
        except Exception:
            pass

        return jsonify({
            'message': f'Alert status updated to {status}',
            'status':  status,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def admin_alert_stats():
    """Admin: summary counts per status."""
    try:
        admin_id = get_jwt_identity()
        if not _require_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403

        stats = {
            s: EmergencyAlert.count_all(status_filter=s)
            for s in EmergencyAlert.VALID_STATUSES
        }
        stats['total'] = EmergencyAlert.count_all()

        return jsonify({'stats': stats}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
