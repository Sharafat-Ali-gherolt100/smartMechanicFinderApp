from datetime import datetime
from app.utils.database import get_db
from bson import ObjectId

class ServiceHistory:
    def __init__(self, data):
        self.data = data
    
    @staticmethod
    def create(user_id, mechanic_id, service_type, service_date, description=None):
        """Create a new service history entry"""
        db = get_db()
        
        history_data = {
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id),
            'service_type': service_type,
            'description': description,
            'cost': None,
            'status': 'requested',
            'rating_given': False,
            'service_date': service_date,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.service_history.insert_one(history_data)
        return result.inserted_id
    
    @staticmethod
    def find_by_user(user_id, limit=100):
        """Find all service history for a user"""
        db = get_db()
        histories = db.service_history.find({'user_id': str(user_id)}).sort('created_at', -1).limit(limit)
        
        result = []
        for history in histories:
            history_data = ServiceHistory.to_dict(history)
            # Get mechanic name
            mechanic = db.mechanics.find_one({'_id': ObjectId(history['mechanic_id'])})
            if mechanic:
                history_data['mechanic_name'] = mechanic['shop_name']
            result.append(history_data)
        
        return result
    
    @staticmethod
    def find_by_mechanic(mechanic_id, limit=100):
        """Find all service history for a mechanic"""
        db = get_db()
        histories = db.service_history.find({'mechanic_id': str(mechanic_id)}).sort('created_at', -1).limit(limit)
        return [ServiceHistory.to_dict(h) for h in histories]
    
    @staticmethod
    def update_status(service_id, status, cost=None):
        """Update service status"""
        db = get_db()
        update_data = {'status': status, 'updated_at': datetime.utcnow()}
        if cost is not None:
            update_data['cost'] = cost
        
        result = db.service_history.update_one(
            {'_id': ObjectId(service_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def to_dict(history):
        """Convert service history document to dictionary"""
        return {
            '_id': str(history['_id']),
            'user_id': history.get('user_id'),
            'mechanic_id': history.get('mechanic_id'),
            'service_type': history.get('service_type'),
            'description': history.get('description'),
            'cost': float(history['cost']) if history.get('cost') else None,
            'status': history.get('status'),
            'rating_given': history.get('rating_given', False),
            'service_date': history['service_date'].isoformat() if history.get('service_date') else None,
            'created_at': history['created_at'].isoformat() if history.get('created_at') else None,
            'added_by': history.get('added_by', 'customer'),
            'customer_name': history.get('customer_name'),
            'customer_phone': history.get('customer_phone'),
            'vehicle_type': history.get('vehicle_type'),
            'vehicle_number': history.get('vehicle_number')
        }