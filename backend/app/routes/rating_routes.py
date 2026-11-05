from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime

rating_bp = Blueprint('rating', __name__)

@rating_bp.route('/create', methods=['POST'])
@jwt_required()
def create_rating():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()
        
        if 'mechanic_id' not in data or 'rating' not in data:
            return jsonify({'error': 'Mechanic ID and rating required'}), 400
        
        if data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Check if mechanic exists
        mechanic = db.mechanics.find_one({'_id': ObjectId(data['mechanic_id'])})
        if not mechanic:
            return jsonify({'error': 'Mechanic not found'}), 404
        
        # Check if user already rated this mechanic
        existing = db.ratings.find_one({
            'user_id': str(user_id),
            'mechanic_id': str(data['mechanic_id'])
        })
        
        if existing:
            return jsonify({'error': 'You have already rated this mechanic'}), 409
        
        rating_data = {
            'user_id': str(user_id),
            'mechanic_id': str(data['mechanic_id']),
            'service_id': data.get('service_id'),
            'rating': data['rating'],
            'review': data.get('review'),
            'service_quality': data.get('service_quality'),
            'punctuality': data.get('punctuality'),
            'pricing': data.get('pricing'),
            'communication': data.get('communication'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.ratings.insert_one(rating_data)
        
        # Update mechanic rating
        from app.models.mechanic import Mechanic
        Mechanic.update_rating(data['mechanic_id'])
        
        return jsonify({
            'message': 'Rating submitted successfully',
            'rating_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rating_bp.route('/mechanic/<mechanic_id>', methods=['GET'])
def get_mechanic_ratings(mechanic_id):
    try:
        db = get_db()
        limit = request.args.get('limit', 20, type=int)
        
        ratings = list(db.ratings.find({
            'mechanic_id': str(mechanic_id)
        }).sort('created_at', -1).limit(limit))
        
        # Get user names
        for rating in ratings:
            user = db.users.find_one({'_id': ObjectId(rating['user_id'])})
            rating['user_name'] = user.get('name', 'Anonymous') if user else 'Anonymous'
        
        return jsonify({
            'ratings': [{
                '_id': str(r['_id']),
                'rating': r['rating'],
                'review': r.get('review'),
                'user_name': r.get('user_name', 'Anonymous'),
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None
            } for r in ratings],
            'count': len(ratings)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rating_bp.route('/my-ratings', methods=['GET'])
@jwt_required()
def get_my_ratings():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        ratings = list(db.ratings.find({
            'user_id': str(user_id)
        }).sort('created_at', -1))
        
        return jsonify({
            'ratings': [{
                '_id': str(r['_id']),
                'rating': r['rating'],
                'review': r.get('review'),
                'mechanic_id': r['mechanic_id'],
                'created_at': r['created_at'].isoformat() if r.get('created_at') else None
            } for r in ratings],
            'count': len(ratings)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500