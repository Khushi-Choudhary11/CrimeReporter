import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import { chatService, crimeService } from '../services/api';

const ChatAuthority = () => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const data = await crimeService.getUserCrimeHistory();
        // Access reports directly from the data
        setUserReports(data.reports || []);
        setLoading(false);
        
        // If a specific report ID is passed in the URL, select it
        const params = new URLSearchParams(location.search);
        const reportId = params.get('reportId');
        
        if (reportId && data.reports) {
          const report = data.reports.find(r => r.id === parseInt(reportId, 10));
          if (report) {
            setSelectedReport(report);
          }
        }
      } catch (err) {
        console.error("Error fetching user reports:", err);
        setError("Failed to load your crime reports. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [location.search]);

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    // Update the URL to include the selected report ID
    navigate(`/chat-authority?reportId=${report.id}`, { replace: true });
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chat with Authorities</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report selection sidebar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg text-gray-700 mb-4">Your Reports</h2>
          
          {userReports.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              You haven't filed any reports yet.
            </p>
          ) : (
            <div className="space-y-3">
              {userReports.map(report => (
                <div 
                  key={report.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedReport?.id === report.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleReportSelect(report)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    Complaint ID: {report.complaint_id || 'Not assigned'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <Chat 
              crimeId={selectedReport.id}
              userType="user"
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-96">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Start a Conversation</h3>
              <p className="text-gray-500 text-center">
                Select a report from the sidebar to chat with authorities about it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAuthority;