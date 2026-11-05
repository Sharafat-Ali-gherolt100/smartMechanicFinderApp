"""
Analytics service – thin wrapper around the Analytics model.
Call these functions from routes to keep route handlers clean.
"""
from app.models.analytics import Analytics


def track_event(event_type, user_id=None, mechanic_id=None, metadata=None):
    """Record an analytics event. Never raises."""
    Analytics.track(event_type, user_id=user_id, mechanic_id=mechanic_id, metadata=metadata)


def get_summary(days=30):
    """Return a simple high-level summary dict for the admin dashboard."""
    return {
        'user_registrations': Analytics.get_daily_counts(Analytics.EVENT_USER_REGISTER, days),
        'mechanic_searches': Analytics.get_daily_counts(Analytics.EVENT_MECHANIC_SEARCH, days),
        'sos_created': Analytics.get_daily_counts(Analytics.EVENT_SOS_CREATED, days),
        'service_completions': Analytics.get_daily_counts(Analytics.EVENT_SERVICE_COMPLETED, days),
        'ratings_given': Analytics.get_daily_counts(Analytics.EVENT_RATING_GIVEN, days),
    }
