from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

class User:
    def __init__(self, username, email, password=None, role='customer', _id=None, is_active=True, created_at=None):
        self._id = _id
        self.username = username
        self.email = email
        self.password_hash = None
        if password:
            self.set_password(password)
        self.role = role
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': str(self._id) if self._id else None,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'is_active': self.is_active
        }
    
    def to_mongo(self):
        """Convert to MongoDB document"""
        doc = {
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at
        }
        if self._id:
            doc['_id'] = self._id
        return doc
    
    @staticmethod
    def from_mongo(doc):
        """Create User from MongoDB document"""
        if not doc:
            return None
        user = User(
            username=doc['username'],
            email=doc['email'],
            role=doc.get('role', 'customer'),
            _id=doc['_id'],
            is_active=doc.get('is_active', True),
            created_at=doc.get('created_at')
        )
        user.password_hash = doc.get('password_hash')
        return user