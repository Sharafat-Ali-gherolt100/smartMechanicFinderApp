"""
Input validators used across route handlers.
"""
import re


EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
PHONE_RE = re.compile(r'^\+?[0-9\s\-().]{7,20}$')


def is_valid_email(email: str) -> bool:
    """Return True if *email* matches a basic RFC-5321 pattern."""
    return bool(EMAIL_RE.match(email.strip()))


def is_valid_phone(phone: str) -> bool:
    """Return True if *phone* looks like a plausible phone number."""
    return bool(PHONE_RE.match(phone.strip()))


def is_valid_coordinates(lat, lon) -> bool:
    """Return True if lat/lon are within legal WGS-84 ranges."""
    try:
        lat = float(lat)
        lon = float(lon)
        return -90 <= lat <= 90 and -180 <= lon <= 180
    except (TypeError, ValueError):
        return False


def is_valid_rating(value) -> bool:
    """Return True if value is an integer between 1 and 5 (inclusive)."""
    try:
        v = int(value)
        return 1 <= v <= 5
    except (TypeError, ValueError):
        return False


def is_valid_status(status: str, allowed=('open', 'closed', 'busy')) -> bool:
    return status in allowed


def sanitise_string(value: str, max_length: int = 500) -> str:
    """Strip leading/trailing whitespace and truncate to *max_length*."""
    if not isinstance(value, str):
        return ''
    return value.strip()[:max_length]


def validate_required_fields(data: dict, fields: list) -> list:
    """Return a list of missing field names from *data*."""
    return [f for f in fields if f not in data or data[f] is None or data[f] == '']
