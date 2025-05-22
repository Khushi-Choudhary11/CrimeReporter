from flask import jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    verify_jwt_in_request
)
from functools import wraps
from datetime import timedelta
from models.user import User, Authority

def generate_tokens(user_id, role):
    """Generate access and refresh tokens for a user."""
    identity = {'id': user_id, 'role': role}
    # Pass the dictionary directly - don't convert to string
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }

def role_required(role_list):
    """Decorator to check if user has required role."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            
            # Get identity which contains role from token
            current_user = get_jwt_identity()
            
            # Handle either dictionary or string identity
            if isinstance(current_user, dict):
                user_role = current_user.get('role')
            else:
                # Fall back for backward compatibility
                try:
                    import json
                    parsed = json.loads(current_user.replace("'", '"'))
                    user_role = parsed.get('role')
                except:
                    user_role = None
                    
            if user_role not in role_list:
                return jsonify(message="Unauthorized access"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def admin_required(fn):
    """Decorator for endpoints that require admin access."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def authority_required(fn):
    """Decorator for endpoints that require authority access."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        
        # Handle different token payload structures
        user_id = None
        if isinstance(current_user, dict) and 'id' in current_user:
            user_id = current_user['id']
        elif isinstance(current_user, int):
            user_id = current_user
            
        if not user_id:
            return jsonify({"error": "Invalid token format"}), 401
            
        # Check if user has authority role
        authority = Authority.query.filter_by(user_id=user_id).first()
        if not authority:
            return jsonify({"error": "Authority access required"}), 403
            
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    """Helper to get current authenticated user from JWT."""
    return get_jwt_identity()

def create_token_response(user_id, role, username):
    """Create a standardized token response."""
    tokens = generate_tokens(user_id, role)
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user_id,
            'username': username,
            'role': role
        },
        'access_token': tokens['access_token']
    })
