from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.crime import CrimeReport, CrimeImage
from app import db
from sqlalchemy.exc import SQLAlchemyError
from utils.validators import validate_required_fields
from api.crimes import crimes_bp
from api.authority.routes import generate_complaint_id
from models.user import User, Authority
from ml.text_analyzer import analyze_crime_text, determine_severity, combine_severity_scores
from models.complaint_assignment import ComplaintAssignment  

@crimes_bp.route('/report', methods=['POST'])
@jwt_required()
@validate_required_fields(['latitude', 'longitude', 'description', 'category', 'pincode'])
def report_crime():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # 1. Get user severity from form data
        user_severity = int(data.get('severity', 3))
        
        # 2. Analyze crime text and get model severity
        analysis_result = analyze_crime_text(data.get('description', ''))
        model_severity = determine_severity(data.get('description', ''))
        
        # 3. Combine severities to get final score
        final_severity = combine_severity_scores(user_severity, model_severity)
        
        print(f"Severity Scores - User: {user_severity}, Model: {model_severity}, Final: {final_severity}")
        
        # Generate complaint ID
        complaint_id = generate_complaint_id()
        
        # Create new report with all severity scores
        new_report = CrimeReport(
            complaint_id=complaint_id,
            username=current_user.get('username', 'Anonymous'),
            title=data.get('title', 'Unnamed Report'),
            description=data.get('description', ''),
            latitude=float(data.get('latitude', 0)),
            longitude=float(data.get('longitude', 0)),
            category=data.get('category', 'Other'),
            pincode=str(data.get('pincode', '')),
            severity=final_severity,  # Combined severity as main severity
            user_severity=user_severity,  # Store user's input
            model_severity=model_severity,  # Store model's assessment
            status='pending',
            is_anonymous=bool(data.get('is_anonymous', False)),
            user_id=None if data.get('is_anonymous', False) else current_user.get('id')
        )
        
        db.session.add(new_report)
        db.session.flush()  # Get ID without committing
        
        try:
            # Use analysis result to get recommended authorities
            recommended_authorities = analysis_result.get('authorities', ['Police'])
            
            if not recommended_authorities:
                recommended_authorities = [a.department for a in Authority.query.all()]
            
            print("Recommended authorities:", recommended_authorities)
            
            # Create assignments
            for authority_name in recommended_authorities:
                authority = Authority.query.filter(
                    Authority.department.ilike(f"%{authority_name}%")
                ).first()
                
                if authority:
                    assignment = ComplaintAssignment(
                        crime_report_id=new_report.id,
                        authority_id=authority.id,
                        status='pending'
                    )
                    db.session.add(assignment)
            
            db.session.commit()
            
            return jsonify({
                'message': 'Crime reported successfully',
                'report_id': new_report.id,
                'complaint_id': complaint_id,
                'severity_analysis': {
                    'user_severity': user_severity,
                    'model_severity': model_severity,
                    'final_severity': final_severity,
                    'analysis': analysis_result
                },
                'assigned_authorities': recommended_authorities
            }), 201
            
        except Exception as e:
            print(f"Error in authority assignment: {str(e)}")
            db.session.rollback()
            return jsonify({"error": f"Failed to assign authorities: {str(e)}"}), 500
            
    except Exception as e:
        print(f"Error in report_crime: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Failed to submit report: {str(e)}"}), 500

@crimes_bp.route('/nearby', methods=['GET'])
def get_nearby_crimes():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 5, type=int)
    
    # Print debug info
    print(f"Fetching crimes near {lat}, {lng} with radius {radius}km")
    
    # Query all reports for now
    reports = CrimeReport.query.all()
    print(f"Found {len(reports)} total reports")
    
    return jsonify({
        'reports': [{
            'id': report.id,
            'title': report.title,
            'type': report.category,
            'category': report.category,
            'description': report.description,
            'location': f"{report.latitude}, {report.longitude}",
            'reportedAt': report.created_at.isoformat(),
            'created_at': report.created_at.isoformat(),
            'latitude': report.latitude,
            'longitude': report.longitude,
            'severity': report.severity
        } for report in reports]
    }), 200


@crimes_bp.route('/user-history', methods=['GET'])
@jwt_required()
def get_user_history():
    try:
        current_user = get_jwt_identity()
        print(f"Getting history for user: {current_user}")  # Debug log

        # Handle both dict and direct ID cases
        user_id = current_user.get('id') if isinstance(current_user, dict) else current_user

        if not user_id:
            return jsonify({"error": "User ID not found"}), 400

        # Query reports for this user, including anonymous ones
        reports = CrimeReport.query.filter(
            (CrimeReport.user_id == user_id) | 
            (CrimeReport.username == current_user.get('username'))
        ).order_by(CrimeReport.created_at.desc()).all()

        print(f"Found {len(reports)} reports")  # Debug log

        return jsonify({
            'reports': [{
                'id': report.id,
                'complaint_id': report.complaint_id,
                'title': report.title,
                'description': report.description,
                'category': report.category,
                'severity': report.severity,
                'status': report.status,
                'pincode': report.pincode,
                'is_anonymous': report.is_anonymous,
                'created_at': report.created_at.isoformat() if report.created_at else None,
                'images': report.images if hasattr(report, 'images') else []
            } for report in reports]
        }), 200

    except Exception as e:
        print(f"Error in get_user_history: {str(e)}")  # Debug log
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
