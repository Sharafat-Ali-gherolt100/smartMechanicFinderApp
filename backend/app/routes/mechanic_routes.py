from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.start()
except ImportError:
    scheduler = None
    logger.warning('APScheduler not installed. Background status checks disabled.')

mechanic_bp = Blueprint('mechanic', __name__)


@mechanic_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_mechanic_dashboard():
    """Get mechanic dashboard statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])

        total_services = db.service_history.count_documents({
            'mechanic_id': mechanic_id, 'status': 'completed'
        })
        pending_services = db.service_history.count_documents({
            'mechanic_id': mechanic_id, 'status': 'requested'
        })
        in_progress_services = db.service_history.count_documents({
            'mechanic_id': mechanic_id, 'status': 'in_progress'
        })

        ratings = list(db.ratings.find({'mechanic_id': mechanic_id}))
        rating_list = [r['rating'] for r in ratings]
        avg_rating = sum(rating_list) / len(rating_list) if rating_list else 0

        recent_services = list(db.service_history.find(
            {'mechanic_id': mechanic_id}
        ).sort('created_at', -1).limit(5))

        active_sos = db.emergency_sos.count_documents({
            'status': 'active', 'assigned_mechanic_id': None
        })

        from app.models.mechanic import Mechanic
        return jsonify({
            'mechanic': Mechanic.to_dict(mechanic),
            'statistics': {
                'total_services': total_services,
                'pending_services': pending_services,
                'in_progress_services': in_progress_services,
                'average_rating': round(avg_rating, 2),
                'total_ratings': len(rating_list),
                'active_sos_requests': active_sos,
                'response_time': mechanic.get('response_time', 0),
            },
            'recent_services': [{
                'service_id': str(s['_id']),
                'service_type': s['service_type'],
                'status': s['status'],
                'service_date': s['service_date'].isoformat() if s.get('service_date') else None,
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None,
            } for s in recent_services],
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_mechanic_profile():
    """Update mechanic profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        update_data = {'updated_at': datetime.utcnow()}
        allowed_fields = ['shop_name', 'address', 'phone', 'description', 'opening_hours']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if 'latitude' in data and 'longitude' in data:
            update_data['latitude'] = data['latitude']
            update_data['longitude'] = data['longitude']
            update_data['location'] = {
                'type': 'Point',
                'coordinates': [data['longitude'], data['latitude']],
            }

        result = db.mechanics.update_one(
            {'_id': mechanic['_id']}, {'$set': update_data}
        )

        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400

        from app.models.mechanic import Mechanic
        updated_mechanic = db.mechanics.find_one({'_id': mechanic['_id']})
        return jsonify({
            'message': 'Profile updated successfully',
            'mechanic': Mechanic.to_dict(updated_mechanic),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/services', methods=['GET'])
@jwt_required()
def get_mechanic_services():
    """Get mechanic's services"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        services = mechanic.get('services', [])
        return jsonify({'services': services, 'count': len(services)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/services', methods=['PUT'])
@jwt_required()
def replace_mechanic_services():
    """Replace mechanic's full service list"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()

        if 'services' not in data:
            return jsonify({'error': 'Services required'}), 400
        if not isinstance(data['services'], list):
            return jsonify({'error': 'Services must be an array'}), 400

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        result = db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {'services': data['services'], 'updated_at': datetime.utcnow()}},
        )

        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400

        updated_mechanic = db.mechanics.find_one({'_id': mechanic['_id']})
        return jsonify({
            'message': 'Services updated successfully',
            'services': updated_mechanic.get('services', []),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/services', methods=['POST'])
@jwt_required()
def add_mechanic_service():
    """Add a single service to mechanic"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()

        if 'service' not in data:
            return jsonify({'error': 'Service name required'}), 400

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        services = mechanic.get('services', [])
        if data['service'] in services:
            return jsonify({'error': 'Service already exists'}), 409

        services.append(data['service'])
        db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {'services': services, 'updated_at': datetime.utcnow()}},
        )

        updated_mechanic = db.mechanics.find_one({'_id': mechanic['_id']})
        return jsonify({
            'message': 'Service added successfully',
            'services': updated_mechanic.get('services', []),
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/services/<service_name>', methods=['DELETE'])
@jwt_required()
def delete_mechanic_service(service_name):
    """Delete a service from mechanic"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        services = mechanic.get('services', [])
        if service_name not in services:
            return jsonify({'error': 'Service not found'}), 404

        services.remove(service_name)
        db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {'services': services, 'updated_at': datetime.utcnow()}},
        )

        updated_mechanic = db.mechanics.find_one({'_id': mechanic['_id']})
        return jsonify({
            'message': 'Service deleted successfully',
            'services': updated_mechanic.get('services', []),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/ratings', methods=['GET'])
@jwt_required()
def get_mechanic_ratings():
    """Get mechanic's ratings and reviews"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])

        # Fetch ratings; enrich user name via a separate lookup (user_id is stored
        # as a string, so $lookup won't join directly — we resolve in Python instead)
        ratings = list(db.ratings.find(
            {'mechanic_id': mechanic_id}
        ).sort('created_at', -1).limit(limit))

        # Build {user_id_str: name} map in one batch
        user_ids = list({r['user_id'] for r in ratings})
        user_map = {}
        for uid in user_ids:
            try:
                u = db.users.find_one({'_id': ObjectId(uid)})
                if u:
                    user_map[uid] = u.get('name', 'Anonymous')
            except Exception:
                pass

        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        total_ratings = len(ratings)
        for r in ratings:
            rv = r.get('rating', 0)
            if rv in distribution:
                distribution[rv] += 1

        distribution_percent = {
            k: round((v / total_ratings) * 100, 1) if total_ratings > 0 else 0
            for k, v in distribution.items()
        }

        return jsonify({
            'ratings': [{
                '_id': str(r['_id']),
                'rating': r['rating'],
                'review': r.get('review'),
                'service_quality': r.get('service_quality'),
                'punctuality': r.get('punctuality'),
                'pricing': r.get('pricing'),
                'communication': r.get('communication'),
                'user_name': user_map.get(r['user_id'], 'Anonymous'),
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None,
            } for r in ratings],
            'statistics': {
                'total': total_ratings,
                'average': mechanic.get('rating_average', 0),
                'distribution': distribution,
                'distribution_percent': distribution_percent,
            },
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/status', methods=['PUT'])
@jwt_required()
def update_mechanic_status():
    """Update mechanic status"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        db = get_db()

        if 'status' not in data:
            return jsonify({'error': 'Status required'}), 400
        new_status = data['status']
        if new_status not in ['open', 'closed', 'busy']:
            return jsonify({'error': 'Invalid status. Must be: open, closed, or busy'}), 400

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        update_fields = {
            'status': new_status,
            'updated_at': datetime.utcnow()
        }

        if new_status in ['closed', 'busy']:
            # Set offline_at if not already set
            if not mechanic.get('offline_at'):
                update_fields['offline_at'] = datetime.utcnow()
            update_fields['offline_reminder_dismissed'] = False

            # Schedule alert check after 3 minutes
            try:
                scheduler.add_job(
                    func=check_status_after_delay,
                    trigger='date',
                    run_date=datetime.now() + timedelta(minutes=3),
                    args=[str(mechanic['_id']), new_status],
                    id=f"status_check_{mechanic['_id']}",
                    replace_existing=True
                )
            except Exception as sched_err:
                logger.warning('Failed to schedule status check: %s', sched_err)
        else: # 'open'
            update_fields['offline_at'] = None
            update_fields['offline_reminder_dismissed'] = False
            update_fields['needs_status_update'] = False
            update_fields['status_reminder_at'] = None
            try:
                job_id = f"status_check_{mechanic['_id']}"
                if scheduler.get_job(job_id):
                    scheduler.remove_job(job_id)
            except Exception:
                pass

        db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': update_fields},
        )

        from app.utils.notifications import notify_mechanic_status_change
        notify_mechanic_status_change(mechanic['_id'], new_status)

        return jsonify({
            'message': f'Status updated to {new_status}',
            'status': new_status,
            'needs_status_update': False if new_status == 'open' else mechanic.get('needs_status_update', False),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def check_status_after_delay(mechanic_id, previous_status):
    """Check if mechanic still has same status after 3 minutes and trigger alert"""
    try:
        from app import create_app
        from app.utils.database import get_db
        from app.utils.notifications import send_push_notification

        app = None
        try:
            from flask import current_app
            app = current_app._get_current_object()
        except Exception:
            app = create_app()

        with app.app_context():
            db = get_db()
            mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
            if not mechanic:
                return

            # If still busy/closed after 3 minutes, send alert
            if mechanic.get('status') == previous_status and previous_status in ['busy', 'closed']:
                user = db.users.find_one({'_id': ObjectId(mechanic['user_id'])})

                # Create notification
                notification = {
                    'user_id': str(mechanic['user_id']),
                    'type': 'status_reminder',
                    'title': 'Update Your Shop Status',
                    'message': f'Your shop is still {previous_status}. Tap to update your status.',
                    'data': {'mechanic_id': str(mechanic_id), 'action': 'open_status'},
                    'is_read': False,
                    'created_at': datetime.utcnow()
                }
                db.notifications.insert_one(notification)

                # Send push notification
                if user and user.get('fcm_token'):
                    try:
                        send_push_notification(
                            user['fcm_token'],
                            'Update Your Status',
                            f'Your shop has been {previous_status} for 3 minutes. Tap to update.',
                            {'action': 'open_status'}
                        )
                    except Exception as push_err:
                        logger.warning('Failed sending status push: %s', push_err)

                # Set flag for red dot
                db.mechanics.update_one(
                    {'_id': ObjectId(mechanic_id)},
                    {'$set': {'needs_status_update': True, 'status_reminder_at': datetime.utcnow()}}
                )
    except Exception as e:
        logger.warning('check_status_after_delay error: %s', e)


@mechanic_bp.route('/offline-status-check', methods=['GET'])
@jwt_required()
def check_offline_status():
    """Check if mechanic status has been OFF/Busy for 3 minutes or more."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        status = mechanic.get('status', 'closed')
        offline_at = mechanic.get('offline_at')
        dismissed = mechanic.get('offline_reminder_dismissed', False)
        needs_status_update = bool(mechanic.get('needs_status_update', False))

        if status in ['closed', 'busy'] and offline_at and not dismissed:
            now = datetime.utcnow()
            if isinstance(offline_at, datetime):
                elapsed_seconds = (now - offline_at).total_seconds()
            else:
                elapsed_seconds = 0

            # 3 minutes = 180 seconds
            THREE_MINUTES = 3 * 60
            if elapsed_seconds >= THREE_MINUTES or needs_status_update:
                minutes = max(3, round(elapsed_seconds / 60, 1))
                if not needs_status_update:
                    db.mechanics.update_one(
                        {'_id': mechanic['_id']},
                        {'$set': {'needs_status_update': True, 'status_reminder_at': datetime.utcnow()}}
                    )
                return jsonify({
                    'offline_reminder_due': True,
                    'needs_status_update': True,
                    'minutes_offline': minutes,
                    'status': status,
                    'message': f'Your shop is still {status.upper()}. Tap to update your status.'
                }), 200

        return jsonify({
            'offline_reminder_due': False,
            'needs_status_update': needs_status_update,
            'status': status
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/offline-status-dismiss', methods=['POST'])
@jwt_required()
def dismiss_offline_reminder():
    """Dismiss offline status reminder."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {
                'offline_reminder_dismissed': True,
                'needs_status_update': False,
                'updated_at': datetime.utcnow()
            }}
        )
        return jsonify({'message': 'Offline reminder dismissed successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@mechanic_bp.route('/history', methods=['GET'])
@jwt_required()
def get_mechanic_history():
    """Get mechanic's service history"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        status_filter = request.args.get('status')
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            try:
                mechanic = db.mechanics.find_one({'_id': ObjectId(str(user_id))})
            except Exception:
                mechanic = None

        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        mechanic_id = str(mechanic['_id'])

        query = {'mechanic_id': mechanic_id}
        if status_filter:
            query['status'] = status_filter

        # Fetch history; resolve user names in Python (user_id stored as string)
        history = list(db.service_history.find(query).sort('created_at', -1).limit(limit))

        uid_set = list({s['user_id'] for s in history if s.get('user_id')})
        user_map = {}
        for uid in uid_set:
            try:
                u = db.users.find_one({'_id': ObjectId(uid)})
                if u:
                    user_map[uid] = u.get('name', 'Customer')
            except Exception:
                pass

        for service in history:
            rating = db.ratings.find_one({'service_id': str(service['_id'])})
            service['_rating'] = rating

        return jsonify({
            'history': [{
                '_id': str(s['_id']),
                'service_type': s['service_type'],
                'description': s.get('description'),
                'cost': float(s['cost']) if s.get('cost') else None,
                'status': s['status'],
                'service_date': s['service_date'].isoformat() if s.get('service_date') else None,
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None,
                'user_name': s.get('customer_name') or user_map.get(s.get('user_id'), 'Customer'),
                'customer_name': s.get('customer_name'),
                'customer_phone': s.get('customer_phone'),
                'vehicle_type': s.get('vehicle_type'),
                'vehicle_number': s.get('vehicle_number'),
                'added_by': s.get('added_by', 'customer'),
                'rating': s['_rating'].get('rating') if s.get('_rating') else None,
                'rating_given': s.get('rating_given', False),
            } for s in history],
            'count': len(history),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/update-response-time', methods=['POST'])
@jwt_required()
def update_response_time():
    """Update mechanic's average response time"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()

        if 'response_time' not in data:
            return jsonify({'error': 'Response time required'}), 400

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        db.mechanics.update_one(
            {'_id': mechanic['_id']},
            {'$set': {'response_time': data['response_time'], 'updated_at': datetime.utcnow()}},
        )

        return jsonify({
            'message': 'Response time updated successfully',
            'response_time': data['response_time'],
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/sos/accept/<sos_id>', methods=['POST'])
@jwt_required()
def accept_sos_request(sos_id):
    """Accept an SOS request"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        if mechanic.get('status') != 'open':
            return jsonify({'error': 'You must be open to accept SOS requests'}), 400

        sos = db.emergency_sos.find_one({'_id': ObjectId(sos_id)})
        if not sos:
            return jsonify({'error': 'SOS request not found'}), 404
        if sos['status'] != 'active':
            return jsonify({'error': 'SOS request is no longer active'}), 400

        db.emergency_sos.update_one(
            {'_id': ObjectId(sos_id)},
            {'$set': {
                'assigned_mechanic_id': str(mechanic['_id']),
                'status': 'responding',
                'updated_at': datetime.utcnow(),
            }},
        )

        user = db.users.find_one({'_id': ObjectId(sos['user_id'])})

        from app.utils.notifications import send_in_app_notification, send_push_notification
        send_in_app_notification(
            sos['user_id'],
            'sos_accepted',
            'Mechanic Responding',
            f'{mechanic["shop_name"]} is on their way to help you!',
            {'sos_id': sos_id, 'mechanic_id': str(mechanic['_id'])},
        )
        if user and user.get('fcm_token'):
            send_push_notification(
                user['fcm_token'],
                'Mechanic Responding',
                f'{mechanic["shop_name"]} is on their way to help you!',
                {'sos_id': sos_id, 'mechanic_id': str(mechanic['_id'])},
            )

        return jsonify({'message': 'SOS request accepted successfully', 'sos_id': sos_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@mechanic_bp.route('/sos/active', methods=['GET'])
@jwt_required()
def get_active_sos_requests():
    """Get active SOS requests near mechanic"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        active_sos = list(db.emergency_sos.find(
            {'status': 'active', 'assigned_mechanic_id': None}
        ).sort('created_at', -1))

        sos_with_distance = []
        for sos in active_sos:
            distance = 0.0
            if mechanic.get('latitude') and mechanic.get('longitude'):
                from app.utils.haversine import calculate_distance
                distance = calculate_distance(
                    mechanic['latitude'], mechanic['longitude'],
                    sos['latitude'], sos['longitude'],
                )
            try:
                user = db.users.find_one({'_id': ObjectId(sos['user_id'])})
            except Exception:
                user = None

            sos_with_distance.append({
                '_id': str(sos['_id']),
                'user_id': sos['user_id'],
                'user_name': user.get('name', 'Anonymous') if user else 'Unknown',
                'latitude': sos['latitude'],
                'longitude': sos['longitude'],
                'location_name': sos.get('location_name'),
                'vehicle_type': sos.get('vehicle_type'),
                'issue_description': sos.get('issue_description'),
                'distance': round(distance, 2),
                'created_at': sos['created_at'].isoformat() if sos.get('created_at') else None,
            })

        sos_with_distance.sort(key=lambda x: x['distance'])

        return jsonify({'sos_requests': sos_with_distance, 'count': len(sos_with_distance)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
