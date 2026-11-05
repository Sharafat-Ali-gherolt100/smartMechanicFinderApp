# test_connection.py
from pymongo import MongoClient
from datetime import datetime

try:
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    
    # Get database
    db = client['mechanic_finder_db']
    
    # Test connection
    client.admin.command('ping')
    print("✅ MongoDB connection successful!")
    print(f"   Database: {db.name}")
    print(f"   Collections: {db.list_collection_names()}")
    
    # Insert test data
    test_doc = {
        'name': 'Test User',
        'email': 'test@example.com',
        'created_at': datetime.utcnow()
    }
    
    result = db.users.insert_one(test_doc)
    print(f"✅ Test document inserted with ID: {result.inserted_id}")
    
    # Verify insertion
    doc = db.users.find_one({'email': 'test@example.com'})
    print(f"✅ Retrieved document: {doc['name']}")
    
    # Clean up
    db.users.delete_one({'email': 'test@example.com'})
    print("✅ Test document cleaned up")
    
    print("\n✅ All tests passed! MongoDB is ready for the Smart Mechanic Finder App.")
    
except Exception as e:
    print(f"❌ Error: {e}")