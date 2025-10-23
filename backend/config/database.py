from pymongo import MongoClient
from flask import g, current_app

client = None
db = None

def init_db(app):
    """Initialize database connection"""
    global client, db
    try:
        mongo_uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/grocery_bill_db')
        client = MongoClient(mongo_uri)
        
        # Extract database name from URI or use default
        if 'grocery_bill_db' in mongo_uri:
            db_name = 'grocery_bill_db'
        else:
            db_name = mongo_uri.split('/')[-1].split('?')[0] or 'grocery_bill_db'
        
        db = client[db_name]
        
        # Test connection
        client.server_info()
        print(f"✅ Connected to MongoDB: {db_name}")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise

def get_db():
    """Get database instance"""
    global db
    if db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return db

def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("Database connection closed")