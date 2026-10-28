import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/api';

const Chat = ({ roomId, crimeId, userType }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState(null);
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages and set up polling
  useEffect(() => {
    let fetchInterval;
    
    const fetchMessages = async () => {
      try {
        if (!roomId && !crimeId) {
          setError('No room or crime ID provided');
          setLoading(false);
          return;
        }
        
        // If we don't have a room ID but have a crime ID, get/create a room first
        if (!roomId && crimeId) {
          const roomResponse = await chatService.getChatRoomByCrime(crimeId);
          setRoom(roomResponse.data.room);
          const messagesResponse = await chatService.getMessages(roomResponse.data.room.id);
          setMessages(messagesResponse.data.messages || []);
        } else {
          // We have a room ID, just fetch messages
          const messagesResponse = await chatService.getMessages(roomId);
          setMessages(messagesResponse.data.messages || []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError(err.response?.data?.message || 'Failed to load chat data');
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling every 5 seconds
    fetchInterval = setInterval(fetchMessages, 5000);
    
    return () => {
      clearInterval(fetchInterval);
    };
  }, [roomId, crimeId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setSending(true);
      const targetRoomId = roomId || room?.id;
      
      if (!targetRoomId) {
        setError('No chat room available');
        setSending(false);
        return;
      }
      
      await chatService.sendMessage(targetRoomId, message);
      setMessage('');
      
      // Fetch latest messages immediately after sending
      const messagesResponse = await chatService.getMessages(targetRoomId);
      setMessages(messagesResponse.data.messages || []);
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="border-b pb-2 mb-3">
          <h3 className="text-lg font-semibold text-indigo-600">
            {room?.crime_title ? `Chat: ${room.crime_title}` : 'Crime Chat'}
          </h3>
          {room?.complaint_id && (
            <p className="text-sm text-gray-500">
              Complaint ID: {room.complaint_id}
            </p>
          )}
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-md h-80">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.sender_type === userType;
              return (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[75%] ${
                      isCurrentUser 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} /> {/* Anchor for auto-scroll */}
        </div>
        
        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={sending}
          />
          <button
            type="submit"
            className={`bg-indigo-600 text-white px-4 py-2 rounded-r-md ${
              sending ? 'opacity-70' : 'hover:bg-indigo-700'
            }`}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;