import math
from functools import lru_cache

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    using the Haversine formula.
    
    Returns distance in kilometers.
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers (mean radius = 6371 km)
    r = 6371
    
    return c * r

@lru_cache(maxsize=1000)
def calculate_distance_cached(lat1, lon1, lat2, lon2):
    """Cached version of distance calculation for performance"""
    return calculate_distance(lat1, lon1, lat2, lon2)

def calculate_eta(distance, average_speed=30):
    """
    Calculate estimated time of arrival in minutes
    average_speed in km/h
    """
    if distance <= 0:
        return 0
    time_hours = distance / average_speed
    return int(time_hours * 60)  # Return minutes