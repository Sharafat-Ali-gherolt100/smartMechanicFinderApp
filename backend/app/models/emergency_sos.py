from datetime import datetime
from app.utils.database import get_db
from bson import ObjectId

class EmergencySOS:
    def __init__(self, data):
        self.data = data
    
    @staticmethod
    def create(user_id, latitude, longitude, location_name=None, vehicle_type=None, 
               issue_description=None, photo_id=None):
        """Create a new emergency SOS request"""
        db = get_db()
        
        sos_data = {
            'user_id': str(user_id),
            'location': {
                'type': 'Point',
                'coordinates': [longitude, latitude]
            },
            'latitude': latitude,
            'longitude': longitude,
            'location_name': location_name,
            'vehicle_type': vehicle_type,
            'issue_description': issue_description,
            'photo_id': str(photo_id) if photo_id else None,
            'status': 'active',
            'assigned_mechanic_id': None,
            'response_time': None,
            'resolved_time': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.emergency_sos.insert_one(sos_data)
        return result.inserted_id
    
    @staticmethod
    def find_active_by_user(user_id):
        """Find all active SOS requests for a user"""
        db = get_db()
        return db.emergency_sos.find({
            'user_id': str(user_id),
            'status': {'$in': ['active', 'responding']}
        }).sort('created_at', -1)
    
    @staticmethod
    def find_active():
        """Find all active SOS requests"""
        db = get_db()
        return db.emergency_sos.find({
            'status': {'$in': ['active', 'responding']}
        }).sort('created_at', -1)
    
    @staticmethod
    def update_status(sos_id, status, assigned_mechanic_id=None):
        """Update SOS status"""
        db = get_db()
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow()
        }
        
        if assigned_mechanic_id:
            update_data['assigned_mechanic_id'] = str(assigned_mechanic_id)
            
        if status == 'responding':
            # Calculate response time
            sos = db.emergency_sos.find_one({'_id': ObjectId(sos_id)})
            if sos:
                response_time = (datetime.utcnow() - sos['created_at']).total_seconds()
                update_data['response_time'] = response_time
        
        if status == 'resolved':
            update_data['resolved_time'] = datetime.utcnow()
        
        result = db.emergency_sos.update_one(
            {'_id': ObjectId(sos_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def to_dict(sos):
        """Convert SOS document to dictionary"""
        return {
            '_id': str(sos['_id']),
            'user_id': sos['user_id'],
            'latitude': sos['latitude'],
            'longitude': sos['longitude'],
            'location_name': sos.get('location_name'),
            'vehicle_type': sos.get('vehicle_type'),
            'issue_description': sos.get('issue_description'),
            'photo_id': sos.get('photo_id'),
            'status': sos['status'],
            'assigned_mechanic_id': sos.get('assigned_mechanic_id'),
            'response_time': sos.get('response_time'),
            'resolved_time': sos.get('resolved_time').isoformat() if sos.get('resolved_time') else None,
            'created_at': sos['created_at'].isoformat() if sos.get('created_at') else None
        }