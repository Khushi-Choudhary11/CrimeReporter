from extensions import db
from datetime import datetime

class ChatRoom(db.Model):
    __tablename__ = 'chat_rooms'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(100), unique=True, nullable=False)  # Format: crime-{crime_report_id}
    crime_report_id = db.Column(db.Integer, db.ForeignKey('crime_report.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='room', lazy='dynamic', cascade="all, delete-orphan")
    participants = db.relationship('ChatParticipant', backref='room', lazy='dynamic', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<ChatRoom {self.room_id}>'

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('chat_rooms.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False)  # 'user' or 'authority'
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<ChatMessage {self.id}>'

class ChatParticipant(db.Model):
    __tablename__ = 'chat_participants'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('chat_rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'user' or 'authority'
    last_read = db.Column(db.DateTime, default=datetime.utcnow)
    # Add to ChatParticipant model definition
    __table_args__ = (
    db.Index('idx_room_user', 'room_id', 'user_id'),
    db.Index('idx_user_rooms', 'user_id', 'room_id'),
)
 
    def __repr__(self):
        return f'<ChatParticipant {self.user_id} ({self.user_type})>'
