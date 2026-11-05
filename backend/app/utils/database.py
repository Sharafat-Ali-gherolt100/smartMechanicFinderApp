from flask import current_app, g
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect
import logging
import os
import socket
import subprocess
import time
from pathlib import Path

logger = logging.getLogger(__name__)

_client = None


def is_mongodb_listening(host='127.0.0.1', port=27017, timeout=1.0):
    """Check if MongoDB port is accepting TCP connections."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False


def ensure_mongodb_running(host='127.0.0.1', port=27017):
    """Attempt to start local MongoDB daemon if not running (Windows/local dev)."""
    if is_mongodb_listening(host, port):
        return True

    logger.info("MongoDB is not running on %s:%s. Attempting auto-start...", host, port)
    print(f"MongoDB is not running on {host}:{port}. Attempting auto-start...")

    possible_paths = [
        r"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
        r"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
        r"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
        r"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
        "mongod",
    ]

    db_path = Path("C:/data/db")
    try:
        db_path.mkdir(parents=True, exist_ok=True)
    except Exception:
        db_path = Path(os.path.expanduser("~")) / "mongodb_data"
        db_path.mkdir(parents=True, exist_ok=True)

    for path in possible_paths:
        try:
            cmd = [path, "--dbpath", str(db_path), "--port", str(port)]
            creationflags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            subprocess.Popen(
                cmd,
                creationflags=creationflags,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            # Wait up to 5 seconds for port to become ready
            for _ in range(10):
                time.sleep(0.5)
                if is_mongodb_listening(host, port):
                    logger.info("MongoDB started successfully in background.")
                    print("MongoDB started successfully in background.")
                    return True
        except Exception as err:
            logger.debug("Failed launching mongod at %s: %s", path, err)
            continue

    return is_mongodb_listening(host, port)


def get_db():
    """Get MongoDB database connection (request-scoped via flask.g)."""
    if 'db' not in g:
        # Check if local Mongo is reachable; auto-start if down
        uri = current_app.config.get('MONGODB_URI', '')
        if 'localhost' in uri or '127.0.0.1' in uri:
            if not is_mongodb_listening():
                ensure_mongodb_running()

        try:
            client = MongoClient(
                current_app.config['MONGODB_URI'],
                serverSelectionTimeoutMS=5000,
            )
            client.admin.command('ping')
            # Parse DB name from URI, fallback to explicit name
            from urllib.parse import urlparse
            parsed = urlparse(current_app.config['MONGODB_URI'])
            db_name = parsed.path.lstrip('/') or 'mechanic_finder_db'
            g.db = client.get_database(db_name)
            g._mongo_client = client
        except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as e:
            logger.error('MongoDB connection failed: %s', e)
            raise
    return g.db


def init_db(app):
    """Initialize database indexes. Warns but does not crash if Mongo is down."""
    with app.app_context():
        uri = app.config.get('MONGODB_URI', '')
        if 'localhost' in uri or '127.0.0.1' in uri:
            if not is_mongodb_listening():
                ensure_mongodb_running()

        try:
            db = get_db()
            db_name = db.name

            db.users.create_index([('email', 1)], unique=True)
            db.users.create_index([('latitude', 1), ('longitude', 1)])
            db.users.create_index([('is_mechanic', 1)])
            db.users.create_index([('is_admin', 1)])

            db.mechanics.create_index([('user_id', 1)], unique=True)
            db.mechanics.create_index([('latitude', 1), ('longitude', 1)])
            db.mechanics.create_index([('status', 1)])
            db.mechanics.create_index([('is_banned', 1)])
            db.mechanics.create_index([('is_verified', 1)])
            db.mechanics.create_index([('rating_average', -1)])
            db.mechanics.create_index([('location', '2dsphere')])

            db.ratings.create_index([('user_id', 1), ('mechanic_id', 1)])
            db.ratings.create_index([('mechanic_id', 1), ('created_at', -1)])
            db.ratings.create_index([('service_id', 1)])

            db.service_history.create_index([('user_id', 1), ('created_at', -1)])
            db.service_history.create_index([('mechanic_id', 1)])
            db.service_history.create_index([('status', 1)])

            db.emergency_sos.create_index([('user_id', 1)])
            db.emergency_sos.create_index([('status', 1)])
            db.emergency_sos.create_index([('latitude', 1), ('longitude', 1)])

            db.notifications.create_index([('user_id', 1), ('created_at', -1)])
            db.notifications.create_index([('is_read', 1)])

            db.analytics.create_index([('event_type', 1)])
            db.analytics.create_index([('timestamp', -1)])
            db.analytics.create_index([('user_id', 1)])
            db.analytics.create_index([('mechanic_id', 1)])

            db.photos.create_index([('user_id', 1)])
            db.photos.create_index([('mechanic_id', 1)])
            db.photos.create_index([('is_vehicle_issue', 1)])

            db.videos.create_index([('category', 1)])
            db.videos.create_index([('is_active', 1)])

            db.reports.create_index([('user_id', 1)])
            db.reports.create_index([('mechanic_id', 1)])
            db.reports.create_index([('status', 1)])

            db.sop.create_index([('service_type', 1)])
            db.sop.create_index([('is_active', 1)])

            logger.info('MongoDB indexes created successfully')
            print(f'MongoDB connected -> database: "{db_name}". Indexes ensured.')
        except Exception as e:
            logger.error('MongoDB init failed: %s', e)
            print(
                'WARNING: MongoDB is not reachable. Start MongoDB and restart the API.\n'
                f'  URI: {app.config.get("MONGODB_URI")}\n'
                f'  Error: {e}'
            )


def close_db(e=None):
    """Close database connection for the request."""
    client = g.pop('_mongo_client', None)
    g.pop('db', None)
    if client is not None:
        client.close()

