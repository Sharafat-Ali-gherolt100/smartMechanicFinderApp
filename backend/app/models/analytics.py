from datetime import datetime
from bson import ObjectId
from app.utils.database import get_db


class Analytics:
    # Recognised event types
    EVENT_USER_REGISTER = 'user_register'
    EVENT_USER_LOGIN = 'user_login'
    EVENT_MECHANIC_VIEW = 'mechanic_view'
    EVENT_MECHANIC_SEARCH = 'mechanic_search'
    EVENT_SOS_CREATED = 'sos_created'
    EVENT_SOS_RESOLVED = 'sos_resolved'
    EVENT_SERVICE_CREATED = 'service_created'
    EVENT_SERVICE_COMPLETED = 'service_completed'
    EVENT_RATING_GIVEN = 'rating_given'
    EVENT_REPORT_SUBMITTED = 'report_submitted'

    @staticmethod
    def track(event_type, user_id=None, mechanic_id=None, metadata=None):
        """Record a single analytics event (best-effort, never raises)."""
        try:
            db = get_db()
            db.analytics.insert_one({
                'event_type': event_type,
                'user_id': str(user_id) if user_id else None,
                'mechanic_id': str(mechanic_id) if mechanic_id else None,
                'metadata': metadata or {},
                'timestamp': datetime.utcnow(),
            })
        except Exception:
            pass

    @staticmethod
    def get_event_counts(event_type, since=None):
        """Return total count of a given event type, optionally after *since* datetime."""
        db = get_db()
        query = {'event_type': event_type}
        if since:
            query['timestamp'] = {'$gte': since}
        return db.analytics.count_documents(query)

    @staticmethod
    def get_daily_counts(event_type, days=30):
        """Return per-day counts for the given event over the last *days* days."""
        from datetime import timedelta
        db = get_db()
        start = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {'$match': {'event_type': event_type, 'timestamp': {'$gte': start}}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                'count': {'$sum': 1},
            }},
            {'$sort': {'_id': 1}},
        ]
        return [{'date': r['_id'], 'count': r['count']} for r in db.analytics.aggregate(pipeline)]

    @staticmethod
    def to_dict(event):
        if not event:
            return None
        return {
            '_id': str(event['_id']),
            'event_type': event.get('event_type'),
            'user_id': event.get('user_id'),
            'mechanic_id': event.get('mechanic_id'),
            'metadata': event.get('metadata', {}),
            'timestamp': event['timestamp'].isoformat() if event.get('timestamp') else None,
        }
