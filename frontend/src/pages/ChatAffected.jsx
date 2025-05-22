import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import { chatService } from '../services/api';

const ChatAffected = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await chatService.getChatRooms();
        setChatRooms(response.data.rooms || []);
        setLoading(false);
        
        // If a specific room ID is passed in the URL, select it
        const params = new URLSearchParams(location.search);
        const roomId = params.get('roomId');
        
        if (roomId) {
          const room = response.data.rooms?.find(r => r.id === parseInt(roomId, 10));
          if (room) {
            setSelectedRoom(room);
          }
        }
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setError("Failed to load chat rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [location.search]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // Update the URL to include the selected room ID
    navigate(`/chat-affected?roomId=${room.id}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chat with Affected Users</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room selection sidebar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg text-gray-700 mb-4">Active Conversations</h2>
          
          {chatRooms.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No active conversations found.
            </p>
          ) : (
            <div className="space-y-3">
              {chatRooms.map(room => (
                <div 
                  key={room.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedRoom?.id === room.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${room.unread_count > 0 ? 'border-l-4 border-l-yellow-500' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <h3 className="font-medium">{room.crime_title || 'Untitled Crime Report'}</h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    Complaint ID: {room.complaint_id || 'Not assigned'}
                  </p>
                  
                  {room.other_participant && (
                    <p className="text-sm text-gray-500 truncate">
                      User: {room.other_participant.name || 'Anonymous'}
                    </p>
                  )}
                  
                  {room.last_message && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">Last message:</p>
                      <p className="text-sm text-gray-600 truncate">{room.last_message}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {room.last_message_time ? new Date(room.last_message_time).toLocaleDateString() : 'No messages'}
                    </span>
                    
                    {room.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <Chat 
              roomId={selectedRoom.id}
              userType="authority"
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-96">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
              <p className="text-gray-500 text-center">
                Choose a conversation from the sidebar to respond to users' questions and concerns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAffected;