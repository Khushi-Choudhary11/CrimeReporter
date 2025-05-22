import os
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from config import Config
from api.admin.routes import admin_bp

def create_app():
    # Create and configure the app
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Configure CORS to allow requests from the React frontend with credentials
    CORS(app, 
        resources={
            r"/*": {
                "origins": "http://localhost:3000",
                "supports_credentials": True,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"]
            }
        }
    )

    # Error handler for exceptions
    @app.errorhandler(Exception)
    def handle_error(error):
        print(f"Error: {str(error)}")  # Debug log
        response = {
            "error": str(error),
            "message": "An error occurred while processing your request."
        }
        return jsonify(response), 500

   
       
    
    # Initialize extensions first
    db.init_app(app)
    jwt.init_app(app)
    
    # JWT Error Handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'status': 401,
            'message': 'Authorization required',
            'error': 'Missing or invalid authorization token'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'status': 401,
            'message': 'Token validation failed',
            'error': str(error)
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'status': 401,
            'message': 'Token has expired',
            'error': 'Please log in again'
        }), 401

    register_blueprints(app)

    # Database initialization
    with app.app_context():
        initialize_database(app)
        
    return app

def register_blueprints(app):
    from api.auth.routes import auth_bp
    from api.users.routes import users_bp
    from api.crimes.routes import crimes_bp
    from api.chat.routes import chat_bp
    from api.admin.routes import admin_bp
    from api.authority import authority_bp  # Import from the module, not routes

    blueprints = [
        (auth_bp, '/api/auth'),
        (users_bp, '/api/users'),
        (crimes_bp, '/api/crimes'),
        (chat_bp, '/api/chat'),
        (admin_bp, '/api/admin'),
        (authority_bp, '/api/authority') 
        
    ]

    for bp, url_prefix in blueprints:
        app.register_blueprint(bp, url_prefix=url_prefix)


def initialize_database(app):
    from models.admin import Admin
    from models.user import User, Authority
    from models.crime import CrimeReport, CrimeImage
    from models.chat import ChatRoom, ChatMessage, ChatParticipant
    from models.complaint_assignment import ComplaintAssignment
  
    db.create_all()
    print("All tables created successfully!")

    # Create main admin if not exists
    if not Admin.query.filter_by(username=Config.MAIN_ADMIN_USERNAME).first():
        admin = Admin(
            username=Config.MAIN_ADMIN_USERNAME,
            email=Config.MAIN_ADMIN_EMAIL,
            password=Config.MAIN_ADMIN_PASSWORD  # Already hashed in config
        )
        db.session.add(admin)
        db.session.commit()
        print("Main admin created.")

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
