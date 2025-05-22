# Initialize blueprint for authority routes
from flask import Blueprint

authority_bp = Blueprint('authority', __name__)

# Import routes after creating the blueprint to avoid circular imports
from . import routes