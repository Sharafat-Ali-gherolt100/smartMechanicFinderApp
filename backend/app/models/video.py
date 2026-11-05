from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class Video:
    @staticmethod
    def get_all(query=None, skip=0, limit=50):
        db = get_db()
        q = query or {'is_active': True}
        return list(db.videos.find(q).sort('created_at', -1).skip(skip).limit(limit))

    @staticmethod
    def create(data):
        db = get_db()
        video_data = {
            'title': data['title'],
            'description': data.get('description'),
            'category': data['category'],
            'url': data['url'],
            'thumbnail_url': data.get('thumbnail_url'),
            'duration': data.get('duration'),
            'views': 0,
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = db.videos.insert_one(video_data)
        return result.inserted_id

    @staticmethod
    def to_dict(video):
        if not video:
            return None
        return {
            '_id': str(video['_id']),
            'title': video.get('title'),
            'description': video.get('description'),
            'category': video.get('category'),
            'url': video.get('url'),
            'thumbnail_url': video.get('thumbnail_url'),
            'duration': video.get('duration'),
            'views': video.get('views', 0),
            'is_active': video.get('is_active', True),
            'created_at': video['created_at'].isoformat() if video.get('created_at') else None,
            'updated_at': video['updated_at'].isoformat() if video.get('updated_at') else None,
        }
