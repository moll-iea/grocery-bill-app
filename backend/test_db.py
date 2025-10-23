from config.database import db

def test_connection():
    print("Testing MongoDB connection...")
    database = db.connect()
    
    if database is not None:  # Changed from 'if database:'
        print("✓ Successfully connected to MongoDB!")
        print(f"✓ Database name: {database.name}")
        
        # List collections
        collections = database.list_collection_names()
        print(f"✓ Existing collections: {collections}")
        
        # Test insert
        test_collection = database['test_collection']
        result = test_collection.insert_one({'test': 'data'})
        print(f"✓ Test insert successful! ID: {result.inserted_id}")
        
        # Clean up test data
        test_collection.delete_one({'_id': result.inserted_id})
        print("✓ Test cleanup successful!")
        
        db.close()
        return True
    else:
        print("✗ Failed to connect to MongoDB")
        return False

if __name__ == '__main__':
    test_connection()