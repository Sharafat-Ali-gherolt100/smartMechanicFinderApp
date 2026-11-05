from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class SOP:
    @staticmethod
    def get_all(query=None):
        db = get_db()
        q = query or {'is_active': True}
        return list(db.sop.find(q).sort('service_type', 1))

    @staticmethod
    def create(data):
        db = get_db()
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
        return result.inserted_id

    @staticmethod
    def to_dict(sop):
        if not sop:
            return None
        return {
            '_id': str(sop['_id']),
            'service_type': sop.get('service_type'),
            'price_range_min': float(sop.get('price_range_min', 0)),
            'price_range_max': float(sop.get('price_range_max', 0)),
            'description': sop.get('description'),
            'estimated_time': sop.get('estimated_time'),
            'is_active': sop.get('is_active', True),
            'created_at': sop['created_at'].isoformat() if sop.get('created_at') else None,
            'updated_at': sop['updated_at'].isoformat() if sop.get('updated_at') else None,
        }
