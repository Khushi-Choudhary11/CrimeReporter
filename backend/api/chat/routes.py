from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.chat import ChatRoom, ChatMessage, ChatParticipant
from models.crime import CrimeReport
from models.user import User, Authority
from extensions import db
from api.chat import chat_bp

@chat_bp.route('/rooms', methods=['GET'])
@jwt_required()
def get_chat_rooms():
    """Get all chat rooms for the current user"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user.get('id') if isinstance(current_user, dict) else current_user
        
        # Get rooms where the user is a participant
        participant_rooms = ChatParticipant.query.filter_by(user_id=user_id).all()
        room_ids = [p.room_id for p in participant_rooms]
        
        rooms = ChatRoom.query.filter(ChatRoom.id.in_(room_ids)).all()
        
        result = []
        for room in rooms:
            # Get the associated crime report
            crime_report = None
            if room.crime_report_id:
                crime_report = CrimeReport.query.get(room.crime_report_id)
            
            # Get the other participant (not the current user)
            other_participant = ChatParticipant.query.filter(
                ChatParticipant.room_id == room.id,
                ChatParticipant.user_id != user_id
            ).first()
            
            other_user = None
            if other_participant:
                other_user = User.query.get(other_participant.user_id)
            
            # Get the last message
            last_message = ChatMessage.query.filter_by(room_id=room.id).order_by(ChatMessage.created_at.desc()).first()
            
            # Count unread messages
            unread_count = ChatMessage.query.filter_by(
                room_id=room.id,
                is_read=False
            ).filter(ChatMessage.sender_id != user_id).count()
            
            result.append({
                'id': room.id,
                'room_id': room.room_id,
                'crime_report_id': room.crime_report_id,
                'crime_title': crime_report.title if crime_report else None,
                'complaint_id': crime_report.complaint_id if crime_report else None,
                'other_participant': {
                    'id': other_user.id if other_user else None,
                    'name': other_user.username if other_user else None,
                    'type': other_participant.user_type if other_participant else None
                } if other_participant else None,
                'last_message': last_message.message if last_message else None,
                'last_message_time': last_message.created_at.isoformat() if last_message else None,
                'unread_count': unread_count,
                'created_at': room.created_at.isoformat()
            })
            
        return jsonify({
            'rooms': result
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/room/crime/<int:crime_id>', methods=['GET'])
@jwt_required()
def get_chat_room_by_crime(crime_id):
    try:
        
        current_user = get_jwt_identity()
        user_id = current_user.get('id') 
        
        # Check if the crime report exists
        crime_report = CrimeReport.query.get_or_404(crime_id)
        
        # Check if user is authorized (either the reporter or an authority)
        is_reporter = crime_report.user_id == user_id
        is_authority = Authority.query.filter_by(user_id=user_id).first() is not None
        
        if not (is_reporter or is_authority):
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Define the room ID format
        room_id = f"crime-{crime_id}"
        
        # Check if room already exists
        room = ChatRoom.query.filter_by(room_id=room_id).first()
        
        if not room:
            # Create a new room
            room = ChatRoom(
                room_id=room_id,
                crime_report_id=crime_id
            )
            db.session.add(room)
            db.session.flush()  # Flush to get the id without committing
            
            # Add participants
            user_type = 'user'
            # Get the crime reporter if it's an authority
            reporter_id = crime_report.user_id
            
            if is_authority:
                # Current user is authority
                user_type = 'authority'
                
                # Add reporter as participant
                if reporter_id:
                    reporter_participant = ChatParticipant(
                        room_id=room.id,
                        user_id=reporter_id,
                        user_type='user'
                    )
                    db.session.add(reporter_participant)
            
            # Add current user as participant
            current_user_participant = ChatParticipant(
                room_id=room.id,
                user_id=user_id,
                user_type=user_type
            )
            db.session.add(current_user_participant)
            
            # If the current user is the reporter, add an authority
            if is_reporter:
                # Find an authority to assign to this chat
                # This is a simple implementation - you might want to improve this
                # by assigning to authorities based on jurisdiction, workload, etc.
                authority = Authority.query.first()
                if authority:
                    authority_participant = ChatParticipant(
                        room_id=room.id,
                        user_id=authority.user_id,
                        user_type='authority'
                    )
                    db.session.add(authority_participant)
            
            db.session.commit()
        
        # Get all participants in the room
        participants = ChatParticipant.query.filter_by(room_id=room.id).all()
        participant_details = []
        
        for p in participants:
            user = User.query.get(p.user_id)
            participant_details.append({
                'id': p.user_id,
                'name': user.username if user else None,
                'type': p.user_type
            })
        
        return jsonify({
            'room': {
                'id': room.id,
                'room_id': room.room_id,
                'crime_report_id': room.crime_report_id,
                'crime_title': crime_report.title,
                'complaint_id': crime_report.complaint_id,
                'participants': participant_details,
                'created_at': room.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/room/<int:room_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(room_id):
    """Get all messages from a chat room"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user.get('id') if isinstance(current_user, dict) else current_user
        
        # Check if user is a participant
        participant = ChatParticipant.query.filter(
    (ChatParticipant.room_id == room_id) &
           (ChatParticipant.user_id == user_id)
        ).first()
  
        
        if not participant:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get messages
        messages = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.created_at.asc()).all()
        
        # Mark messages as read
        unread_messages = ChatMessage.query.filter_by(
            room_id=room_id,
            is_read=False
        ).filter(ChatMessage.sender_id != user_id).all()
        
        for msg in unread_messages:
            msg.is_read = True
        
        # Update last read time
        participant.last_read = db.func.now()
        db.session.commit()
        
        result = []
        for msg in messages:
            sender = User.query.get(msg.sender_id)
            
            result.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'sender_name': sender.username if sender else None,
                'sender_type': msg.sender_type,
                'message': msg.message,
                'created_at': msg.created_at.isoformat(),
                'is_read': msg.is_read
            })
        
        return jsonify({
            'messages': result
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/room/<int:room_id>/send', methods=['POST'])
@jwt_required()
def send_message(room_id):
    """Send a message to a chat room"""
    try:
        data = request.get_json()
        message_text = data.get('message')
        
        if not message_text or not message_text.strip():
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        current_user = get_jwt_identity()
        user_id = current_user.get('id') if isinstance(current_user, dict) else current_user
        
        # Check if user is a participant
        participant = ChatParticipant.query.filter_by(
            room_id=room_id,
            user_id=user_id
        ).first()
        
        if not participant:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Create new message
        message = ChatMessage(
            room_id=room_id,
            sender_id=user_id,
            sender_type=participant.user_type,
            message=message_text.strip()
        )
        
        db.session.add(message)
        db.session.commit()
        
        sender = User.query.get(user_id)
        
        return jsonify({
            'message': {
                'id': message.id,
                'sender_id': message.sender_id,
                'sender_name': sender.username if sender else None,
                'sender_type': message.sender_type,
                'message': message.message,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
