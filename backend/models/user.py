from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # 'user', 'admin', 'authority'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reports = db.relationship('CrimeReport', backref='reporter', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Authority(db.Model):
    __tablename__ = 'authorities'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    badge_number = db.Column(db.String(50), unique=True)
    department = db.Column(db.String(100))
    jurisdiction = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    is_verified = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Authority {self.badge_number}>'
