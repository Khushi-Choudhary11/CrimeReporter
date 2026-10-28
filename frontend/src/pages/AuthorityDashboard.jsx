import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authorityService } from "../services/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie} from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AuthorityDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_crimes: 0,
    pending_crimes: 0,
    investigating_crimes: 0,
    resolved_crimes: 0,
    recent_crimes: [],
    jurisdiction: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("week");
  const [selectedPincode, setSelectedPincode] = useState("");
  const [pinnedPincodes, setPinnedPincodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await authorityService.getDashboard();
        console.log("Dashboard data response:", response.data); // Debug log
        
        // Update dashboard data with response data
        setDashboardData({
          total_crimes: response.data.total_crimes || 0,
          pending_crimes: response.data.pending_crimes || 0,
          investigating_crimes: response.data.investigating_crimes || 0,
          resolved_crimes: response.data.resolved_crimes || 0,
          recent_crimes: response.data.recent_crimes || [],
          jurisdiction: response.data.jurisdiction || []
        });
        
        // Load pinned pincodes
        const savedPincodes = localStorage.getItem("pinnedPincodes");
        if (savedPincodes) {
          setPinnedPincodes(JSON.parse(savedPincodes));
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching authority dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  // Generate chart data
  const statusChartData = {
    labels: ["Pending", "Investigating", "Resolved"],
    datasets: [
      {
        label: "Crime Status",
        data: [
          dashboardData.pending_crimes || 0,
          dashboardData.investigating_crimes || 0,
          dashboardData.resolved_crimes || 0
        ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const handlePincodeSelect = (e) => {
    setSelectedPincode(e.target.value);
  };
  
  const handlePincodeInput = (e) => {
    // Only allow numeric inputs and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setSelectedPincode(value);
  };
  
  const viewPincodeReports = () => {
    if (!selectedPincode || !/^\d{6}$/.test(selectedPincode)) {
      console.error('Invalid pincode format');
      return;
    }
    navigate(`/crime-dashboard/${selectedPincode}`);
  };
  
  const addPinToPinned = (pincode) => {
    if (!pinnedPincodes.includes(pincode)) {
      const newPinnedPincodes = [...pinnedPincodes, pincode];
      setPinnedPincodes(newPinnedPincodes);
      localStorage.setItem("pinnedPincodes", JSON.stringify(newPinnedPincodes));
    }
  };
  
  const removePinFromPinned = (pincode) => {
    const newPinnedPincodes = pinnedPincodes.filter(pin => pin !== pincode);
    setPinnedPincodes(newPinnedPincodes);
    localStorage.setItem("pinnedPincodes", JSON.stringify(newPinnedPincodes));
  };

  // Make sure we handle null/undefined safely when rendering
  const recentCrimes = dashboardData.recent_crimes || [];
  const jurisdictionAreas = Array.isArray(dashboardData.jurisdiction) ? dashboardData.jurisdiction : [];

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Authority Dashboard</h1>
      
      {/* Quick Access to Pincodes */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Access to Areas</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Direct pincode input */}
          <div className="flex-1">
            <label htmlFor="pincode-input" className="block text-sm font-medium text-gray-700 mb-1">
              Enter PIN Code:
            </label>
            <div className="flex">
              <input
                id="pincode-input"
                type="text"
                value={selectedPincode}
                onChange={handlePincodeInput}
                placeholder="Enter 6-digit PIN code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={6}
                pattern="\d{6}"
                title="Please enter a valid 6-digit PIN code"
              />
              <button 
                onClick={viewPincodeReports}
                disabled={!selectedPincode || selectedPincode.length !== 6}
                className={`px-4 py-2 rounded-r ${
                  !selectedPincode || selectedPincode.length !== 6
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                View
              </button>
            </div>
          </div>

          {/* Dropdown for jurisdiction areas */}
          <div className="flex-1">
            <label htmlFor="jurisdiction-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select from Jurisdiction:
            </label>
            <div className="flex">
              <select 
                id="jurisdiction-select"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={jurisdictionAreas.includes(selectedPincode) ? selectedPincode : ""}
                onChange={handlePincodeSelect}
              >
                <option value="">Select a PIN code</option>
                {Array.isArray(jurisdictionAreas) && jurisdictionAreas.map((pincode, index) => (
                  <option key={index} value={pincode}>{pincode}</option>
                ))}
              </select>
              <button 
                onClick={viewPincodeReports}
                disabled={!selectedPincode || !jurisdictionAreas.includes(selectedPincode)}
                className={`px-4 py-2 rounded-r ${
                  !selectedPincode || !jurisdictionAreas.includes(selectedPincode)
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                Go
              </button>
            </div>
          </div>
        </div>
        
        {/* Pinned areas */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Your Pinned Areas:</h3>
          <div className="flex flex-wrap gap-2">
            {pinnedPincodes.length > 0 ? (
              pinnedPincodes.map((pincode, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <Link 
                    to={`/crime-dashboard/${pincode}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 mr-2"
                  >
                    {pincode}
                  </Link>
                  <button 
                    onClick={() => removePinFromPinned(pincode)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No areas pinned yet. Pin areas for quick access.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="text-gray-500 text-sm font-medium">Total Reports</div>
          <div className="text-3xl font-bold">{dashboardData.total_crimes || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="text-gray-500 text-sm font-medium">Pending</div>
          <div className="text-3xl font-bold">{dashboardData.pending_crimes || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm font-medium">Investigating</div>
          <div className="text-3xl font-bold">{dashboardData.investigating_crimes || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-gray-500 text-sm font-medium">Resolved</div>
          <div className="text-3xl font-bold">{dashboardData.resolved_crimes || 0}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Crime Status Distribution</h2>
          <div className="h-64">
            <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        {/* Recent Reports */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Recent Reports</h2>
          
          {recentCrimes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent crime reports</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pincode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCrimes.map((crime) => (
                    <tr key={crime.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {crime.complaint_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {crime.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">{crime.pincode}</span>
                          {crime.pincode && crime.pincode !== 'N/A' && !pinnedPincodes.includes(crime.pincode) && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addPinToPinned(crime.pincode);
                              }}
                              className="text-gray-400 hover:text-indigo-600"
                              title="Pin this area"
                            >
                              📌
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          crime.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          crime.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                          crime.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {crime.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(crime.timestamp || crime.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {crime.pincode && crime.pincode !== 'N/A' ? (
                          <Link 
                            to={`/crime-dashboard/${crime.pincode}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-gray-400 mr-3" title="No pincode available">
                            View
                          </span>
                        )}
                        <Link 
                          to={`/chat-affected?crimeId=${crime.id}`} 
                          className="text-green-600 hover:text-green-900"
                        >
                          Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6">
        
        {/* Motivation Corner */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <h2 className="text-lg font-bold mb-4">Motivation Corner</h2>
          <div className="text-center py-6">
            <p className="text-2xl font-serif mb-4">
              "The only thing necessary for the triumph of evil is for good people to do nothing."
            </p>
            <p className="text-sm opacity-75 mt-2">
              - Edmund Burke
            </p>
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm">
                Every report you handle, every case you investigate, and every citizen you help
                makes our community a safer place. Your dedication matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;