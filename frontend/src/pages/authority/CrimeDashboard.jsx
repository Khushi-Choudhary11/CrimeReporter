import React, { useState, useEffect } from "react";
import { authorityService } from "../../services/api";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Chat from "../../components/Chat";

function CrimeDashboard() {
  const { pincode } = useParams();
  const navigate = useNavigate();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activePincode, setActivePincode] = useState(pincode || '');
  const [inputPincode, setInputPincode] = useState('');
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [inputError, setInputError] = useState('');
  const [feedback, setFeedback] = useState(''); // Adding the missing state variable
  const [availablePincodes, setAvailablePincodes] = useState([]);

  useEffect(() => {
    if (activePincode) {
      fetchCrimes();
    } else {
      setLoading(false);
    }
  }, [activePincode, currentPage]);

  useEffect(() => {
    const fetchAvailablePincodes = async () => {
      try {
        const response = await authorityService.getRegisteredPincodes();
        setAvailablePincodes(response.data.pincodes || []);
      } catch (err) {
        console.error("Error fetching pincodes:", err);
        setError("Failed to load available PIN codes");
      }
    };

    fetchAvailablePincodes();
  }, []);

  const fetchCrimes = async () => {
    try {
      setLoading(true);
      const response = await authorityService.getCrimesByPincode(activePincode, currentPage);
      setCrimes(response.data.crimes || []);
      setTotalPages(response.data.pages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching crimes:", err);
      setError(err.response?.data?.message || "Failed to load crime reports");
      setLoading(false);
    }
  };
  
  const updateStatus = async (id, status) => {
    try {
      await authorityService.updateCrimeStatus(id, status, feedback);
      
      // Update local state to reflect the change
      setCrimes(crimes.map(crime => 
        crime.id === id ? { ...crime, status } : crime
      ));
      
      setSelectedCrime(null);
      setFeedback("");
      
      // Show success notification
      alert(`Crime status updated to ${status}`);
    } catch (err) {
      console.error("Error updating crime status:", err);
      alert("Failed to update status. Please try again.");
    }
  };
  
  const handlePincodeInput = (e) => {
    // Only allow numeric inputs and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputPincode(value);
    setInputError('');
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    
    // Validate pincode format
    if (!inputPincode.trim()) {
      setInputError('Please enter a PIN code');
      return;
    }
    
    if (inputPincode.length !== 6) {
      setInputError('PIN code must be 6 digits');
      return;
    }
    
    // Reset error and proceed with valid pincode
    setInputError('');
    setActivePincode(inputPincode.trim());
    setCurrentPage(1);
    navigate(`/crime-dashboard/${inputPincode.trim()}`);
  };

  const handleSelectCrime = (crime) => {
    setSelectedCrime(crime);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  // Function to generate pagination buttons
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // No pincode specified
  if (!activePincode) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Please specify a pincode to view crime reports</p>
        </div>
        
        <div className="mt-4">
          <input 
            type="text" 
            placeholder="Enter Pincode" 
            className="p-2 border border-gray-300 rounded mr-2"
            value={activePincode}
            onChange={(e) => setActivePincode(e.target.value)}
          />
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => {
              if (activePincode) {
                navigate(`/crime-dashboard/${activePincode}`);
              }
            }}
          >
            View Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        🚨 Crime Dashboard for PIN {activePincode}
      </h1>
      
      {/* Pincode search form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handlePincodeSubmit} className="flex flex-col">
          <div className="flex mb-1">
            <select
              value={inputPincode}
              onChange={(e) => {
                setInputPincode(e.target.value);
                setInputError('');
              }}
              className={`flex-1 px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                inputError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select PIN Code</option>
              {availablePincodes.map((pincode) => (
                <option key={pincode} value={pincode}>
                  {pincode}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className={`px-6 py-2 rounded-r ${
                !inputPincode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              disabled={!inputPincode}
            >
              View Reports
            </button>
          </div>
          {inputError && (
            <p className="text-red-500 text-xs mt-1">{inputError}</p>
          )}
          {activePincode && (
            <p className="text-sm text-gray-600 mt-2">
              Currently viewing: <span className="font-medium">{activePincode}</span>
            </p>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {activePincode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crime reports list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Crime Reports for PIN Code: {activePincode}
              </h2>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : crimes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No crime reports found for this PIN code.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Complaint ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {crimes.map((crime) => (
                          <tr 
                            key={crime.id} 
                            className={`hover:bg-gray-50 cursor-pointer ${selectedCrime?.id === crime.id ? 'bg-indigo-50' : ''}`}
                            onClick={() => handleSelectCrime(crime)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {crime.complaint_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {crime.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={crime.status}
                                onChange={(e) => updateStatus(crime.id, e.target.value)}
                                className={`text-xs font-semibold rounded px-2 py-1 ${
                                  crime.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : crime.status === 'investigating'
                                    ? 'bg-blue-100 text-blue-800'
                                    : crime.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(crime.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCrime(crime);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">{renderPagination()}</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat and details panel */}
          <div className="lg:col-span-1">
            {selectedCrime ? (
              <div className="space-y-4">
                {/* Crime details card */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {selectedCrime.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Complaint ID: {selectedCrime.complaint_id}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Reported by: {selectedCrime.is_anonymous ? "Anonymous" : selectedCrime.username}
                  </p>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedCrime.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>{" "}
                      {selectedCrime.category}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Severity:</span>{" "}
                      {selectedCrime.severity}/5
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">PIN Code:</span>{" "}
                      {selectedCrime.pincode}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedCrime.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedCrime.status === 'investigating'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedCrime.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedCrime.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat component */}
                <Chat 
                  crimeId={selectedCrime.id} 
                  userType="authority"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-gray-500">
                  Select a crime report to view details and respond.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Enter a PIN Code to View Crime Reports
          </h2>
          <p className="text-gray-500">
            Please enter a valid 6-digit PIN code in the search box above to view crime reports from that area.
          </p>
        </div>
      )}
    </div>
  );
}

export default CrimeDashboard;