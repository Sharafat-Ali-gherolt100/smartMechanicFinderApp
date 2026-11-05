from datetime import datetime
from app.utils.database import get_db
from bson import ObjectId
from app.utils.haversine import calculate_distance

class Mechanic:
    def __init__(self, data):
        self.data = data
    
    @staticmethod
    def create(user_id, shop_name, address, latitude, longitude, phone=None, opening_hours=None, services=None, location_name=None,
               cnic_number=None, cnic_document_url=None, certificate_title=None, certificate_document_url=None, profile_photo_url=None):
        """Create a new mechanic profile"""
        db = get_db()
        
        mechanic_data = {
            'user_id': str(user_id),
            'shop_name': shop_name,
            'address': address,
            'location': {
                'type': 'Point',
                'coordinates': [longitude, latitude]
            },
            'latitude': latitude,
            'longitude': longitude,
            'location_name': location_name,
            'status': 'closed',
            'services': services or [],
            'phone': phone,
            'description': None,
            'opening_hours': opening_hours,
            'is_verified': False,
            'verification_status': 'pending',  # 'pending', 'verified', 'rejected'
            'cnic_number': cnic_number,
            'cnic_document_url': cnic_document_url,
            'certificate_title': certificate_title,
            'certificate_document_url': certificate_document_url,
            'profile_photo_url': profile_photo_url,
            'verification_rejection_reason': None,
            'verified_at': None,
            'is_banned': False,
            'rating_average': 0.0,
            'total_ratings': 0,
            'response_time': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.mechanics.insert_one(mechanic_data)
        return result.inserted_id

    @staticmethod
    def find_by_user_id(user_id):
        """Find mechanic by user ID"""
        db = get_db()
        return db.mechanics.find_one({'user_id': str(user_id)})
    
    @staticmethod
    def find_by_id(mechanic_id):
        """Find mechanic by ID"""
        try:
            db = get_db()
            return db.mechanics.find_one({'_id': ObjectId(mechanic_id)})
        except Exception:
            return None
    
    @staticmethod
    def find_nearby(latitude, longitude, max_distance=50, limit=50):
        """Find mechanics within max_distance kilometres using 2dsphere geospatial query.

        The 2dsphere index uses metres for $maxDistance when paired with
        $geometry / GeoJSON, so we convert km → metres directly.
        """
        db = get_db()

        max_distance_metres = max_distance * 1000  # km → m

        mechanics = db.mechanics.find({
            'location': {
                '$near': {
                    '$geometry': {
                        'type': 'Point',
                        'coordinates': [longitude, latitude],
                    },
                    '$maxDistance': max_distance_metres,
                }
            },
            'status': 'open',
            'is_banned': False,
        }).limit(limit)
        
        result = []
        for mechanic in mechanics:
            # Calculate exact distance in km
            distance = calculate_distance(
                latitude, longitude,
                mechanic['latitude'], mechanic['longitude']
            )
            mechanic_data = Mechanic.to_dict(mechanic)
            mechanic_data['distance'] = round(distance, 2)
            result.append(mechanic_data)
        
        return result
    
    @staticmethod
    def update_status(mechanic_id, status):
        """Update mechanic status"""
        db = get_db()
        result = db.mechanics.update_one(
            {'_id': ObjectId(mechanic_id)},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
        )
        return result.matched_count > 0
    
    @staticmethod
    def update_rating(mechanic_id):
        """Update average rating from all ratings"""
        db = get_db()
        
        # Get all ratings for this mechanic
        ratings = db.ratings.find({'mechanic_id': str(mechanic_id)})
        rating_list = [r['rating'] for r in ratings]
        
        if rating_list:
            total_ratings = len(rating_list)
            rating_avg = sum(rating_list) / total_ratings
        else:
            total_ratings = 0
            rating_avg = 0.0
        
        result = db.mechanics.update_one(
            {'_id': ObjectId(mechanic_id)},
            {'$set': {
                'rating_average': round(rating_avg, 2),
                'total_ratings': total_ratings,
                'updated_at': datetime.utcnow()
            }}
        )
        return result.modified_count > 0
    
    @staticmethod
    def to_dict(mechanic):
        """Convert mechanic document to dictionary"""
        return {
            '_id': str(mechanic['_id']),
            'user_id': mechanic['user_id'],
            'shop_name': mechanic['shop_name'],
            'address': mechanic['address'],
            'latitude': mechanic['latitude'],
            'longitude': mechanic['longitude'],
            'location_name': mechanic.get('location_name'),
            'status': mechanic['status'],
            'services': mechanic.get('services', []),
            'phone': mechanic.get('phone'),
            'description': mechanic.get('description'),
            'opening_hours': mechanic.get('opening_hours'),
            'is_verified': mechanic.get('is_verified', False),
            'verification_status': mechanic.get('verification_status', 'verified' if mechanic.get('is_verified') else 'pending'),
            'cnic_number': mechanic.get('cnic_number'),
            'cnic_document_url': mechanic.get('cnic_document_url'),
            'certificate_title': mechanic.get('certificate_title'),
            'certificate_document_url': mechanic.get('certificate_document_url'),
            'profile_photo_url': mechanic.get('profile_photo_url'),
            'verification_rejection_reason': mechanic.get('verification_rejection_reason'),
            'verified_at': mechanic['verified_at'].isoformat() if mechanic.get('verified_at') else None,
            'is_banned': mechanic.get('is_banned', False),
            'rating_average': mechanic.get('rating_average', 0.0),
            'total_ratings': mechanic.get('total_ratings', 0),
            'response_time': mechanic.get('response_time', 0),
            'needs_status_update': mechanic.get('needs_status_update', False),
            'status_reminder_at': mechanic['status_reminder_at'].isoformat() if mechanic.get('status_reminder_at') else None,
            'offline_at': mechanic['offline_at'].isoformat() if mechanic.get('offline_at') else None,
            'created_at': mechanic['created_at'].isoformat() if mechanic.get('created_at') else None
        }

    @staticmethod
    def update_verification_status(mechanic_id, status, reason=None):
        """Update mechanic verification status (pending, verified, rejected)"""
        db = get_db()
        is_verified = (status == 'verified')
        update_doc = {
            'verification_status': status,
            'is_verified': is_verified,
            'verification_rejection_reason': reason if status == 'rejected' else None,
            'updated_at': datetime.utcnow()
        }
        if is_verified:
            update_doc['verified_at'] = datetime.utcnow()
        result = db.mechanics.update_one(
            {'_id': ObjectId(mechanic_id)},
            {'$set': update_doc}
        )
        return result.matched_count > 0