import os
from werkzeug.security import generate_password_hash
from datetime import timedelta

class Config:
    # Core Flask Config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key_here')
    
    # Database Config
    SQLALCHEMY_DATABASE_URI = 'sqlite:///crime_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key_here')
    JWT_TOKEN_LOCATION = ['headers']
    JWT_VERIFY_SUB = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    # Admin Credentials (DEV ONLY - remove in production)
    MAIN_ADMIN_USERNAME = 'CrimeMasterGogo'
    MAIN_ADMIN_EMAIL = 'gogo@crimemaster.com'
    MAIN_ADMIN_PASSWORD = generate_password_hash('admin123')  # Using werkzeug's secure hashing
