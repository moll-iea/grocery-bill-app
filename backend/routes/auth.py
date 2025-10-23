from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from datetime import timedelta
from models.user import User
from config.database import get_db
from utils.validators import validate_email, validate_password
from functools import wraps
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        db = get_db()
        
        # Validate required fields
        if not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Automatically determine role based on email
        # Admin if email is admin@gmail.com or ends with @admin.com
        if email == 'admin@gmail.com' or email.endswith('@admin.com'):
            role = 'admin'
        else:
            role = 'customer'
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        if db.users.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 409
        
        if db.users.find_one({'email': email}):
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=password,
            role=role
        )
        
        result = db.users.insert_one(new_user.to_mongo())
        new_user._id = result.inserted_id
        
        # Create tokens
        access_token = create_access_token(
            identity=str(new_user._id),
            additional_claims={'role': new_user.role}
        )
        refresh_token = create_refresh_token(identity=str(new_user._id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        db = get_db()
        
        # Validate required fields
        if not all(k in data for k in ['username', 'password']):
            return jsonify({'error': 'Missing username or password'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Find user
        user_doc = db.users.find_one({'username': username})
        user = User.from_mongo(user_doc)
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Create tokens
        access_token = create_access_token(
            identity=str(user._id),
            additional_claims={'role': user.role}
        )
        refresh_token = create_refresh_token(identity=str(user._id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        user_doc = db.users.find_one({'_id': ObjectId(current_user_id)})
        user = User.from_mongo(user_doc)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        access_token = create_access_token(
            identity=current_user_id,
            additional_claims={'role': user.role}
        )
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should delete tokens)"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        user_doc = db.users.find_one({'_id': ObjectId(current_user_id)})
        user = User.from_mongo(user_doc)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    try:
        db = get_db()
        users_docs = db.users.find()
        users = [User.from_mongo(doc).to_dict() for doc in users_docs]
        
        return jsonify({
            'users': users
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        db = get_db()
        
        result = db.users.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500