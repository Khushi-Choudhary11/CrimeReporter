import React, { useEffect, useState } from "react";
import { crimeService } from "../services/api";
import { Link } from "react-router-dom";

export default function MyCrimeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null); // For debugging purposes

  useEffect(() => {
    setLoading(true);
    crimeService.getUserCrimeHistory()
        .then(response => {
            console.log("Crime History API Response:", response);
            // The response is already the data object, no need for response.data
            setHistory(response.reports || []);
        })
        .catch(err => {
            console.error("Error fetching crime history:", err);
            setError(err.response?.data?.error || "Failed to load your crime history");
        })
        .finally(() => {
            setLoading(false);
        });
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge colors
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Crime Reports</h1>
      
      {/* Debug information - only visible in development */}
      {process.env.NODE_ENV === 'development' && debug && (
        <div className="bg-gray-100 p-4 mb-4 rounded overflow-auto max-h-40 text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info (Click to expand)</summary>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </details>
        </div>
      )}
      
      {history.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">You haven't reported any crimes yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((report) => (
            <div key={report.id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{report.title}</h2>
                    {/* Make complaint ID more prominent */}
                    <p className="text-sm font-medium text-indigo-600 mt-1">
                      Complaint ID: {report.complaint_id || 'Not assigned'}
                    </p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{report.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Category:</span> {report.category}
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span> {report.severity}/5
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(report.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">PIN Code:</span> {report.pincode || 'N/A'}
                  </div>
                  {report.is_anonymous && (
                    <div className="col-span-2">
                      <span className="font-medium text-indigo-600">Anonymous Report</span>
                    </div>
                  )}
                </div>
                
                {report.images && report.images.length > 0 && (
                  <div className="mt-3">
                    <div className="flex space-x-2 overflow-x-auto">
                      {report.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium" 
                    onClick={() => {/* View details functionality */}}
                  >
                    View full report →
                  </button>
                  
                  {/* Add chat button */}
                  <Link 
                    to={`/chat-authority?reportId=${report.id}`} 
                    className="flex items-center text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with Authority
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}