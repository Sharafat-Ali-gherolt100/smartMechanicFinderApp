from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime, timedelta
import json

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    """Check if user is admin"""
    db = get_db()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    return user and user.get('is_admin', False)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        user_id = get_jwt_identity()
        
        if not check_admin(user_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        
        # Get date ranges
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        # User statistics
        total_users = db.users.count_documents({})
        new_users_today = db.users.count_documents({'created_at': {'$gte': today_start}})
        new_users_week = db.users.count_documents({'created_at': {'$gte': week_start}})
        new_users_month = db.users.count_documents({'created_at': {'$gte': month_start}})
        
        # Mechanic statistics
        total_mechanics = db.mechanics.count_documents({})
        verified_mechanics = db.mechanics.count_documents({'is_verified': True})
        banned_mechanics = db.mechanics.count_documents({'is_banned': True})
        open_mechanics = db.mechanics.count_documents({'status': 'open'})
        
        # Service statistics
        total_services = db.service_history.count_documents({})
        completed_services = db.service_history.count_documents({'status': 'completed'})
        pending_services = db.service_history.count_documents({'status': 'requested'})
        in_progress_services = db.service_history.count_documents({'status': 'in_progress'})
        
        # Report statistics
        total_reports = db.reports.count_documents({})
        pending_reports = db.reports.count_documents({'status': 'pending'})
        resolved_reports = db.reports.count_documents({'status': 'resolved'})
        dismissed_reports = db.reports.count_documents({'status': 'dismissed'})
        
        # SOS statistics
        total_sos = db.emergency_sos.count_documents({})
        active_sos = db.emergency_sos.count_documents({'status': 'active'})
        resolved_sos = db.emergency_sos.count_documents({'status': 'resolved'})

        # Emergency Alert statistics
        total_alerts      = db.emergency_alerts.count_documents({})
        pending_alerts    = db.emergency_alerts.count_documents({'status': 'pending'})
        resolved_alerts   = db.emergency_alerts.count_documents({'status': 'resolved'})
        inprogress_alerts = db.emergency_alerts.count_documents({'status': 'in_progress'})
        
        # Recent reports
        recent_reports = list(db.reports.find().sort('created_at', -1).limit(5))
        
        # Recent users
        recent_users = list(db.users.find().sort('created_at', -1).limit(5))
        
        # Recent SOS
        recent_sos = list(db.emergency_sos.find().sort('created_at', -1).limit(5))

        # Recent Emergency Alerts
        recent_alerts = list(db.emergency_alerts.find().sort('created_at', -1).limit(5))
        # Enrich with user names
        for alert in recent_alerts:
            try:
                u = db.users.find_one({'_id': ObjectId(alert['user_id'])})
                alert['_user_name']  = u.get('name', 'Unknown') if u else 'Unknown'
                alert['_user_email'] = u.get('email', '') if u else ''
            except Exception:
                alert['_user_name']  = 'Unknown'
                alert['_user_email'] = ''
        
        return jsonify({
            'statistics': {
                'users': {
                    'total': total_users,
                    'new_today': new_users_today,
                    'new_week': new_users_week,
                    'new_month': new_users_month
                },
                'mechanics': {
                    'total': total_mechanics,
                    'verified': verified_mechanics,
                    'banned': banned_mechanics,
                    'open': open_mechanics
                },
                'services': {
                    'total': total_services,
                    'completed': completed_services,
                    'pending': pending_services,
                    'in_progress': in_progress_services
                },
                'reports': {
                    'total': total_reports,
                    'pending': pending_reports,
                    'resolved': resolved_reports,
                    'dismissed': dismissed_reports
                },
                'sos': {
                    'total': total_sos,
                    'active': active_sos,
                    'resolved': resolved_sos
                },
                'emergency_alerts': {
                    'total':       total_alerts,
                    'pending':     pending_alerts,
                    'in_progress': inprogress_alerts,
                    'resolved':    resolved_alerts,
                }
            },
            'recent_reports': [{
                '_id': str(r['_id']),
                'user_id': r['user_id'],
                'mechanic_id': r['mechanic_id'],
                'reason': r['reason'],
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None
            } for r in recent_reports],
            'recent_users': [{
                '_id': str(u['_id']),
                'name': u['name'],
                'email': u['email'],
                'created_at': u['created_at'].isoformat() if u.get('created_at') else None
            } for u in recent_users],
            'recent_sos': [{
                '_id': str(s['_id']),
                'user_id': s['user_id'],
                'status': s['status'],
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None
            } for s in recent_sos],
            'recent_emergency_alerts': [{
                '_id':           str(a['_id']),
                'user_id':       a['user_id'],
                'user_name':     a.get('_user_name', 'Unknown'),
                'user_email':    a.get('_user_email', ''),
                'alert_type':    a.get('alert_type', 'other'),
                'message':       a.get('message', ''),
                'location_name': a.get('location_name'),
                'status':        a.get('status', 'pending'),
                'created_at':    a['created_at'].isoformat() if a.get('created_at') else None,
            } for a in recent_alerts]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users with pagination"""
    try:
        user_id = get_jwt_identity()
        
        if not check_admin(user_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        page = request.args.get('page', 1, type=int)
        search = request.args.get('search')
        
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}}
            ]
        
        users = list(db.users.find(query).sort('created_at', -1).skip(skip).limit(limit))
        total = db.users.count_documents(query)
        
        return jsonify({
            'users': [{
                '_id': str(u['_id']),
                'name': u['name'],
                'email': u['email'],
                'phone': u.get('phone'),
                'is_mechanic': u.get('is_mechanic', False),
                'is_admin': u.get('is_admin', False),
                'is_active': u.get('is_active', True),
                'created_at': u['created_at'].isoformat() if u.get('created_at') else None
            } for u in users],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        data = request.get_json()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from deactivating themselves
        if str(user['_id']) == str(admin_id):
            return jsonify({'error': 'Cannot modify your own account'}), 400
        
        update_data = {'updated_at': datetime.utcnow()}
        allowed_fields = ['name', 'phone', 'is_active', 'is_admin']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
        
        return jsonify({
            'message': 'User updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from deleting themselves
        if str(user['_id']) == str(admin_id):
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Soft delete - set is_active to False
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
        )
        
        return jsonify({
            'message': 'User deactivated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/mechanics', methods=['GET'])
@jwt_required()
def get_mechanics():
    """Get all mechanics with pagination"""
    try:
        user_id = get_jwt_identity()
        
        if not check_admin(user_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        page = request.args.get('page', 1, type=int)
        search = request.args.get('search')
        status_filter = request.args.get('status')
        verified_filter = request.args.get('verified')
        verification_status_filter = request.args.get('verification_status')
        
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'shop_name': {'$regex': search, '$options': 'i'}},
                {'address': {'$regex': search, '$options': 'i'}}
            ]
        if status_filter:
            query['status'] = status_filter
        if verified_filter is not None:
            query['is_verified'] = verified_filter == 'true'
        if verification_status_filter:
            if verification_status_filter == 'pending':
                query['$or'] = [
                    {'verification_status': 'pending'},
                    {'verification_status': {'$exists': False}, 'is_verified': False}
                ]
            else:
                query['verification_status'] = verification_status_filter
        
        mechanics = list(db.mechanics.aggregate([
            {'$match': query},
            {'$addFields': {
                'user_oid': {
                    '$convert': {
                        'input': '$user_id',
                        'to': 'objectId',
                        'onError': None,
                        'onNull': None,
                    }
                }
            }},
            {'$lookup': {
                'from': 'users',
                'localField': 'user_oid',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': {'path': '$user', 'preserveNullAndEmptyArrays': True}},
            {'$sort': {'created_at': -1}},
            {'$skip': skip},
            {'$limit': limit}
        ]))
        
        total = db.mechanics.count_documents(query)
        
        return jsonify({
            'mechanics': [{
                '_id': str(m['_id']),
                'user_id': m['user_id'],
                'shop_name': m['shop_name'],
                'address': m['address'],
                'status': m['status'],
                'is_verified': m.get('is_verified', False),
                'verification_status': m.get('verification_status', 'verified' if m.get('is_verified') else 'pending'),
                'cnic_number': m.get('cnic_number'),
                'cnic_document_url': m.get('cnic_document_url'),
                'certificate_title': m.get('certificate_title'),
                'certificate_document_url': m.get('certificate_document_url'),
                'profile_photo_url': m.get('profile_photo_url'),
                'verification_rejection_reason': m.get('verification_rejection_reason'),
                'verified_at': m['verified_at'].isoformat() if m.get('verified_at') else None,
                'phone': m.get('phone') or (m.get('user') or {}).get('phone'),
                'location_name': m.get('location_name'),
                'services': m.get('services', []),
                'is_banned': m.get('is_banned', False),
                'rating_average': m.get('rating_average', 0),
                'total_ratings': m.get('total_ratings', 0),
                'user_name': m.get('user', {}).get('name', 'Unknown'),
                'user_email': m.get('user', {}).get('email', 'Unknown'),
                'created_at': m['created_at'].isoformat() if m.get('created_at') else None
            } for m in mechanics],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/mechanics/<mechanic_id>/verify', methods=['PUT'])
@jwt_required()
def verify_mechanic(mechanic_id):
    """Verify/unverify mechanic (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        data = request.get_json() or {}
        
        mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
        
        is_verified = data.get('is_verified', True)
        verification_status = 'verified' if is_verified else 'pending'
        
        update_fields = {
            'is_verified': is_verified,
            'verification_status': verification_status,
            'updated_at': datetime.utcnow()
        }
        if is_verified:
            update_fields['verified_at'] = datetime.utcnow()
            update_fields['verification_rejection_reason'] = None
            
        result = db.mechanics.update_one(
            {'_id': ObjectId(mechanic_id)},
            {'$set': update_fields}
        )
        
        # Send notification to mechanic
        from app.utils.notifications import send_in_app_notification, send_push_notification
        
        message = 'Your shop has been verified!' if is_verified else 'Your verification has been removed.'
        send_in_app_notification(
            mechanic['user_id'],
            'verification',
            'Verification Update',
            message,
            {'mechanic_id': mechanic_id, 'is_verified': is_verified, 'verification_status': verification_status}
        )
        
        # Get user for push notification
        user = db.users.find_one({'_id': ObjectId(mechanic['user_id'])})
        if user and user.get('fcm_token'):
            send_push_notification(
                user['fcm_token'],
                'Verification Update',
                message,
                {'mechanic_id': mechanic_id}
            )
        
        return jsonify({
            'message': f'Mechanic {"verified" if is_verified else "unverified"} successfully',
            'is_verified': is_verified,
            'verification_status': verification_status
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/mechanics/<mechanic_id>/verification-status', methods=['PUT'])
@jwt_required()
def update_mechanic_verification_status(mechanic_id):
    """Approve or reject a mechanic verification (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
            
        db = get_db()
        data = request.get_json() or {}
        status = data.get('status') # 'verified', 'rejected', 'pending'
        reason = data.get('rejection_reason')
        
        if status not in ['verified', 'rejected', 'pending']:
            return jsonify({'error': 'Invalid status. Must be: verified, rejected, or pending'}), 400
            
        mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
            
        from app.models.mechanic import Mechanic
        Mechanic.update_verification_status(mechanic_id, status, reason=reason)
        
        from app.utils.notifications import send_in_app_notification, send_push_notification
        if status == 'verified':
            msg_text = 'Congratulations! Your mechanic account has been verified by the admin.'
        elif status == 'rejected':
            msg_text = f'Your verification was rejected. Reason: {reason or "Incomplete or invalid documents"}. Please update your profile.'
        else:
            msg_text = 'Your verification status is pending review.'
            
        send_in_app_notification(
            mechanic['user_id'],
            'verification_status_update',
            'Mechanic Verification Status',
            msg_text,
            {'mechanic_id': mechanic_id, 'verification_status': status, 'rejection_reason': reason}
        )
        
        user = db.users.find_one({'_id': ObjectId(mechanic['user_id'])})
        if user and user.get('fcm_token'):
            send_push_notification(
                user['fcm_token'],
                'Mechanic Verification Status',
                msg_text,
                {'mechanic_id': mechanic_id}
            )
            
        return jsonify({
            'message': f'Mechanic verification updated to {status}',
            'verification_status': status,
            'is_verified': (status == 'verified'),
            'rejection_reason': reason
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/mechanics/<mechanic_id>/verification', methods=['GET'])
@jwt_required()
def get_mechanic_verification_details(mechanic_id):
    """View full mechanic verification profile (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
            
        db = get_db()
        mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
            
        user = db.users.find_one({'_id': ObjectId(mechanic['user_id'])})
        
        return jsonify({
            'verification': {
                'mechanic_id': str(mechanic['_id']),
                'user_id': mechanic['user_id'],
                'full_name': user.get('name') if user else 'Unknown',
                'email': user.get('email') if user else 'Unknown',
                'phone': mechanic.get('phone') or (user.get('phone') if user else 'N/A'),
                'shop_name': mechanic['shop_name'],
                'address': mechanic['address'],
                'location_name': mechanic.get('location_name'),
                'latitude': mechanic.get('latitude'),
                'longitude': mechanic.get('longitude'),
                'services': mechanic.get('services', []),
                'cnic_number': mechanic.get('cnic_number'),
                'cnic_document_url': mechanic.get('cnic_document_url'),
                'certificate_title': mechanic.get('certificate_title'),
                'certificate_document_url': mechanic.get('certificate_document_url'),
                'profile_photo_url': mechanic.get('profile_photo_url'),
                'verification_status': mechanic.get('verification_status', 'verified' if mechanic.get('is_verified') else 'pending'),
                'verification_rejection_reason': mechanic.get('verification_rejection_reason'),
                'verified_at': mechanic['verified_at'].isoformat() if mechanic.get('verified_at') else None,
                'created_at': mechanic['created_at'].isoformat() if mechanic.get('created_at') else None
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/mechanics/<mechanic_id>/ban', methods=['PUT'])
@jwt_required()
def ban_mechanic(mechanic_id):
    """Ban/unban mechanic (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        data = request.get_json()
        
        is_banned = data.get('is_banned', True)
        reason = data.get('reason', '')
        
        mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
        
        result = db.mechanics.update_one(
            {'_id': ObjectId(mechanic_id)},
            {'$set': {
                'is_banned': is_banned,
                'ban_reason': reason if is_banned else None,
                'banned_at': datetime.utcnow() if is_banned else None,
                'updated_at': datetime.utcnow()
            }}
        )
        
        # Send notification to mechanic
        from app.utils.notifications import send_in_app_notification, send_push_notification
        
        message = 'Your shop has been banned.' if is_banned else 'Your shop has been unbanned.'
        if is_banned and reason:
            message += f' Reason: {reason}'
        
        send_in_app_notification(
            mechanic['user_id'],
            'ban',
            'Account Status Update',
            message,
            {'mechanic_id': mechanic_id, 'is_banned': is_banned}
        )
        
        # Get user for push notification
        user = db.users.find_one({'_id': ObjectId(mechanic['user_id'])})
        if user and user.get('fcm_token'):
            send_push_notification(
                user['fcm_token'],
                'Account Status Update',
                message,
                {'mechanic_id': mechanic_id}
            )
        
        return jsonify({
            'message': f'Mechanic {"banned" if is_banned else "unbanned"} successfully',
            'is_banned': is_banned
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    """Get all reports with pagination"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        page = request.args.get('page', 1, type=int)
        status_filter = request.args.get('status')
        
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        if status_filter:
            query['status'] = status_filter
        
        # Get reports with user and mechanic details
        # user_id and mechanic_id are stored as strings, so convert to ObjectId before $lookup
        reports = list(db.reports.aggregate([
            {'$match': query},
            {'$addFields': {
                'user_oid': {
                    '$convert': {'input': '$user_id', 'to': 'objectId', 'onError': None, 'onNull': None}
                },
                'mechanic_oid': {
                    '$convert': {'input': '$mechanic_id', 'to': 'objectId', 'onError': None, 'onNull': None}
                },
            }},
            {'$lookup': {
                'from': 'users',
                'localField': 'user_oid',
                'foreignField': '_id',
                'as': 'reporter',
            }},
            {'$unwind': {'path': '$reporter', 'preserveNullAndEmptyArrays': True}},
            {'$lookup': {
                'from': 'mechanics',
                'localField': 'mechanic_oid',
                'foreignField': '_id',
                'as': 'mechanic',
            }},
            {'$unwind': {'path': '$mechanic', 'preserveNullAndEmptyArrays': True}},
            {'$sort': {'created_at': -1}},
            {'$skip': skip},
            {'$limit': limit},
        ]))
        
        total = db.reports.count_documents(query)
        
        return jsonify({
            'reports': [{
                '_id': str(r['_id']),
                'user_id': r['user_id'],
                'mechanic_id': r['mechanic_id'],
                'reason': r['reason'],
                'status': r['status'],
                'resolution': r.get('resolution'),
                'reporter_name': r.get('reporter', {}).get('name', 'Unknown'),
                'reporter_email': r.get('reporter', {}).get('email', 'Unknown'),
                'mechanic_name': r.get('mechanic', {}).get('shop_name', 'Unknown'),
                'mechanic_address': r.get('mechanic', {}).get('address', 'Unknown'),
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None,
                'updated_at': r['updated_at'].isoformat() if r.get('updated_at') else None
            } for r in reports],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports/<report_id>', methods=['PUT'])
@jwt_required()
def update_report(report_id):
    """Update report status (Admin only)"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status required'}), 400
        
        report = db.reports.find_one({'_id': ObjectId(report_id)})
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow()
        }
        
        if data.get('resolution'):
            update_data['resolution'] = data['resolution']
        
        # If report is resolved and mechanic is guilty, ban the mechanic
        if data['status'] == 'resolved' and data.get('action') == 'ban':
            mechanic_id = report['mechanic_id']
            mechanic = db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
            if mechanic:
                db.mechanics.update_one(
                    {'_id': ObjectId(mechanic_id)},
                    {'$set': {
                        'is_banned': True,
                        'ban_reason': data.get('resolution', 'Banned due to report'),
                        'banned_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }}
                )
        
        result = db.reports.update_one(
            {'_id': ObjectId(report_id)},
            {'$set': update_data}
        )
        
        # Notify the reporter
        from app.utils.notifications import send_in_app_notification, send_push_notification
        
        send_in_app_notification(
            report['user_id'],
            'report_update',
            'GetFix: Report Update',
            f'Your report has been {data["status"]}.',
            {'report_id': report_id, 'status': data['status']}
        )
        
        user = db.users.find_one({'_id': ObjectId(report['user_id'])})
        if user and user.get('fcm_token'):
            send_push_notification(
                user['fcm_token'],
                'Report Update',
                f'Your report has been {data["status"]}.',
                {'report_id': report_id}
            )
        
        return jsonify({
            'message': 'Report updated successfully',
            'status': data['status']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """Get analytics data for charts"""
    try:
        admin_id = get_jwt_identity()
        
        if not check_admin(admin_id):
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        days = request.args.get('days', 30, type=int)
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Daily user registrations
        user_registrations = list(db.users.aggregate([
            {'$match': {'created_at': {'$gte': start_date}}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$created_at'}},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]))
        
        # Daily service completions
        service_completions = list(db.service_history.aggregate([
            {'$match': {
                'status': 'completed',
                'created_at': {'$gte': start_date}
            }},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$created_at'}},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]))
        
        # Daily SOS requests
        sos_requests = list(db.emergency_sos.aggregate([
            {'$match': {'created_at': {'$gte': start_date}}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$created_at'}},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]))
        
        # Reports by status
        reports_by_status = list(db.reports.aggregate([
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]))
        
        # Mechanics by status
        mechanics_by_status = list(db.mechanics.aggregate([
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]))
        
        # Top rated mechanics
        top_mechanics = list(db.mechanics.find({
            'is_banned': False,
            'rating_average': {'$gt': 0}
        }).sort('rating_average', -1).limit(10))
        
        return jsonify({
            'user_registrations': [
                {'date': r['_id'], 'count': r['count']} for r in user_registrations
            ],
            'service_completions': [
                {'date': r['_id'], 'count': r['count']} for r in service_completions
            ],
            'sos_requests': [
                {'date': r['_id'], 'count': r['count']} for r in sos_requests
            ],
            'reports_by_status': [
                {'status': r['_id'] or 'unknown', 'count': r['count']} for r in reports_by_status
            ],
            'mechanics_by_status': [
                {'status': r['_id'] or 'unknown', 'count': r['count']} for r in mechanics_by_status
            ],
            'top_mechanics': [{
                '_id': str(m['_id']),
                'shop_name': m['shop_name'],
                'rating_average': m.get('rating_average', 0),
                'total_ratings': m.get('total_ratings', 0),
                'status': m.get('status', 'closed')
            } for m in top_mechanics]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500