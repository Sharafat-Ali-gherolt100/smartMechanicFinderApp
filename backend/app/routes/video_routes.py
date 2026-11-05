from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

video_bp = Blueprint('video', __name__)

# Allowed video extensions
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@video_bp.route('/videos', methods=['GET'])
def get_videos():
    """Get all videos with optional filtering"""
    try:
        db = get_db()
        category = request.args.get('category')
        search = request.args.get('search')
        limit = request.args.get('limit', 50, type=int)
        page = request.args.get('page', 1, type=int)
        
        # Build query
        query = {'is_active': True}
        if category:
            query['category'] = category
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        
        # Pagination
        skip = (page - 1) * limit
        
        # Get videos
        videos = list(db.videos.find(query).sort('created_at', -1).skip(skip).limit(limit))
        total = db.videos.count_documents(query)

        return jsonify({
            'videos': [{
                '_id': str(v['_id']),
                'title': v['title'],
                'description': v.get('description'),
                'category': v['category'],
                'url': v.get('url'),
                'file_url': v.get('file_url'),
                'thumbnail_url': v.get('thumbnail_url'),
                'duration': v.get('duration'),
                'views': v.get('views', 0),
                'created_at': v['created_at'].isoformat() if v.get('created_at') else None
            } for v in videos],
            'total': total,
            'page': page,
            'pages': max(1, -(-total // limit)),  # ceiling division
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/categories', methods=['GET'])
def get_video_categories():
    """Get all video categories with counts"""
    try:
        db = get_db()
        
        categories = db.videos.aggregate([
            {'$match': {'is_active': True}},
            {'$group': {
                '_id': '$category',
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ])
        
        return jsonify({
            'categories': [{
                'name': c['_id'],
                'count': c['count']
            } for c in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/<video_id>', methods=['GET'])
def get_video(video_id):
    """Get a single video by ID"""
    try:
        db = get_db()
        
        video = db.videos.find_one({'_id': ObjectId(video_id), 'is_active': True})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Increment view count
        db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'views': 1}}
        )
        
        return jsonify({
            '_id': str(video['_id']),
            'title': video['title'],
            'description': video.get('description'),
            'category': video['category'],
            'url': video.get('url'),
            'file_url': video.get('file_url'),
            'thumbnail_url': video.get('thumbnail_url'),
            'duration': video.get('duration'),
            'views': video.get('views', 0),
            'created_at': video['created_at'].isoformat() if video.get('created_at') else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos', methods=['POST'])
@jwt_required()
def create_video():
    """Create a new video (Admin only)"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'category', 'url']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        video_data = {
            'title': data['title'],
            'description': data.get('description'),
            'category': data['category'],
            'url': data['url'],
            'thumbnail_url': data.get('thumbnail_url'),
            'duration': data.get('duration'),
            'views': 0,
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.videos.insert_one(video_data)
        
        return jsonify({
            'message': 'Video created successfully',
            'video_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/<video_id>', methods=['PUT'])
@jwt_required()
def update_video(video_id):
    """Update a video (Admin only)"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Update fields
        update_data = {'updated_at': datetime.utcnow()}
        allowed_fields = ['title', 'description', 'category', 'url', 'thumbnail_url', 'duration', 'is_active']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        result = db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
        
        return jsonify({
            'message': 'Video updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/<video_id>', methods=['DELETE'])
@jwt_required()
def delete_video(video_id):
    """Delete a video (Admin only)"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Soft delete - set is_active to False
        result = db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
        )
        
        return jsonify({
            'message': 'Video deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/<video_id>/view', methods=['POST'])
def increment_views(video_id):
    """Increment video view count"""
    try:
        db = get_db()
        
        result = db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'views': 1}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Video not found'}), 404
        
        return jsonify({'message': 'View count incremented'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videos/file/<filename>', methods=['GET'])
def get_video_file(filename):
    """Serve local video file from uploads/videos directory"""
    try:
        from flask import current_app
        videos_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'videos')
        file_path = os.path.join(videos_dir, secure_filename(filename))
        if not os.path.exists(file_path):
            return jsonify({'error': 'Video file not found'}), 404
        return send_file(file_path, mimetype='video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500