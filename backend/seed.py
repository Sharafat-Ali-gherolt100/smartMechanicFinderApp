"""
Seed MongoDB with test users, Skardu mechanics, videos, and SOP pricing.

Usage (from backend folder, with venv active):
  python seed.py
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
import bcrypt
from pymongo import MongoClient, ASCENDING, GEOSPHERE

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / '.env')

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/mechanic_finder_db')


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def ensure_indexes(db):
    db.users.create_index([('email', ASCENDING)], unique=True)
    db.mechanics.create_index([('user_id', ASCENDING)], unique=True)
    db.mechanics.create_index([('location', GEOSPHERE)])
    db.videos.create_index([('category', ASCENDING)])
    db.sop.create_index([('service_type', ASCENDING)])
    db.reports.create_index([('status', ASCENDING)])
    db.emergency_sos.create_index([('status', ASCENDING)])
    print('Indexes ensured.')


def upsert_user(db, email, name, password, phone, is_mechanic=False, is_admin=False, lat=35.2973, lng=75.6333, location_name='Skardu, Gilgit-Baltistan'):
    existing = db.users.find_one({'email': email})
    now = datetime.utcnow()
    if existing:
        db.users.update_one(
            {'_id': existing['_id']},
            {'$set': {
                'name': name,
                'password_hash': hash_password(password),
                'phone': phone,
                'is_mechanic': is_mechanic,
                'is_admin': is_admin,
                'is_active': True,
                'latitude': lat,
                'longitude': lng,
                'location_name': location_name,
                'updated_at': now,
            }},
        )
        return existing['_id']

    result = db.users.insert_one({
        'name': name,
        'email': email,
        'password_hash': hash_password(password),
        'phone': phone,
        'latitude': lat,
        'longitude': lng,
        'location_name': location_name,
        'fcm_token': None,
        'is_mechanic': is_mechanic,
        'is_admin': is_admin,
        'is_active': True,
        'last_login': None,
        'created_at': now,
        'updated_at': now,
    })
    return result.inserted_id


def upsert_mechanic(db, user_id, shop_name, address, lat, lng, phone, services, status='open', location_name='Skardu, Gilgit-Baltistan'):
    existing = db.mechanics.find_one({'user_id': str(user_id)})
    now = datetime.utcnow()
    data = {
        'user_id': str(user_id),
        'shop_name': shop_name,
        'address': address,
        'location': {'type': 'Point', 'coordinates': [lng, lat]},
        'latitude': lat,
        'longitude': lng,
        'location_name': location_name,
        'status': status,
        'services': services,
        'phone': phone,
        'description': f'{shop_name} — trusted repair shop in Skardu.',
        'opening_hours': {
            'monday': {'open': '09:00', 'close': '18:00'},
            'tuesday': {'open': '09:00', 'close': '18:00'},
            'wednesday': {'open': '09:00', 'close': '18:00'},
            'thursday': {'open': '09:00', 'close': '18:00'},
            'friday': {'open': '09:00', 'close': '18:00'},
            'saturday': {'open': '10:00', 'close': '16:00'},
            'sunday': {'open': 'closed', 'close': 'closed'},
        },
        'is_verified': True,
        'is_banned': False,
        'rating_average': 4.5,
        'total_ratings': 12,
        'response_time': 15,
        'updated_at': now,
    }
    if existing:
        db.mechanics.update_one({'_id': existing['_id']}, {'$set': data})
        return existing['_id']
    data['created_at'] = now
    return db.mechanics.insert_one(data).inserted_id


def seed_videos(db):
    # 3 real custom short videos provided by user (no fake YouTube links/thumbnails)
    videos = [
        {
            'title': 'Battery Jump Start Guide',
            'description': 'Step-by-step video guide on how to safely jump start a car using another battery and jumper cables.',
            'category': 'Battery',
            'file_url': '/api/videos/file/battery_jumpstart.mp4',
            'filename': 'battery_jumpstart.mp4',
            'thumbnail_url': None,
            'duration': 120,
        },
        {
            'title': 'Radiator & Cooling Water Level Fix',
            'description': 'Learn why radiator water level drops and how to check coolant and prevent engine overheating.',
            'category': 'Engine',
            'file_url': '/api/videos/file/radiator_cooling_fix.mp4',
            'filename': 'radiator_cooling_fix.mp4',
            'thumbnail_url': None,
            'duration': 120,
        },
        {
            'title': 'Dashboard Warning Lights & Diagnostics',
            'description': 'Detailed guide explaining car dashboard warning lights, check engine icons, and troubleshooting steps.',
            'category': 'Diagnostics',
            'file_url': '/api/videos/file/car_warning_lights.mp4',
            'filename': 'car_warning_lights.mp4',
            'thumbnail_url': None,
            'duration': 150,
        },
    ]
    db.videos.delete_many({})
    now = datetime.utcnow()
    for v in videos:
        payload = {
            **v,
            'views': 250,
            'is_active': True,
            'created_at': now,
            'updated_at': now,
        }
        db.videos.insert_one(payload)
    print(f'Seeded {len(videos)} custom videos.')


def seed_sop(db):
    items = [
        ('Oil Change', 1500, 3500, 'Engine oil + filter replacement', 45),
        ('Engine Repair', 5000, 25000, 'Diagnosis and common engine repairs', 180),
        ('Brake Service', 2500, 8000, 'Pads, discs, or fluid service', 90),
        ('Tire Replacement', 2000, 12000, 'Per tire including balancing', 60),
        ('Battery Replacement', 8000, 18000, 'Battery + basic electrical check', 40),
        ('AC Service', 3000, 10000, 'Gas refill and AC diagnosis', 120),
        ('Transmission Service', 8000, 35000, 'Fluid change or clutch-related work', 240),
        ('Wheel Alignment', 2000, 5000, 'Four-wheel alignment', 60),
        ('Radiator Flush', 2500, 7000, 'Coolant flush and refill', 75),
        ('General Diagnostic', 500, 2000, 'OBD scan and visual inspection', 30),
    ]
    now = datetime.utcnow()
    for service_type, amin, amax, desc, mins in items:
        existing = db.sop.find_one({'service_type': service_type})
        payload = {
            'service_type': service_type,
            'price_range_min': amin,
            'price_range_max': amax,
            'description': desc,
            'estimated_time': mins,
            'is_active': True,
            'updated_at': now,
        }
        if existing:
            db.sop.update_one({'_id': existing['_id']}, {'$set': payload})
        else:
            payload['created_at'] = now
            db.sop.insert_one(payload)
    print(f'Seeded {len(items)} SOP pricing entries.')


def seed_history_and_ratings(db, user_id, mechanic_id):
    now = datetime.utcnow()
    existing = db.service_history.find_one({
        'user_id': str(user_id),
        'mechanic_id': str(mechanic_id),
        'service_type': 'Oil Change',
    })
    if not existing:
        hist_id = db.service_history.insert_one({
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id),
            'service_type': 'Oil Change',
            'description': 'Full synthetic oil change',
            'cost': 2800.0,
            'status': 'completed',
            'rating_given': True,
            'service_date': now - timedelta(days=3),
            'created_at': now - timedelta(days=3),
            'updated_at': now - timedelta(days=3),
        }).inserted_id
        db.ratings.insert_one({
            'user_id': str(user_id),
            'mechanic_id': str(mechanic_id),
            'service_id': str(hist_id),
            'rating': 5,
            'review': 'Fast and fair pricing in Skardu!',
            'service_quality': 5,
            'punctuality': 5,
            'pricing': 4,
            'communication': 5,
            'created_at': now - timedelta(days=2),
            'updated_at': now - timedelta(days=2),
        })
    print('Sample history/rating seeded.')


def main():
    print(f'Connecting to {MONGODB_URI} ...')
    if 'localhost' in MONGODB_URI or '127.0.0.1' in MONGODB_URI:
        try:
            from app.utils.database import ensure_mongodb_running
            ensure_mongodb_running()
        except Exception:
            pass

    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    # Always use the explicit DB name so we never land in 'test'
    db = client.get_database('mechanic_finder_db')

    ensure_indexes(db)

    user_id = upsert_user(
        db, 'user@example.com', 'Test User', 'password123', '03450000001',
        is_mechanic=False, is_admin=False, lat=35.2973, lng=75.6333,
    )
    admin_id = upsert_user(
        db, 'admin@example.com', 'Admin User', 'password123', '03450000002',
        is_mechanic=False, is_admin=True, lat=35.2973, lng=75.6333,
    )
    mech_user_id = upsert_user(
        db, 'mechanic@example.com', 'Ali Mechanic', 'password123', '03450000003',
        is_mechanic=True, is_admin=False, lat=35.3001, lng=75.6350,
    )

    primary_mech = upsert_mechanic(
        db, mech_user_id,
        shop_name='Skardu Auto Repair',
        address='Main Bazar, Skardu',
        lat=35.3001, lng=75.6350,
        phone='03451234567',
        services=['Engine Repair', 'Oil Change', 'Tire Service', 'Battery Replacement'],
        status='open',
    )

    # Extra Skardu-area shops (linked to synthetic mechanic users)
    extra_shops = [
        ('Hussain Motors', 'Airport Road, Skardu', 35.2905, 75.6402, '03451112233',
         ['Brake Service', 'Oil Change', 'Wheel Alignment']),
        ('Baltistan Garage', 'Satpara Road, Skardu', 35.2850, 75.6250, '03452223344',
         ['Engine Repair', 'Radiator Flush', 'AC Service']),
        ('K2 Quick Fix', 'Yadgar Chowk, Skardu', 35.3025, 75.6288, '03453334455',
         ['Tire Replacement', 'Battery Replacement', 'General Diagnostic']),
        ('Mountain Peak Autos', 'Gamba, Skardu', 35.3100, 75.6500, '03454445566',
         ['Transmission Service', 'Engine Repair', 'Oil Change']),
    ]

    for i, (shop, addr, lat, lng, phone, services) in enumerate(extra_shops, start=1):
        uid = upsert_user(
            db,
            email=f'shop{i}@example.com',
            name=f'{shop} Owner',
            password='password123',
            phone=phone,
            is_mechanic=True,
            lat=lat,
            lng=lng,
        )
        upsert_mechanic(db, uid, shop, addr, lat, lng, phone, services, status='open')

    seed_videos(db)
    seed_sop(db)
    seed_history_and_ratings(db, user_id, primary_mech)

    print('\nSeed complete. Test credentials:')
    print('  User:     user@example.com / password123')
    print('  Mechanic: mechanic@example.com / password123')
    print('  Admin:    admin@example.com / password123')
    print(f'  Admin id: {admin_id}')
    client.close()


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Seed failed: {e}', file=sys.stderr)
        sys.exit(1)
