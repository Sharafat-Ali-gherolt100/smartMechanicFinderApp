from datetime import datetime
from app.utils.database import get_db
from bson import ObjectId

class Rating:
    def __init__(self, data):
        self.data = data
    
    @staticmethod
    def create(user_id, mechanic_id, rating, review=None, service_id=None, 
               service_quality=None, punctuality=None, pricing=None, communication=None):
        """Create a new rating"""
        db = get_db()
        
        rating_data = {
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id),
            'service_id': str(service_id) if service_id else None,
            'rating': rating,
            'review': review,
            'service_quality': service_quality,
            'punctuality': punctuality,
            'pricing': pricing,
            'communication': communication,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.ratings.insert_one(rating_data)
        
        # Update mechanic's average rating
        from app.models.mechanic import Mechanic
        Mechanic.update_rating(mechanic_id)
        
        # Update service history
        if service_id:
            db.service_history.update_one(
                {'_id': ObjectId(service_id)},
                {'$set': {'rating_given': True, 'updated_at': datetime.utcnow()}}
            )
        
        return result.inserted_id
    
    @staticmethod
    def find_by_mechanic(mechanic_id, limit=50):
        """Find all ratings for a mechanic"""
        db = get_db()
        ratings = db.ratings.find({'mechanic_id': str(mechanic_id)}).sort('created_at', -1).limit(limit)
        
        result = []
        for rating in ratings:
            rating_data = Rating.to_dict(rating)
            # Get user name
            user = db.users.find_one({'_id': ObjectId(rating['user_id'])})
            if user:
                rating_data['user_name'] = user['name']
            result.append(rating_data)
        
        return result
    
    @staticmethod
    def find_by_user(user_id, limit=50):
        """Find all ratings given by a user"""
        db = get_db()
        ratings = db.ratings.find({'user_id': str(user_id)}).sort('created_at', -1).limit(limit)
        return [Rating.to_dict(r) for r in ratings]
    
    @staticmethod
    def find_average_rating(mechanic_id):
        """Calculate average rating for a mechanic"""
        db = get_db()
        ratings = db.ratings.find({'mechanic_id': str(mechanic_id)})
        rating_list = [r['rating'] for r in ratings]
        
        if rating_list:
            return round(sum(rating_list) / len(rating_list), 2)
        return 0.0
    
    @staticmethod
    def to_dict(rating):
        """Convert rating document to dictionary"""
        return {
            '_id': str(rating['_id']),
            'user_id': rating['user_id'],
            'mechanic_id': rating['mechanic_id'],
            'service_id': rating.get('service_id'),
            'rating': rating['rating'],
            'review': rating.get('review'),
            'service_quality': rating.get('service_quality'),
            'punctuality': rating.get('punctuality'),
            'pricing': rating.get('pricing'),
            'communication': rating.get('communication'),
            'created_at': rating['created_at'].isoformat() if rating.get('created_at') else None
        }