"""
Location service – helpers for geocoding, distance, and ETA calculations.
"""
from app.utils.haversine import calculate_distance, calculate_eta


def get_distance_and_eta(lat1, lon1, lat2, lon2, average_speed_kmh=30):
    """Return distance (km) and ETA (minutes) between two coordinates."""
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    eta = calculate_eta(distance, average_speed=average_speed_kmh)
    return {
        'distance_km': round(distance, 2),
        'eta_minutes': eta,
        'formatted_distance': f"{round(distance, 2)} km" if distance >= 1 else f"{round(distance * 1000)} m",
        'formatted_eta': f"{eta} min" if eta < 60 else f"{eta // 60}h {eta % 60}m",
    }


def enrich_mechanics_with_distance(mechanics, user_lat, user_lon):
    """Add distance and ETA fields to each mechanic dict in-place."""
    for mechanic in mechanics:
        info = get_distance_and_eta(
            user_lat, user_lon,
            mechanic.get('latitude', 0), mechanic.get('longitude', 0),
        )
        mechanic.update(info)
    return mechanics
