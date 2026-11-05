from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def send_in_app_notification(user_id, notif_type, title, message, data=None):
    """Store an in-app notification document (best-effort)."""
    try:
        from app.utils.database import get_db
        db = get_db()
        db.notifications.insert_one({
            'user_id': str(user_id),
            'type': notif_type,
            'title': title,
            'message': message,
            'data': data or {},
            'is_read': False,
            'is_push_sent': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        })
    except Exception as e:
        logger.warning('send_in_app_notification failed: %s', e)


def send_push_notification(fcm_token, title, message, data=None):
    """Push notifications require Firebase credentials; no-op if unavailable."""
    if not fcm_token:
        return
    try:
        from firebase_admin import messaging
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=message),
            data={k: str(v) for k, v in (data or {}).items()},
            token=fcm_token,
        )
        messaging.send(msg)
    except Exception as e:
        logger.warning('send_push_notification failed: %s', e)


def send_notification(fcm_token, title, message, data=None):
    send_push_notification(fcm_token, title, message, data)


def notify_mechanic_status_change(mechanic_id, status):
    logger.info('Mechanic %s status -> %s', mechanic_id, status)


def notify_nearby_mechanics(latitude, longitude, sos_id, radius_km=50):
    """Notify open mechanics near an SOS location (in-app best-effort)."""
    try:
        from app.models.mechanic import Mechanic
        from app.utils.database import get_db

        mechanics = Mechanic.find_nearby(latitude, longitude, max_distance=radius_km, limit=50)
        db = get_db()

        for m in mechanics:
            user_id = m.get('user_id')
            if not user_id:
                continue
            send_in_app_notification(
                user_id,
                'sos_alert',
                'GetFix: Emergency SOS Nearby',
                'A driver near you needs emergency assistance.',
                {'sos_id': sos_id, 'latitude': latitude, 'longitude': longitude},
            )
            try:
                from bson import ObjectId
                user = db.users.find_one({'_id': ObjectId(user_id)})
            except Exception:
                user = None
            if user and user.get('fcm_token'):
                send_push_notification(
                    user['fcm_token'],
                    'GetFix: Emergency SOS Nearby',
                    'A driver near you needs emergency assistance.',
                    {'sos_id': sos_id},
                )
        logger.info('Notified %s nearby mechanics for SOS %s', len(mechanics), sos_id)
    except Exception as e:
        logger.warning('notify_nearby_mechanics failed: %s', e)
