from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime

sop_bp = Blueprint('sop', __name__)


@sop_bp.route('/sop', methods=['GET'])
def get_sop():
    """Get all active SOP entries (standard pricing guide)."""
    try:
        db = get_db()
        category = request.args.get('category')

        query = {'is_active': True}
        if category:
            query['service_type'] = {'$regex': category, '$options': 'i'}

        sop_entries = list(db.sop.find(query).sort('service_type', 1))

        return jsonify({
            'sop': [{
                '_id': str(s['_id']),
                'service_type': s['service_type'],
                'price_range_min': float(s['price_range_min']),
                'price_range_max': float(s['price_range_max']),
                'description': s.get('description'),
                'estimated_time': s.get('estimated_time'),
                'created_at': s['created_at'].isoformat() if s.get('created_at') else None,
            } for s in sop_entries],
            'count': len(sop_entries),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sop_bp.route('/sop', methods=['POST'])
@jwt_required()
def create_sop():
    """Create a new SOP entry (Admin only)."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json()
        required_fields = ['service_type', 'price_range_min', 'price_range_max']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        sop_data = {
            'service_type': data['service_type'],
            'price_range_min': data['price_range_min'],
            'price_range_max': data['price_range_max'],
            'description': data.get('description'),
            'estimated_time': data.get('estimated_time'),
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.sop.insert_one(sop_data)

        return jsonify({'message': 'SOP created successfully', 'sop_id': str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# NOTE: /sop/categories MUST be defined before /sop/<sop_id> so Flask matches
# the literal segment "categories" first and does not treat it as an ID.
@sop_bp.route('/sop/categories', methods=['GET'])
def get_sop_categories():
    """Get all distinct SOP service-type categories."""
    try:
        db = get_db()
        categories = db.sop.distinct('service_type', {'is_active': True})
        return jsonify({'categories': sorted(categories)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sop_bp.route('/sop/<sop_id>', methods=['PUT'])
@jwt_required()
def update_sop(sop_id):
    """Update an SOP entry (Admin only)."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json()
        sop = db.sop.find_one({'_id': ObjectId(sop_id)})
        if not sop:
            return jsonify({'error': 'SOP not found'}), 404

        update_data = {'updated_at': datetime.utcnow()}
        allowed_fields = [
            'service_type', 'price_range_min', 'price_range_max',
            'description', 'estimated_time', 'is_active',
        ]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        result = db.sop.update_one({'_id': ObjectId(sop_id)}, {'$set': update_data})
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400

        return jsonify({'message': 'SOP updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sop_bp.route('/sop/<sop_id>', methods=['DELETE'])
@jwt_required()
def delete_sop(sop_id):
    """Soft-delete an SOP entry (Admin only)."""
    try:
        user_id = get_jwt_identity()
        db = get_db()

        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403

        sop = db.sop.find_one({'_id': ObjectId(sop_id)})
        if not sop:
            return jsonify({'error': 'SOP not found'}), 404

        db.sop.update_one(
            {'_id': ObjectId(sop_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}},
        )
        return jsonify({'message': 'SOP deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
