from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime

history_bp = Blueprint('history', __name__)

@history_bp.route('/create', methods=['POST'])
@jwt_required()
def create_service_history():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()
        
        if 'mechanic_id' not in data or 'service_type' not in data:
            return jsonify({'error': 'Mechanic ID and service type required'}), 400
        
        # Check if mechanic exists
        mechanic = db.mechanics.find_one({'_id': ObjectId(data['mechanic_id'])})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
        
        history_data = {
            'user_id': str(user_id),
            'mechanic_id': str(data['mechanic_id']),
            'service_type': data['service_type'],
            'description': data.get('description'),
            'cost': data.get('cost'),
            'status': 'requested',
            'rating_given': False,
            'service_date': datetime.utcnow(),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.service_history.insert_one(history_data)
        
        return jsonify({
            'message': 'Service history created',
            'service_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@history_bp.route('/mechanic/add', methods=['POST'])
@jwt_required()
def mechanic_add_service():
    """Add manual service record by mechanic for walk-in customers"""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        # Get mechanic from JWT
        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            try:
                mechanic = db.mechanics.find_one({'_id': ObjectId(str(user_id))})
            except Exception:
                mechanic = None

        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        # Validate customer_name, customer_phone, service_type
        customer_name = str(data.get('customer_name', '')).strip()
        customer_phone = str(data.get('customer_phone', '')).strip()
        service_type = str(data.get('service_type', '')).strip()

        if not customer_name:
            return jsonify({'error': 'Customer name is required'}), 400
        if not customer_phone:
            return jsonify({'error': 'Customer phone is required'}), 400
        if not service_type:
            return jsonify({'error': 'Service type is required'}), 400

        # Optional vehicle fields
        vehicle_type = str(data.get('vehicle_type', '')).strip() or None
        vehicle_number = str(data.get('vehicle_number', '')).strip().upper() or None
        description = str(data.get('description', '')).strip() or None

        # Validate cost
        raw_cost = data.get('cost')
        cost = None
        if raw_cost is not None and raw_cost != '':
            try:
                cost = float(raw_cost)
                if cost < 0:
                    return jsonify({'error': 'Cost cannot be negative'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Cost must be a valid number'}), 400

        # Validate status
        status = str(data.get('status', 'completed')).strip().lower()
        allowed_statuses = ['requested', 'in_progress', 'completed', 'cancelled']
        if status not in allowed_statuses:
            return jsonify({'error': f"Invalid status '{status}'. Must be one of: {', '.join(allowed_statuses)}"}), 400

        # Parse service date if provided
        service_date_raw = data.get('service_date')
        if service_date_raw:
            try:
                if isinstance(service_date_raw, str):
                    service_date = datetime.fromisoformat(service_date_raw.replace('Z', '+00:00'))
                else:
                    service_date = datetime.utcnow()
            except Exception:
                service_date = datetime.utcnow()
        else:
            service_date = datetime.utcnow()

        # Link to registered user if customer phone matches existing user
        customer_user = db.users.find_one({'phone': customer_phone})
        linked_user_id = str(customer_user['_id']) if customer_user else None

        history_data = {
            'user_id': linked_user_id,
            'mechanic_id': str(mechanic['_id']),
            'added_by': 'mechanic',
            'customer_name': customer_name,
            'customer_phone': customer_phone,
            'vehicle_type': vehicle_type,
            'vehicle_number': vehicle_number,
            'service_type': service_type,
            'description': description,
            'cost': cost,
            'status': status,
            'rating_given': False,
            'service_date': service_date,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = db.service_history.insert_one(history_data)

        return jsonify({
            'message': 'Service record added successfully',
            'service_id': str(result.inserted_id),
            'service': {
                '_id': str(result.inserted_id),
                'user_id': linked_user_id,
                'mechanic_id': str(mechanic['_id']),
                'mechanic_name': mechanic.get('shop_name', 'Unknown'),
                'added_by': 'mechanic',
                'customer_name': customer_name,
                'customer_phone': customer_phone,
                'vehicle_type': vehicle_type,
                'vehicle_number': vehicle_number,
                'service_type': service_type,
                'description': description,
                'cost': cost,
                'status': status,
                'service_date': service_date.isoformat(),
                'created_at': history_data['created_at'].isoformat()
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@history_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_history():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        
        history = list(db.service_history.find({
            'user_id': str(user_id)
        }).sort('created_at', -1).limit(limit))
        
        # Get mechanic names
        for item in history:
            mechanic = db.mechanics.find_one({'_id': ObjectId(item['mechanic_id'])})
            item['mechanic_name'] = mechanic.get('shop_name', 'Unknown') if mechanic else 'Unknown'
        
        return jsonify({
            'history': [{
                '_id': str(h['_id']),
                'service_type': h['service_type'],
                'description': h.get('description'),
                'cost': float(h['cost']) if h.get('cost') else None,
                'status': h['status'],
                'mechanic_name': h.get('mechanic_name', 'Unknown'),
                'service_date': h['service_date'].isoformat() if h.get('service_date') else None,
                'rating_given': h.get('rating_given', False),
                'vehicle_type': h.get('vehicle_type'),
                'vehicle_number': h.get('vehicle_number'),
                'added_by': h.get('added_by', 'customer'),
                'customer_name': h.get('customer_name'),
                'customer_phone': h.get('customer_phone')
            } for h in history],
            'count': len(history)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@history_bp.route('/mechanic', methods=['GET'])
@jwt_required()
def get_mechanic_history_records():
    """Get service history for logged-in mechanic including walk-in and app services"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        status_filter = request.args.get('status')

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            try:
                mechanic = db.mechanics.find_one({'_id': ObjectId(str(user_id))})
            except Exception:
                mechanic = None

        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        query = {'mechanic_id': str(mechanic['_id'])}
        if status_filter:
            query['status'] = status_filter

        history = list(db.service_history.find(query).sort('created_at', -1).limit(limit))

        # Resolve user names for services booked via app
        uid_set = list({s['user_id'] for s in history if s.get('user_id')})
        user_map = {}
        for uid in uid_set:
            try:
                u = db.users.find_one({'_id': ObjectId(uid)})
                if u:
                    user_map[uid] = u.get('name', 'Customer')
            except Exception:
                pass

        return jsonify({
            'history': [{
                '_id': str(s['_id']),
                'service_type': s['service_type'],
                'description': s.get('description'),
                'cost': float(s['cost']) if s.get('cost') else None,
                'status': s['status'],
                'service_date': s['service_date'].isoformat() if s.get('service_date') else None,
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None,
                'customer_name': s.get('customer_name') or user_map.get(s.get('user_id'), 'Customer'),
                'customer_phone': s.get('customer_phone'),
                'vehicle_type': s.get('vehicle_type'),
                'vehicle_number': s.get('vehicle_number'),
                'added_by': s.get('added_by', 'customer'),
                'rating_given': s.get('rating_given', False)
            } for s in history],
            'count': len(history)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@history_bp.route('/<service_id>/status', methods=['PUT'])
@jwt_required()
def update_service_status(service_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()
        
        if 'status' not in data:
            return jsonify({'error': 'Status required'}), 400
        
        service = db.service_history.find_one({'_id': ObjectId(service_id)})
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        # Check if user owns this service or is the mechanic
        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        is_mechanic = mechanic and str(mechanic['_id']) == str(service.get('mechanic_id'))
        
        if service.get('user_id') != str(user_id) and not is_mechanic:
            return jsonify({'error': 'Unauthorized'}), 403
        
        result = db.service_history.update_one(
            {'_id': ObjectId(service_id)},
            {'$set': {
                'status': data['status'],
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({
            'message': 'Service status updated',
            'status': data['status']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500