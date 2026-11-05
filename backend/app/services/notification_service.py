"""
Notification service – high-level helpers used by route handlers.
"""
from app.utils.notifications import (
    send_in_app_notification,
    send_push_notification,
    notify_nearby_mechanics,
)
from app.utils.database import get_db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)


def notify_user(user_id, notif_type, title, message, data=None):
    """Send both an in-app notification and a push notification (if FCM token available)."""
    send_in_app_notification(user_id, notif_type, title, message, data)
    try:
        db = get_db()
        user = db.users.find_one({'_id': ObjectId(str(user_id))})
        if user and user.get('fcm_token'):
            send_push_notification(user['fcm_token'], title, message, data)
    except Exception as e:
        logger.warning('notify_user push failed for %s: %s', user_id, e)


def notify_sos_alert(sos_id, latitude, longitude, radius_km=50):
    """Notify all nearby mechanics about an active SOS."""
    notify_nearby_mechanics(latitude, longitude, str(sos_id), radius_km=radius_km)


def notify_mechanic_verified(mechanic_id, is_verified):
    """Notify a mechanic of verification status change."""
    try:
        db = get_db()
        mechanic = db.mechanics.find_one({'_id': ObjectId(str(mechanic_id))})
        if not mechanic:
            return
        user_id = mechanic.get('user_id')
        message = 'Your shop has been verified!' if is_verified else 'Your verification has been removed.'
        notify_user(user_id, 'verification', 'GetFix: Verification Update', message,
                    {'mechanic_id': str(mechanic_id), 'is_verified': is_verified})
    except Exception as e:
        logger.warning('notify_mechanic_verified failed: %s', e)


def notify_mechanic_banned(mechanic_id, is_banned, reason=''):
    """Notify a mechanic of ban status change."""
    try:
        db = get_db()
        mechanic = db.mechanics.find_one({'_id': ObjectId(str(mechanic_id))})
        if not mechanic:
            return
        user_id = mechanic.get('user_id')
        message = 'Your shop has been banned.' if is_banned else 'Your shop has been unbanned.'
        if is_banned and reason:
            message += f' Reason: {reason}'
        notify_user(user_id, 'ban', 'GetFix: Account Status Update', message,
                    {'mechanic_id': str(mechanic_id), 'is_banned': is_banned})
    except Exception as e:
        logger.warning('notify_mechanic_banned failed: %s', e)
