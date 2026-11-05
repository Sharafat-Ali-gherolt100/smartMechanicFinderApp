from datetime import datetime
import bcrypt
from flask_jwt_extended import create_access_token
from app.utils.database import get_db
from bson import ObjectId

class User:
    def __init__(self, data):
        self.data = data
    
    @staticmethod
    def create(name, email, password, phone=None, is_mechanic=False, is_admin=False, location_name=None):
        """Create a new user"""
        db = get_db()
        
        # Hash password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        user_data = {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'phone': phone,
            'latitude': None,
            'longitude': None,
            'location_name': location_name,
            'fcm_token': None,
            'is_mechanic': is_mechanic,
            'is_admin': is_admin,
            'is_active': True,
            'last_login': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.users.insert_one(user_data)
        return result.inserted_id
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_db()
        return db.users.find_one({'email': email})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            db = get_db()
            return db.users.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None
    
    @staticmethod
    def verify_password(user, password):
        """Verify user password"""
        return bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))
    
    @staticmethod
    def generate_token(user_id):
        """Generate JWT token"""
        return create_access_token(identity=str(user_id))
    
    @staticmethod
    def to_dict(user, include_mechanic=False):
        """Convert user document to dictionary"""
        result = {
            '_id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone'),
            'latitude': float(user['latitude']) if user.get('latitude') else None,
            'longitude': float(user['longitude']) if user.get('longitude') else None,
            'location_name': user.get('location_name'),
            'is_mechanic': user.get('is_mechanic', False),
            'is_admin': user.get('is_admin', False),
            'is_active': user.get('is_active', True),
            'last_login': user.get('last_login').isoformat() if user.get('last_login') else None,
            'created_at': user['created_at'].isoformat() if user.get('created_at') else None
        }
        
        if include_mechanic:
            mechanic = User.get_mechanic_profile(user['_id'])
            if mechanic:
                result['mechanic'] = mechanic
        
        return result
    
    @staticmethod
    def get_mechanic_profile(user_id):
        """Get mechanic profile for user"""
        from app.models.mechanic import Mechanic
        db = get_db()
        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if mechanic:
            return Mechanic.to_dict(mechanic)
        return None
    
    @staticmethod
    def update_location(user_id, latitude, longitude):
        """Update user location"""
        db = get_db()
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'latitude': latitude,
                'longitude': longitude,
                'updated_at': datetime.utcnow()
            }}
        )
        return result.modified_count > 0
    
    @staticmethod
    def update_fcm_token(user_id, fcm_token):
        """Update user's FCM token for push notifications"""
        db = get_db()
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'fcm_token': fcm_token, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0