from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class Notification:
    @staticmethod
    def create(user_id, notif_type, title, message, data=None):
        """Insert a new notification document."""
        db = get_db()
        doc = {
            'user_id': str(user_id),
            'type': notif_type,
            'title': title,
            'message': message,
            'data': data or {},
            'is_read': False,
            'is_push_sent': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.notifications.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_user(user_id, limit=50, unread_only=False):
        """Return notifications for a user, newest first."""
        db = get_db()
        query = {'user_id': str(user_id)}
        if unread_only:
            query['is_read'] = False
        return list(db.notifications.find(query).sort('created_at', -1).limit(limit))

    @staticmethod
    def mark_read(notification_id):
        """Mark a single notification as read."""
        db = get_db()
        result = db.notifications.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'is_read': True, 'updated_at': datetime.utcnow()}},
        )
        return result.modified_count > 0

    @staticmethod
    def mark_all_read(user_id):
        """Mark all notifications for a user as read."""
        db = get_db()
        result = db.notifications.update_many(
            {'user_id': str(user_id), 'is_read': False},
            {'$set': {'is_read': True, 'updated_at': datetime.utcnow()}},
        )
        return result.modified_count

    @staticmethod
    def count_unread(user_id):
        db = get_db()
        return db.notifications.count_documents({'user_id': str(user_id), 'is_read': False})

    @staticmethod
    def to_dict(notif):
        if not notif:
            return None
        return {
            '_id': str(notif['_id']),
            'user_id': notif.get('user_id'),
            'type': notif.get('type'),
            'title': notif.get('title'),
            'message': notif.get('message'),
            'data': notif.get('data', {}),
            'is_read': notif.get('is_read', False),
            'is_push_sent': notif.get('is_push_sent', False),
            'created_at': notif['created_at'].isoformat() if notif.get('created_at') else None,
            'updated_at': notif['updated_at'].isoformat() if notif.get('updated_at') else None,
        }
