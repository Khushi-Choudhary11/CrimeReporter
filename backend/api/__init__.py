from flask import Blueprint

# Create the main API blueprint
api_bp = Blueprint('api', __name__)

# Import and register other blueprints
from api.auth.routes import auth_bp
from api.users.routes import users_bp
from api.crimes.routes import crimes_bp
from api.chat.routes import chat_bp

api_bp.register_blueprint(auth_bp, url_prefix='/auth')
api_bp.register_blueprint(users_bp, url_prefix='/users')
api_bp.register_blueprint(crimes_bp, url_prefix='/crimes')
api_bp.register_blueprint(chat_bp, url_prefix='/chat')

# Import other API endpoints as needed
