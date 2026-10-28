from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from app import db
from utils.jwt_utils import role_required
from api.users import users_bp

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role
    }), 200

@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    
    # Get user's reports and other activity data
    # You'll need to customize this based on your data models
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role
        },
        'activity': {
            'reports': [], # Populate with actual data
            'recent_activity': []
        }
    }), 200
