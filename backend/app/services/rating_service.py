"""
Rating service – business logic around ratings.
"""
from app.utils.database import get_db
from app.models.mechanic import Mechanic
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def submit_rating(user_id, mechanic_id, rating_value, review=None,
                  service_id=None, service_quality=None, punctuality=None,
                  pricing=None, communication=None):
    """
    Create a rating document, update the mechanic's average, and mark
    the related service history entry (if provided).

    Returns (rating_id, error_message).
    """
    db = get_db()

    # Validate range
    if not (1 <= rating_value <= 5):
        return None, 'Rating must be between 1 and 5'

    # Check mechanic exists
    mechanic = db.mechanics.find_one({'_id': ObjectId(str(mechanic_id))})
    if not mechanic:
        return None, 'Mechanic not found'

    # Prevent duplicate rating for the same mechanic
    existing = db.ratings.find_one({
        'user_id': str(user_id),
        'mechanic_id': str(mechanic_id),
    })
    if existing:
        return None, 'You have already rated this mechanic'

    rating_doc = {
        'user_id': str(user_id),
        'mechanic_id': str(mechanic_id),
        'service_id': str(service_id) if service_id else None,
        'rating': rating_value,
        'review': review,
        'service_quality': service_quality,
        'punctuality': punctuality,
        'pricing': pricing,
        'communication': communication,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
    }

    result = db.ratings.insert_one(rating_doc)
    rating_id = result.inserted_id

    # Recalculate average
    Mechanic.update_rating(mechanic_id)

    # Mark service history entry
    if service_id:
        try:
            db.service_history.update_one(
                {'_id': ObjectId(str(service_id))},
                {'$set': {'rating_given': True, 'updated_at': datetime.utcnow()}},
            )
        except Exception as e:
            logger.warning('Failed to mark service history as rated: %s', e)

    return rating_id, None


def get_mechanic_rating_stats(mechanic_id):
    """Return aggregate rating statistics for a mechanic."""
    db = get_db()
    ratings = list(db.ratings.find({'mechanic_id': str(mechanic_id)}))
    if not ratings:
        return {'average': 0.0, 'total': 0, 'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}}

    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in ratings:
        rv = r.get('rating', 0)
        if rv in distribution:
            distribution[rv] += 1

    total = len(ratings)
    average = round(sum(r['rating'] for r in ratings) / total, 2)

    return {'average': average, 'total': total, 'distribution': distribution}
