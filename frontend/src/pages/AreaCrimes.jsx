import React, { useState, useEffect } from "react";
import { crimeService } from "../services/api";

export default function AreaCrimes() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAreaCrimes = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would use authority jurisdiction info
        const authId = "auth123"; // Would come from auth context in real app
        
        // This would be a specific endpoint for authorities in the real API
        const response = await crimeService.getNearbycrimes("authority-area");
        setCrimes(response);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch crimes in your area");
        console.error(err);
        setLoading(false);
      }
    };

    fetchAreaCrimes();
  }, []);

  const crimeTypes = [
    "All", "Theft", "Assault", "Burglary", "Vandalism", 
    "Fraud", "Robbery", "Vehicle Crime", "Drug Related"
  ];

  // Filter crimes by type and search query
  const filteredCrimes = crimes
    .filter(crime => filterType === "all" || crime.type.toLowerCase() === filterType)
    .filter(crime => 
      searchQuery === "" || 
      crime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crime.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crime.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Crimes in Your Area</h1>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Search crimes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Filter by Type:</h2>
          <div className="flex flex-wrap gap-2">
            {crimeTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type.toLowerCase())}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                  filterType === type.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        {/* Crime Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm font-medium text-blue-800">All Crimes</p>
            <p className="text-2xl font-bold text-blue-900">{crimes.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <p className="text-sm font-medium text-yellow-800">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{crimes.filter(c => c.status === 'pending').length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm font-medium text-green-800">Resolved</p>
            <p className="text-2xl font-bold text-green-900">{crimes.filter(c => c.status === 'resolved').length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-sm font-medium text-purple-800">Investigating</p>
            <p className="text-2xl font-bold text-purple-900">{crimes.filter(c => c.status === 'investigating').length}</p>
          </div>
        </div>
        
        {/* Crime List */}
        {filteredCrimes.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
            <p className="text-blue-700 font-medium">No crimes match your filter criteria.</p>
            <p className="text-sm text-blue-600 mt-1">Try adjusting your search or filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCrimes.map((crime, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex justify-between items-center">
                  <h2 className="font-semibold truncate">{crime.title}</h2>
                  <span className="bg-white text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {crime.type}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 line-clamp-2">{crime.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="font-medium text-gray-500">Location:</p>
                      <p>{crime.location}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Reported:</p>
                      <p>{new Date(crime.reportedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Status:</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(crime.status)}`}>
                        {crime.status || "Under Review"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Reporter:</p>
                      <p>{crime.reportedBy?.name || "Anonymous"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm font-medium transition-colors">
                      View Details
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-medium transition-colors">
                      Update Status
                    </button>
                    <button className="bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 text-sm font-medium transition-colors">
                      Contact Reporter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}