from extensions import db
from datetime import datetime

class ComplaintAssignment(db.Model):
    __tablename__ = 'complaint_assignments'

    id = db.Column(db.Integer, primary_key=True)
    crime_report_id = db.Column(db.Integer, db.ForeignKey('crime_report.id'), nullable=False)
    authority_id = db.Column(db.Integer, db.ForeignKey('authorities.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, accepted, rejected
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime, nullable=True)

    crime_report = db.relationship('CrimeReport', backref='assignments')
    authority = db.relationship('Authority', backref='assignments')

    def __repr__(self):
        return f'<ComplaintAssignment report={self.crime_report_id} authority={self.authority_id} status={self.status}>'
1