from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class Photo:
    @staticmethod
    def create(user_id, filename, file_path, is_vehicle_issue=False,
               mechanic_id=None, sos_id=None, description=None):
        """Save photo metadata to the database."""
        db = get_db()
        doc = {
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id) if mechanic_id else None,
            'sos_id': str(sos_id) if sos_id else None,
            'filename': filename,
            'file_path': file_path,
            'description': description,
            'is_vehicle_issue': is_vehicle_issue,
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.photos.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_id(photo_id):
        db = get_db()
        return db.photos.find_one({'_id': ObjectId(photo_id)})

    @staticmethod
    def find_by_user(user_id, limit=50):
        db = get_db()
        return list(db.photos.find({'user_id': str(user_id), 'is_active': True})
                    .sort('created_at', -1).limit(limit))

    @staticmethod
    def find_by_mechanic(mechanic_id, limit=50):
        db = get_db()
        return list(db.photos.find({'mechanic_id': str(mechanic_id), 'is_active': True})
                    .sort('created_at', -1).limit(limit))

    @staticmethod
    def delete(photo_id):
        """Soft-delete a photo."""
        db = get_db()
        result = db.photos.update_one(
            {'_id': ObjectId(photo_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}},
        )
        return result.modified_count > 0

    @staticmethod
    def to_dict(photo):
        if not photo:
            return None
        return {
            '_id': str(photo['_id']),
            'user_id': photo.get('user_id'),
            'mechanic_id': photo.get('mechanic_id'),
            'sos_id': photo.get('sos_id'),
            'filename': photo.get('filename'),
            'file_path': photo.get('file_path'),
            'description': photo.get('description'),
            'is_vehicle_issue': photo.get('is_vehicle_issue', False),
            'is_active': photo.get('is_active', True),
            'created_at': photo['created_at'].isoformat() if photo.get('created_at') else None,
            'updated_at': photo['updated_at'].isoformat() if photo.get('updated_at') else None,
        }
