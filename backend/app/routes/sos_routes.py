from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime

sos_bp = Blueprint('sos', __name__)

@sos_bp.route('/create', methods=['POST'])
@jwt_required()
def create_sos():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()
        
        if 'latitude' not in data or 'longitude' not in data:
            return jsonify({'error': 'Location required'}), 400
        
        sos_data = {
            'user_id': str(user_id),
            'latitude': data['latitude'],
            'longitude': data['longitude'],
            'location_name': data.get('location_name'),
            'vehicle_type': data.get('vehicle_type'),
            'issue_description': data.get('issue_description'),
            'photo_id': data.get('photo_id'),
            'status': 'active',
            'assigned_mechanic_id': None,
            'response_time': None,
            'resolved_time': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.emergency_sos.insert_one(sos_data)
        
        # Notify nearby mechanics
        from app.utils.notifications import notify_nearby_mechanics
        notify_nearby_mechanics(data['latitude'], data['longitude'], str(result.inserted_id))
        
        return jsonify({
            'message': 'SOS alert sent',
            'sos_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sos_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_sos():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        sos = list(db.emergency_sos.find({
            'user_id': str(user_id),
            'status': {'$in': ['active', 'responding']}
        }).sort('created_at', -1))
        
        return jsonify({
            'sos_requests': [{
                '_id': str(s['_id']),
                'latitude': s['latitude'],
                'longitude': s['longitude'],
                'status': s['status'],
                'assigned_mechanic_id': s.get('assigned_mechanic_id'),
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None
            } for s in sos],
            'count': len(sos)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sos_bp.route('/<sos_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_sos(sos_id):
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        sos = db.emergency_sos.find_one({'_id': ObjectId(sos_id)})
        if not sos:
            return jsonify({'error': 'SOS not found'}), 404
        
        if sos['user_id'] != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        if sos['status'] not in ['active', 'responding']:
            return jsonify({'error': 'SOS already resolved'}), 400
        
        result = db.emergency_sos.update_one(
            {'_id': ObjectId(sos_id)},
            {'$set': {
                'status': 'cancelled',
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({
            'message': 'SOS cancelled'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500