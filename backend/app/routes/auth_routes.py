from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.mechanic import Mechanic
from app.utils.database import get_db
import re
from datetime import datetime
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        is_mechanic = data.get('role') == 'mechanic'
        is_admin = data.get('role') == 'admin'

        if is_mechanic:
            required_mech = ['shop_name', 'address', 'latitude', 'longitude']
            for field in required_mech:
                if field not in data:
                    return jsonify({'error': f'Missing mechanic information: {field}'}), 400

            # Validate CNIC if provided
            from app.services.verification_service import validate_cnic
            raw_cnic = data.get('cnic_number')
            normalized_cnic = None
            if raw_cnic:
                normalized_cnic = validate_cnic(raw_cnic)
                if not normalized_cnic:
                    return jsonify({'error': 'Invalid CNIC format. Expected 13 digits: XXXXX-XXXXXXX-X'}), 400

        location_name = data.get('location_name')

        user_id = User.create(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            phone=data.get('phone'),
            is_mechanic=is_mechanic,
            is_admin=is_admin,
            location_name=location_name
        )

        if is_mechanic:
            mech_id = Mechanic.create(
                user_id=user_id,
                shop_name=data['shop_name'],
                address=data['address'],
                latitude=float(data['latitude']),
                longitude=float(data['longitude']),
                phone=data.get('phone'),
                services=data.get('services', []),
                location_name=location_name,
                cnic_number=normalized_cnic,
                cnic_document_url=data.get('cnic_document_url'),
                certificate_title=data.get('certificate_title'),
                certificate_document_url=data.get('certificate_document_url'),
                profile_photo_url=data.get('profile_photo_url')
            )

            # Notify admins of new mechanic verification request
            try:
                from app.utils.notifications import send_in_app_notification
                db = get_db()
                admins = list(db.users.find({'is_admin': True}))
                for admin in admins:
                    send_in_app_notification(
                        str(admin['_id']),
                        'mechanic_verification_pending',
                        'New Mechanic Verification Request',
                        f'Mechanic {data["shop_name"]} ({data["name"]}) registered and requires verification.',
                        {'mechanic_id': str(mech_id), 'user_id': str(user_id)}
                    )
            except Exception:
                pass

        user = User.find_by_id(user_id)
        access_token = User.generate_token(str(user_id))

        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': User.to_dict(user, include_mechanic=is_mechanic)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not User.verify_password(user, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 403
        
        db = get_db()
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Generate token
        access_token = User.generate_token(str(user['_id']))
        
        return jsonify({
            'access_token': access_token,
            'user': User.to_dict(user, include_mechanic=user.get('is_mechanic', False))
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(User.to_dict(user, include_mechanic=True)), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        db = get_db()
        update_data = {'updated_at': datetime.utcnow()}
        
        # Update allowed fields
        allowed_fields = ['name', 'phone']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Update location if provided
        if 'latitude' in data and 'longitude' in data:
            update_data['latitude'] = data['latitude']
            update_data['longitude'] = data['longitude']
        
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
        
        user = User.find_by_id(user_id)
        return jsonify(User.to_dict(user, include_mechanic=True)), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500