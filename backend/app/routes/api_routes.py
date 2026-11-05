from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.mechanic import Mechanic
from app.utils.database import get_db
from app.utils.notifications import send_notification
from app.utils.haversine import calculate_distance
from bson import ObjectId
from datetime import datetime
import logging

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)


# ============================================================
# HEALTH / INFO
# ============================================================

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check – verifies API is running and DB is reachable."""
    try:
        db = get_db()
        db.command('ping')
        db_status = 'connected'
    except Exception as e:
        db_status = f'disconnected: {str(e)}'
        logger.error('Database health check failed: %s', e)

    return jsonify({
        'status': 'healthy',
        'message': 'GetFix API is running',
        'version': '2.0.0',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat(),
    }), 200


@api_bp.route('/', methods=['GET'])
def root():
    """Root endpoint – API information."""
    return jsonify({
        'status': 'online',
        'message': 'Welcome to GetFix API',
        'version': '2.0.0',
        'endpoints': [
            {'path': '/api/health', 'method': 'GET', 'description': 'Health check'},
            {'path': '/api/ping', 'method': 'GET', 'description': 'Ping'},
            {'path': '/api/auth/register', 'method': 'POST', 'description': 'Register user'},
            {'path': '/api/auth/login', 'method': 'POST', 'description': 'Login user'},
            {'path': '/api/auth/profile', 'method': 'GET/PUT', 'description': 'Get/update profile'},
            {'path': '/api/mechanics/nearby', 'method': 'GET', 'description': 'Find nearby mechanics'},
            {'path': '/api/mechanics/<id>', 'method': 'GET', 'description': 'Get mechanic details'},
            {'path': '/api/mechanics/status', 'method': 'PUT', 'description': 'Update mechanic status (api_bp)'},
            {'path': '/api/mechanic/dashboard', 'method': 'GET', 'description': 'Mechanic dashboard'},
            {'path': '/api/mechanic/status', 'method': 'PUT', 'description': 'Update mechanic status'},
            {'path': '/api/mechanic/services', 'method': 'GET/POST/PUT', 'description': 'Manage services'},
            {'path': '/api/videos', 'method': 'GET', 'description': 'Get videos'},
            {'path': '/api/sop', 'method': 'GET', 'description': 'Get pricing guide'},
            {'path': '/api/ratings/create', 'method': 'POST', 'description': 'Submit rating'},
            {'path': '/api/history/user', 'method': 'GET', 'description': 'Get service history'},
            {'path': '/api/sos/create', 'method': 'POST', 'description': 'Send SOS'},
            {'path': '/api/report', 'method': 'POST', 'description': 'Report mechanic'},
            {'path': '/api/admin/dashboard', 'method': 'GET', 'description': 'Admin dashboard'},
        ],
    }), 200


@api_bp.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint for connectivity testing."""
    return jsonify({'pong': True, 'timestamp': datetime.utcnow().isoformat()}), 200


@api_bp.route('/debug/routes', methods=['GET'])
def debug_routes():
    """List all registered routes (debug helper)."""
    from flask import current_app
    routes = [
        {'endpoint': rule.endpoint, 'methods': ','.join(sorted(rule.methods)), 'path': str(rule)}
        for rule in current_app.url_map.iter_rules()
    ]
    return jsonify({'routes': sorted(routes, key=lambda r: r['path']), 'count': len(routes)}), 200


# ============================================================
# MECHANICS
# ============================================================

@api_bp.route('/mechanics/nearby', methods=['GET'])
@jwt_required()
def get_nearby_mechanics():
    """Get mechanics near the user's location."""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)

        if latitude is None or longitude is None:
            if user.get('latitude') and user.get('longitude'):
                latitude = float(user['latitude'])
                longitude = float(user['longitude'])
            else:
                return jsonify({'error': 'Location required. Please enable GPS.'}), 400

        max_distance = request.args.get('max_distance', 50, type=float)
        mechanics = Mechanic.find_nearby(latitude, longitude, max_distance)

        for mechanic in mechanics:
            distance = calculate_distance(
                latitude, longitude, mechanic['latitude'], mechanic['longitude']
            )
            mechanic['distance'] = round(distance, 2)
            mechanic['formatted_distance'] = (
                f"{round(distance, 2)} km" if distance >= 1 else f"{round(distance * 1000)} m"
            )
            eta = int(distance / 30 * 60) if distance > 0 else 0
            mechanic['eta'] = eta
            mechanic['formatted_eta'] = (
                f"{eta} min" if eta < 60 else f"{eta // 60}h {eta % 60}m"
            )

        if user.get('latitude') != latitude or user.get('longitude') != longitude:
            User.update_location(user_id, latitude, longitude)

        return jsonify({
            'mechanics': mechanics,
            'count': len(mechanics),
            'location': {'latitude': latitude, 'longitude': longitude},
        }), 200

    except Exception as e:
        logger.error('get_nearby_mechanics error: %s', e)
        return jsonify({'error': str(e)}), 500


@api_bp.route('/mechanics/<mechanic_id>', methods=['GET'])
def get_mechanic_details(mechanic_id):
    """Get detailed information about a specific mechanic."""
    try:
        mechanic = Mechanic.find_by_id(mechanic_id)
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
        if mechanic.get('is_banned'):
            return jsonify({'error': 'This mechanic has been banned'}), 403

        db = get_db()
        total_services = db.service_history.count_documents({
            'mechanic_id': str(mechanic['_id']), 'status': 'completed'
        })

        recent_reviews = list(db.ratings.find(
            {'mechanic_id': str(mechanic['_id'])}
        ).sort('created_at', -1).limit(5))

        for review in recent_reviews:
            try:
                u = db.users.find_one({'_id': ObjectId(review['user_id'])})
                review['user_name'] = u.get('name', 'Anonymous') if u else 'Anonymous'
            except Exception:
                review['user_name'] = 'Anonymous'

        mechanic_data = Mechanic.to_dict(mechanic)
        mechanic_data['total_services'] = total_services
        mechanic_data['recent_reviews'] = [{
            'rating': r['rating'],
            'review': r.get('review'),
            'user_name': r.get('user_name', 'Anonymous'),
            'created_at': r['created_at'].isoformat() if r.get('created_at') else None,
        } for r in recent_reviews]

        return jsonify(mechanic_data), 200

    except Exception as e:
        logger.error('get_mechanic_details error: %s', e)
        return jsonify({'error': str(e)}), 500


@api_bp.route('/mechanics/status', methods=['PUT'])
@jwt_required()
def update_mechanic_status_api():
    """Update mechanic shop status (open/closed/busy) — api_bp alias delegating to mechanic_routes."""
    from app.routes.mechanic_routes import update_mechanic_status
    return update_mechanic_status()


@api_bp.route('/mechanics/services', methods=['PUT'])
@jwt_required()
def update_mechanic_services_api():
    """Update mechanic's service list — api_bp alias."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'services' not in data:
            return jsonify({'error': 'Services required'}), 400
        if not isinstance(data['services'], list):
            return jsonify({'error': 'Services must be an array'}), 400

        mechanic = Mechanic.find_by_user_id(user_id)
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        db = get_db()
        result = db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {'services': data['services'], 'updated_at': datetime.utcnow()}},
        )

        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400

        updated_mechanic = Mechanic.find_by_id(mechanic['_id'])
        return jsonify({
            'message': 'Services updated successfully',
            'services': data['services'],
            'mechanic': Mechanic.to_dict(updated_mechanic),
        }), 200

    except Exception as e:
        logger.error('update_mechanic_services_api error: %s', e)
        return jsonify({'error': str(e)}), 500


# ============================================================
# REPORTS
# ============================================================

@api_bp.route('/report', methods=['POST'])
@jwt_required()
def report_mechanic():
    """Report a mechanic for overcharging or scamming."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        if 'mechanic_id' not in data:
            return jsonify({'error': 'Mechanic ID required'}), 400
        if 'reason' not in data:
            return jsonify({'error': 'Reason for report required'}), 400

        mechanic = Mechanic.find_by_id(data['mechanic_id'])
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404

        db = get_db()
        existing_report = db.reports.find_one({
            'user_id': str(user_id),
            'mechanic_id': str(data['mechanic_id']),
            'status': 'pending',
        })
        if existing_report:
            return jsonify({'error': 'You have already reported this mechanic. Your report is being reviewed.'}), 409

        report_data = {
            'user_id': str(user_id),
            'mechanic_id': str(data['mechanic_id']),
            'reason': data['reason'],
            'status': 'pending',
            'resolution': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.reports.insert_one(report_data)

        try:
            for admin in db.users.find({'is_admin': True}):
                if admin.get('fcm_token'):
                    send_notification(
                        admin['fcm_token'],
                        'New Report',
                        f'A mechanic has been reported: {mechanic["shop_name"]}',
                    )
        except Exception as e:
            logger.warning('Failed to send admin notification: %s', e)

        return jsonify({
            'message': 'Report submitted successfully. Our team will review it shortly.',
            'report_id': str(result.inserted_id),
        }), 201

    except Exception as e:
        logger.error('report_mechanic error: %s', e)
        return jsonify({'error': str(e)}), 500


@api_bp.route('/report/status/<report_id>', methods=['GET'])
@jwt_required()
def get_report_status(report_id):
    """Get status of a specific report."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        report = db.reports.find_one({'_id': ObjectId(report_id)})
        if not report:
            return jsonify({'error': 'Report not found'}), 404

        user = db.users.find_one({'_id': ObjectId(user_id)})
        is_admin = user.get('is_admin', False) if user else False

        if report['user_id'] != str(user_id) and not is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        return jsonify({
            'report_id': str(report['_id']),
            'status': report['status'],
            'resolution': report.get('resolution'),
            'created_at': report['created_at'].isoformat() if report.get('created_at') else None,
            'updated_at': report['updated_at'].isoformat() if report.get('updated_at') else None,
        }), 200

    except Exception as e:
        logger.error('get_report_status error: %s', e)
        return jsonify({'error': str(e)}), 500


# ============================================================
# ERROR HANDLERS
# ============================================================

@api_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'message': 'The requested URL was not found on the server'}), 404


@api_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed', 'message': 'The HTTP method is not allowed for this endpoint'}), 405


@api_bp.errorhandler(500)
def internal_error(error):
    logger.error('Internal server error: %s', error)
    return jsonify({'error': 'Internal server error', 'message': 'Something went wrong on our end. Please try again later.'}), 500
