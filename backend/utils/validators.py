from wtforms.validators import ValidationError
from flask import request, jsonify
from functools import wraps

def validate_coordinates(form, field):
    """Validate that the field contains valid coordinates."""
    try:
        value = float(field.data)
        if value < -90 or value > 90:
            raise ValidationError('Coordinates must be between -90 and 90 degrees.')
    except (ValueError, TypeError):
        raise ValidationError('Coordinates must be a valid number.')

def validate_crime_category(form, field):
    """Validate crime category against allowed values."""
    allowed_categories = [
        'theft', 'assault', 'vandalism', 'burglary', 
        'robbery', 'fraud', 'harassment', 'other'
    ]
    if field.data.lower() not in allowed_categories:
        raise ValidationError(f'Category must be one of: {", ".join(allowed_categories)}')

def validate_severity(form, field):
    """Validate severity level (1-5)."""
    try:
        value = int(field.data)
        if value < 1 or value > 5:
            raise ValidationError('Severity must be between 1 and 5.')
    except (ValueError, TypeError):
        raise ValidationError('Severity must be a number between 1 and 5.')

def json_required(f):
    """Decorator to check if request contains JSON data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 400
        return f(*args, **kwargs)
    return decorated_function

def validate_required_fields(required_fields):
    """Decorator to validate required fields in JSON request."""
    def decorator(f):
        @wraps(f)
        @json_required
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    "error": "Missing required fields", 
                    "fields": missing_fields
                }), 400
            return f(*args, **kwargs)
        return decorated_function
    return decorator
