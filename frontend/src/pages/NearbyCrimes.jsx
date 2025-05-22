import React, { useEffect, useState } from "react";
import { crimeService } from "../services/api";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper function to determine urgency color
const getUrgencyColor = (severity) => {
  switch(severity) {
    case 5: return "#ff0000"; // High - Red
    case 4: return "#ff4500"; // Medium-high - OrangeRed
    case 3: return "#ffa500"; // Medium - Orange
    case 2: return "#ffcc00"; // Low-medium - Gold
    default: return "#ffff00"; // Low - Yellow
  }
};

export default function NearbyCrimes() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError("Failed to get location: " + err.message);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  // Fetch crimes when location is available
  useEffect(() => {
    if (location.lat && location.lng) {
      setLoading(true);
      crimeService.getNearbyCrimes(location.lat, location.lng)
        .then(response => {
          console.log("API Response:", response);
          // Make sure we're handling the response data correctly
          const data = response.data || response;
          const crimesList = data.reports || [];
          
          console.log("Crime reports:", crimesList);
          setCrimes(crimesList);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching crimes:", err);
          setError("Failed to fetch nearby crimes");
          setLoading(false);
        });
    }
  }, [location]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
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
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Nearby Crimes</h1>
      
      {/* Add crime heatmap */}
      <div style={{ height: "400px", marginBottom: "2rem" }}>
        <MapContainer 
          center={location.lat ? [location.lat, location.lng] : [28.6139, 77.2090]} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {crimes.map((crime, index) => (
            <CircleMarker 
              key={crime.id || index}
              center={[crime.latitude, crime.longitude]}
              radius={10 + (crime.severity || 3) * 2}
              pathOptions={{
                fillColor: getUrgencyColor(crime.severity || 3),
                color: getUrgencyColor(crime.severity || 3),
                fillOpacity: 0.6,
                weight: 1
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{crime.title}</h3>
                  <p>{crime.description}</p>
                  <p>Category: {crime.type || crime.category}</p>
                  <p>Severity: {crime.severity}/5</p>
                  <p>Reported: {new Date(crime.reportedAt || crime.created_at).toLocaleString()}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      {crimes.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-700">No crimes reported in your area recently.</p>
          <p className="text-sm text-gray-600 mt-2">Stay safe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crimes.map((crime, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-red-600 text-lg">{crime.title}</h2>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{crime.type || crime.category}</span>
              </div>
              <p className="text-gray-700 my-2">{crime.description}</p>
              <div className="flex justify-between text-sm mt-3">
                <p className="text-gray-500">Location: {crime.location || `${crime.latitude.toFixed(5)}, ${crime.longitude.toFixed(5)}`}</p>
                <p className="text-gray-500">Reported: {new Date(crime.reportedAt || crime.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

