from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.crime import CrimeReport
from models.user import User, Authority
from extensions import db
from utils.jwt_utils import authority_required
from datetime import datetime
import uuid
from models.complaint_assignment import ComplaintAssignment

# Import the blueprint from __init__.py
from api.authority import authority_bp

# Get all crimes by pincode
@authority_bp.route('/crimes/pincode/<pincode>', methods=['GET'])
@jwt_required()
@authority_required
def get_crimes_by_pincode(pincode):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        crimes = CrimeReport.query.filter_by(pincode=pincode).order_by(
            CrimeReport.created_at.desc()
        ).paginate(page=page, per_page=per_page)
        
        crime_list = []
        for crime in crimes.items:
            # Get username directly from the crime report
            username = crime.username
            if not username and crime.user_id and not crime.is_anonymous:
                # Fallback to user lookup if username not directly stored
                user = User.query.get(crime.user_id)
                username = user.username if user else "Unknown"
                
            crime_list.append({
                'id': crime.id,
                'complaint_id': crime.complaint_id,
                'username': username if not crime.is_anonymous else "Anonymous",
                'title': crime.title,
                'pincode': crime.pincode,
                'description': crime.description,
                'category': crime.category,
                'severity': crime.severity,
                'status': crime.status,
                'location': {
                    'latitude': crime.latitude,
                    'longitude': crime.longitude
                },
                'timestamp': crime.created_at.isoformat(),
                'is_anonymous': crime.is_anonymous
            })
            
        return jsonify({
            'crimes': crime_list,
            'total': crimes.total,
            'pages': crimes.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update crime status
@authority_bp.route('/crimes/<int:crime_id>/update', methods=['POST'])
@jwt_required()
@authority_required
def update_crime_status(crime_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        feedback = data.get('feedback', '')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
            
        valid_statuses = ['pending', 'investigating', 'resolved', 'closed']
        if new_status.lower() not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        crime = CrimeReport.query.get_or_404(crime_id)
        crime.status = new_status.lower()
        crime.updated_at = datetime.utcnow()
        
        # Here you could also store the feedback in a separate table if needed
        
        db.session.commit()
        
        return jsonify({
            'message': 'Crime status updated successfully',
            'crime_id': crime_id,
            'new_status': new_status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Get authority dashboard data
@authority_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@authority_required
def get_authority_dashboard():
    try:
        current_user = get_jwt_identity()
        print(f"Current user: {current_user}")  # Debug log
        
        # Query all crimes
        query = CrimeReport.query
        
        # Get counts
        total_crimes = query.count()
        pending_crimes = query.filter_by(status='pending').count()
        investigating_crimes = query.filter_by(status='investigating').count()
        resolved_crimes = query.filter_by(status='resolved').count()
        
        print(f"Crime counts: Total={total_crimes}, Pending={pending_crimes}, "
              f"Investigating={investigating_crimes}, Resolved={resolved_crimes}")  # Debug log

        # Get recent crimes
        recent_crimes = query.order_by(CrimeReport.created_at.desc()).limit(10).all()
        
        recent_crime_list = []
        for crime in recent_crimes:
            # Ensure complaint_id exists
            if not crime.complaint_id:
                crime.complaint_id = f"CR-{crime.created_at.year}-{crime.id:06d}"
                db.session.add(crime)
            
            recent_crime_list.append({
                'id': crime.id,
                'complaint_id': crime.complaint_id,
                'title': crime.title,
                'description': crime.description,
                'pincode': crime.pincode or 'N/A',
                'status': crime.status,
                'created_at': crime.created_at.isoformat() if crime.created_at else None,
                'timestamp': crime.created_at.isoformat() if crime.created_at else None,
                'user_id': crime.user_id,
                'is_anonymous': crime.is_anonymous
            })
        
        # Get jurisdiction areas
        authority = Authority.query.filter_by(user_id=current_user['id']).first()
        if not authority:
            return jsonify({'error': 'Authority not found'}), 404
            
        jurisdiction = authority.jurisdiction if authority else []
        
        db.session.commit()
        
        response_data = {
            'total_crimes': total_crimes,
            'pending_crimes': pending_crimes,
            'investigating_crimes': investigating_crimes,
            'resolved_crimes': resolved_crimes,
            'recent_crimes': recent_crime_list,
            'jurisdiction': jurisdiction
        }
        
        print("Sending response:", response_data)  # Debug log
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in dashboard: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

# Get assigned complaints
@authority_bp.route('/assigned-complaints', methods=['GET'])
@jwt_required()
@authority_required
def get_assigned_complaints():
    try:
        current_user = get_jwt_identity()
        authority = Authority.query.filter_by(user_id=current_user['id']).first()
        if not authority:
            return jsonify({'error': 'Authority not found'}), 404

        # Use subquery to get first assignment for each crime report
        subquery = db.session.query(
            ComplaintAssignment.crime_report_id,
            db.func.min(ComplaintAssignment.id).label('first_assignment_id')
        ).filter(
            ComplaintAssignment.authority_id == authority.id,
            ComplaintAssignment.status == 'pending'
        ).group_by(ComplaintAssignment.crime_report_id).subquery()

        # Join with main query to get full details
        assignments = db.session.query(ComplaintAssignment, CrimeReport)\
            .join(CrimeReport, ComplaintAssignment.crime_report_id == CrimeReport.id)\
            .join(subquery, ComplaintAssignment.id == subquery.c.first_assignment_id)\
            .all()

        complaints = [{
            'assignment_id': assign.id,
            'report_id': report.id,
            'complaint_id': report.complaint_id,
            'title': report.title,
            'description': report.description,
            'severity': report.severity,
            'status': assign.status,
            'assigned_at': assign.assigned_at.isoformat() if assign.assigned_at else None
        } for assign, report in assignments]

        print(f"Found {len(complaints)} unique assigned complaints")
        return jsonify(complaints), 200

    except Exception as e:
        print(f"Error in get_assigned_complaints: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Accept or reject complaint
from datetime import datetime

@authority_bp.route('/complaint/<int:assignment_id>/accept', methods=['POST'])
@jwt_required()
@authority_required
def accept_complaint(assignment_id):
    current_user = get_jwt_identity()
    authority = Authority.query.filter_by(user_id=current_user['id']).first()
    assignment = ComplaintAssignment.query.get_or_404(assignment_id)
    if assignment.authority_id != authority.id:
        return jsonify({'error': 'Unauthorized'}), 403
    assignment.status = 'accepted'
    assignment.responded_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Complaint accepted'}), 200

@authority_bp.route('/complaint/<int:assignment_id>/reject', methods=['POST'])
@jwt_required()
@authority_required
def reject_complaint(assignment_id):
    current_user = get_jwt_identity()
    authority = Authority.query.filter_by(user_id=current_user['id']).first()
    assignment = ComplaintAssignment.query.get_or_404(assignment_id)
    if assignment.authority_id != authority.id:
        return jsonify({'error': 'Unauthorized'}), 403
    assignment.status = 'rejected'
    assignment.responded_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Complaint rejected'}), 200

# Generate a unique complaint ID
def generate_complaint_id():
    # Format: CR-YEAR-RANDOM
    year = datetime.utcnow().strftime('%Y')
    random_part = uuid.uuid4().hex[:6].upper()
    return f"CR-{year}-{random_part}"

# Get registered pincodes
@authority_bp.route('/pincodes', methods=['GET'])
@jwt_required()
@authority_required
def get_registered_pincodes():
    try:
        # Get unique pincodes from crime reports
        pincodes = db.session.query(CrimeReport.pincode)\
            .distinct()\
            .filter(CrimeReport.pincode.isnot(None))\
            .order_by(CrimeReport.pincode)\
            .all()
        
        # Extract pincodes from result tuples and remove duplicates
        pincode_list = sorted(list(set([p[0] for p in pincodes if p[0]])))
        
        return jsonify({
            'pincodes': pincode_list,
            'count': len(pincode_list)
        }), 200
        
    except Exception as e:
        print(f"Error fetching pincodes: {str(e)}")
        return jsonify({'error': str(e)}), 500