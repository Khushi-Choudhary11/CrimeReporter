from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from utils.jwt_utils import admin_required
from extensions import db
from models.user import User, Authority
from models.crime import CrimeReport
from models.complaint_assignment import ComplaintAssignment
from datetime import datetime, timedelta
from sqlalchemy import func
import io
import csv
from flask_cors import cross_origin

admin_bp = Blueprint('admin', __name__)
start_time = datetime.utcnow()

# Dashboard Statistics
@admin_bp.route('/test', methods=['GET'])
# @jwt_required()
# @admin_required
def test_route():
    return jsonify({'message': 'Test successful'}), 200
@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    stats = {
        'userCount': User.query.count(),
        'authorityCount': Authority.query.count(),
        'reportCount': CrimeReport.query.count(),
        'recentReports': CrimeReport.query.filter(
            CrimeReport.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
    }
    return jsonify(stats), 200

# Get All Users
@admin_bp.route('/users', methods=['GET'])
# @jwt_required()
# @admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'isActive': user.is_active,
        'createdAt': user.created_at.isoformat()
    } for user in users]), 200

# Toggle User Active Status
@admin_bp.route('/users/<int:user_id>/status', methods=['PATCH'])
# @jwt_required()
# @admin_required
def update_user_status(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = request.json.get('status', user.is_active)
    db.session.commit()
    return jsonify({
        'message': 'User status updated',
        'userId': user_id,
        'newStatus': user.is_active
    }), 200

# Delete User
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted', 'userId': user_id}), 200

# Authority Verification Requests
@admin_bp.route('/authorities/requests', methods=['GET'])
@jwt_required()
@admin_required
def get_authority_requests():
    requests = Authority.query.filter_by(is_verified=False).all()
    return jsonify([{
        'id': auth.id,
        'userId': auth.user_id,
        'badgeNumber': auth.badge_number,
        'department': auth.department,
        'submittedAt': auth.created_at.isoformat()
    } for auth in requests]), 200

# Get All Authorities
@admin_bp.route('/authorities', methods=['GET'])
# @jwt_required()
# @admin_required
def get_all_authorities():
    authorities = Authority.query.all()
    return jsonify([{
        'id': auth.id,
        'username': auth.user.username,
        'email': auth.user.email,
        'badgeNumber': auth.badge_number,
        'department': auth.department,
        'isActive': auth.user.is_active,
        'createdAt': auth.created_at.isoformat()
    } for auth in authorities]), 200

# Toggle Authority Active Status
@admin_bp.route('/authorities/<int:auth_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_authority_status(auth_id):
    auth = Authority.query.get_or_404(auth_id)
    auth.user.is_active = request.json.get('status', auth.user.is_active)
    db.session.commit()
    return jsonify({
        'message': 'Authority status updated',
        'authorityId': auth_id,
        'newStatus': auth.user.is_active
    }), 200

# Crime Analytics
@admin_bp.route('/analytics', methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True)  
@jwt_required(optional=True) 
@admin_required
def get_crime_analytics():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        time_range = request.args.get('timeRange', 'month')
        
        # Calculate date range
        end_date = datetime.utcnow()
        if time_range == 'week':
            start_date = end_date - timedelta(days=7)
        elif time_range == 'month':
            start_date = end_date - timedelta(days=30)
        else:  # year
            start_date = end_date - timedelta(days=365)
            
        print(f"Analyzing crimes from {start_date} to {end_date}")  # Debug log
            
        # Base query for date range
        base_query = CrimeReport.query.filter(
            CrimeReport.created_at.between(start_date, end_date)
        )
        
        # Get total counts
        total_reports = base_query.count()
        solved_cases = base_query.filter(CrimeReport.status == 'resolved').count()
        pending_cases = base_query.filter(CrimeReport.status == 'pending').count()
        critical_cases = base_query.filter(CrimeReport.severity >= 4).count()
        
        print(f"Counts - Total: {total_reports}, Solved: {solved_cases}, "
              f"Pending: {pending_cases}, Critical: {critical_cases}")  # Debug log
        
        # Crimes by type
        crimes_by_type = db.session.query(
            CrimeReport.category.label('type'),
            func.count(CrimeReport.id).label('count')
        ).filter(
            CrimeReport.created_at.between(start_date, end_date)
        ).group_by(CrimeReport.category).all()
        
        # Crimes by status
        crimes_by_status = db.session.query(
            CrimeReport.status,
            func.count(CrimeReport.id).label('count')
        ).filter(
            CrimeReport.created_at.between(start_date, end_date)
        ).group_by(CrimeReport.status).all()
        
        # Crimes by severity (status code)
        crimes_by_code = db.session.query(
            CrimeReport.severity.label('statusCode'),
            func.count(CrimeReport.id).label('count')
        ).filter(
            CrimeReport.created_at.between(start_date, end_date)
        ).group_by(CrimeReport.severity).all()
        
        response_data = {
            'totalReports': total_reports,
            'solvedCases': solved_cases,
            'pendingCases': pending_cases,
            'criticalCases': critical_cases,
            'crimesByType': [
                {'type': t[0], 'count': t[1]} for t in crimes_by_type
            ],
            'crimesByStatus': [
                {'status': s[0], 'count': s[1]} for s in crimes_by_status
            ],
            'crimesByCode': [
                {'statusCode': c[0], 'count': c[1]} for c in crimes_by_code
            ]
        }
        
        print(f"Sending analytics response: {response_data}")  # Debug log
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

def category_distribution(reports):
    distribution = {}
    for report in reports:
        distribution[report.category] = distribution.get(report.category, 0) + 1
    return distribution

def time_distribution(reports):
    timeline = {}
    for report in reports:
        hour = report.created_at.hour
        timeline[hour] = timeline.get(hour, 0) + 1
    return timeline

# System Settings
admin_settings = {
    'maxReportSeverity': 5,
    'notificationThreshold': 3,
    'dataRetentionDays': 90
}

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_settings():
    return jsonify(admin_settings), 200

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@admin_required
def update_admin_settings():
    data = request.json
    admin_settings.update(data)
    return jsonify({'message': 'Settings updated', 'settings': admin_settings}), 200

# Audit Logs (Dummy)
@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required
def get_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    logs = [{
        'id': i,
        'action': f'Action {i}',
        'userId': i % 10,
        'timestamp': (datetime.utcnow() - timedelta(hours=i)).isoformat()
    } for i in range(100)]
    return jsonify({
        'logs': logs[(page - 1) * per_page: page * per_page],
        'total': 100,
        'page': page,
        'perPage': per_page
    }), 200

# CSV Export
@admin_bp.route('/export', methods=['POST'])
@jwt_required()
@admin_required
def export_data():
    data_type = request.json.get('type', 'users')
    csv_data = io.StringIO()
    writer = csv.writer(csv_data)

    if data_type == 'users':
        writer.writerow(['ID', 'Username', 'Email', 'Role'])
        for user in User.query.all():
            writer.writerow([user.id, user.username, user.email, user.role])
    elif data_type == 'crimes':
        writer.writerow(['ID', 'Category', 'Timestamp', 'Status'])
        for report in CrimeReport.query.all():
            writer.writerow([report.id, report.category, report.created_at.isoformat(), report.status])
    
    csv_data.seek(0)
    return send_file(
        io.BytesIO(csv_data.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'{data_type}_export.csv'
    ), 200

# System Health
@admin_bp.route('/system/health', methods=['GET'])
@jwt_required()
@admin_required
def system_health():
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'uptime': str(datetime.utcnow() - start_time),
        'version': '1.0.0'
    }), 200

@admin_bp.route('/api/admin/crime-analytics', methods=['GET'], endpoint='admin_crime_analytics')
def get_admin_crime_analytics():
    try:
        # Summary counts
        total_reports = CrimeReport.query.count()
        pending_reports = CrimeReport.query.filter_by(status='Pending').count()
        accepted_reports = CrimeReport.query.filter_by(status='Accepted').count()
        completed_reports = CrimeReport.query.filter_by(status='Completed').count()

        # Full list of crime reports
        crime_reports = CrimeReport.query.all()
        report_list = []
        for report in crime_reports:
            report_list.append({
                'id': report.id,
                'crime_type': report.crime_type,
                'description': report.description,
                'pincode': report.pincode,
                'status': report.status,
                'timestamp': report.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return jsonify({
            'summary': {
                'totalReports': total_reports,
                'pendingReports': pending_reports,
                'acceptedReports': accepted_reports,
                'completedReports': completed_reports,
            },
            'allReports': report_list
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@admin_bp.route('/admin/complaints', methods=['GET'])
def get_all_complaints():
    try:
        status = request.args.get('status')
        if status:
            assignments = ComplaintAssignment.query.filter_by(status=status).all()
        else:
            assignments = ComplaintAssignment.query.all()

        result = []
        for a in assignments:
            report = a.crime_report
            authority = a.authority
            user = getattr(report, 'user', None)

            result.append({
                'assignment_id': a.id,
                'complaint_id': report.id,  # using as unique ID
                'crime_report_title': getattr(report, 'title', 'N/A'),
                'crime_report_description': getattr(report, 'description', 'N/A'),
                'location': getattr(report, 'location', 'N/A'),
                'pincode': getattr(report, 'pincode', 'N/A'),
                'reporter_name': getattr(user, 'name', 'N/A') if user else 'N/A',
                'contact_info': getattr(user, 'contact', 'N/A') if user else 'N/A',
                'authority_name': getattr(authority, 'name', 'Unassigned'),
                'status': a.status,
                'assigned_at': a.assigned_at.strftime('%Y-%m-%d %H:%M:%S') if a.assigned_at else 'N/A',
                'responded_at': a.responded_at.strftime('%Y-%m-%d %H:%M:%S') if a.responded_at else None
            })

        return jsonify(result), 200
    except Exception as e:
        print("Error in /admin/complaints:", e)
        return jsonify({'error': 'Internal Server Error'}), 500
