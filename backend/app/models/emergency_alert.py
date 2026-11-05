from datetime import datetime
from app.utils.database import get_db
from bson import ObjectId


class EmergencyAlert:
    """
    Model for user-submitted text-based Emergency Service Alerts.
    Distinct from EmergencySOS (GPS-based roadside distress) — this captures
    a structured alert message that routes to the admin for review/action.
    """

    VALID_STATUSES = ('pending', 'acknowledged', 'in_progress', 'resolved', 'dismissed')
    VALID_TYPES = (
        'breakdown',
        'accident',
        'fuel_empty',
        'tyre_puncture',
        'battery_dead',
        'engine_failure',
        'other',
    )

    @staticmethod
    def create(user_id, alert_type, message, location_name=None,
               vehicle_type=None, latitude=None, longitude=None):
        db = get_db()
        doc = {
            'user_id':       str(user_id),
            'alert_type':    alert_type,
            'message':       message,
            'location_name': location_name,
            'vehicle_type':  vehicle_type,
            'latitude':      latitude,
            'longitude':     longitude,
            'status':        'pending',
            'admin_note':    None,
            'resolved_by':   None,
            'created_at':    datetime.utcnow(),
            'updated_at':    datetime.utcnow(),
        }
        result = db.emergency_alerts.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_user(user_id, limit=20):
        db = get_db()
        return list(
            db.emergency_alerts
            .find({'user_id': str(user_id)})
            .sort('created_at', -1)
            .limit(limit)
        )

    @staticmethod
    def find_all(status_filter=None, limit=100, skip=0):
        db = get_db()
        query = {}
        if status_filter:
            query['status'] = status_filter
        return list(
            db.emergency_alerts
            .find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(limit)
        )

    @staticmethod
    def count_all(status_filter=None):
        db = get_db()
        query = {}
        if status_filter:
            query['status'] = status_filter
        return db.emergency_alerts.count_documents(query)

    @staticmethod
    def find_by_id(alert_id):
        db = get_db()
        try:
            return db.emergency_alerts.find_one({'_id': ObjectId(alert_id)})
        except Exception:
            return None

    @staticmethod
    def update_status(alert_id, status, admin_note=None, resolved_by=None):
        db = get_db()
        update = {
            'status':     status,
            'updated_at': datetime.utcnow(),
        }
        if admin_note is not None:
            update['admin_note'] = admin_note
        if resolved_by is not None:
            update['resolved_by'] = str(resolved_by)
        result = db.emergency_alerts.update_one(
            {'_id': ObjectId(alert_id)},
            {'$set': update},
        )
        return result.modified_count > 0

    @staticmethod
    def to_dict(alert, user_name=None, user_email=None):
        return {
            '_id':           str(alert['_id']),
            'user_id':       alert['user_id'],
            'user_name':     user_name or 'Unknown',
            'user_email':    user_email or '',
            'alert_type':    alert.get('alert_type', 'other'),
            'message':       alert.get('message', ''),
            'location_name': alert.get('location_name'),
            'vehicle_type':  alert.get('vehicle_type'),
            'latitude':      alert.get('latitude'),
            'longitude':     alert.get('longitude'),
            'status':        alert.get('status', 'pending'),
            'admin_note':    alert.get('admin_note'),
            'resolved_by':   alert.get('resolved_by'),
            'created_at':    alert['created_at'].isoformat() if alert.get('created_at') else None,
            'updated_at':    alert['updated_at'].isoformat() if alert.get('updated_at') else None,
        }
