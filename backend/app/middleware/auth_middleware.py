"""
Auth middleware helpers.
JWT protection is handled by flask_jwt_extended decorators on each route.
This module provides convenience functions for role-based checks.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.utils.database import get_db
from bson import ObjectId


def admin_required(fn):
    """Decorator – requires a valid JWT AND is_admin == True."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user or not user.get('is_admin', False):
                return jsonify({'error': 'Admin access required'}), 403
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def mechanic_required(fn):
    """Decorator – requires a valid JWT AND is_mechanic == True."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user or not user.get('is_mechanic', False):
                return jsonify({'error': 'Mechanic access required'}), 403
            mechanic = db.mechanics.find_one({'user_id': str(user_id)})
            if not mechanic:
                return jsonify({'error': 'Mechanic profile not found'}), 404
            if mechanic.get('is_banned', False):
                return jsonify({'error': 'Your account has been banned'}), 403
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def active_user_required(fn):
    """Decorator – requires a valid JWT AND is_active == True."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404
            if not user.get('is_active', True):
                return jsonify({'error': 'Account deactivated'}), 403
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper
