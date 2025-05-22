import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crimeService, userService } from '../services/api';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const SEVERITY_OPTIONS = [
  { value: 1, label: '1 - Minor Incident' },
  { value: 2, label: '2 - Low Severity' },
  { value: 3, label: '3 - Moderate' },
  { value: 4, label: '4 - High Severity' },
  { value: 5, label: '5 - Critical Emergency' }
];

const CATEGORIES = [
  'Theft',
  'Assault',
  'Vandalism',
  'Fraud',
  'Harassment',
  'Traffic Violation',
  'Domestic Violence',
  'Robbery',
  'Burglary',
  'Other'
];

const mapStyle = {
  height: '400px',
  width: '100%',
  borderRadius: '0.375rem'
};

const MapComponent = ({ position, setPosition }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);

  useEffect(() => {
    const handleClick = (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, setPosition]);

  return null;
};

function ReportCrime() {
  const navigate = useNavigate();
  const initialFormState = {
    title: '',
    description: '',
    category: '',
    severity: 3,
    latitude: null,
    longitude: null,
    pincode: '',
    is_anonymous: false,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationPermissionBlocked, setLocationPermissionBlocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getProfile();
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data. Please ensure you're logged in.");
      }
    };
    
    fetchUserData();
  }, []);

  // Get current location when component mounts
  useEffect(() => {
    if (navigator.geolocation && useCurrentLocation) {
      setLocationLoading(true);
      
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          // Permission is already denied
          setLocationPermissionBlocked(true);
          setLocationLoading(false);
          setError("Location permission denied. Please enter pincode manually.");
        } else {
          // Try to get location
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setLocation({ latitude, longitude });
              setFormData(prev => ({ ...prev, latitude, longitude }));
              setLocationLoading(false);
              
              // Fetch pincode based on coordinates
              fetchPincodeFromCoordinates(latitude, longitude);
            },
            error => {
              console.error("Error getting location:", error);
              
              // Check specific error codes
              if (error.code === 1) { // PERMISSION_DENIED
                setLocationPermissionBlocked(true);
                setError("Location permission denied. Please enter pincode manually.");
              } else if (error.code === 2) { // POSITION_UNAVAILABLE
                setError("Unable to determine your location. Please enter pincode manually.");
              } else if (error.code === 3) { // TIMEOUT
                setError("Location request timed out. Please try again or enter pincode manually.");
              } else {
                setError("Unable to get your location. Please enter pincode manually.");
              }
              
              setLocationLoading(false);
            },
            { 
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      }).catch(error => {
        console.error("Error checking geolocation permission:", error);
        setLocationLoading(false);
        setError("Unable to check location permissions. Please enter pincode manually.");
      });
    } else {
      setLocationLoading(false);
    }
  }, [useCurrentLocation]);

  // Fetch pincode from coordinates using a geocoding service
  const fetchPincodeFromCoordinates = async (latitude, longitude) => {
    try {
      // Using Nominatim OpenStreetMap service for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      
      // Extract postal code from response
      const pincode = data.address?.postcode || '';
      
      setFormData(prev => ({ ...prev, pincode }));
    } catch (error) {
      console.error("Error fetching pincode:", error);
      // Don't set an error state here, as pincode can be manually entered
    }
  };

  // Add this function inside your component
  const getLocationFromPincode = async (pincode) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
      }
    } catch (error) {
      console.error("Error fetching location from pincode:", error);
      setError("Failed to fetch location from pincode");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If pincode is changed and is 6 digits, fetch location
    if (name === 'pincode' && value.length === 6) {
      getLocationFromPincode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = {
        latitude: 'Location (latitude)',
        longitude: 'Location (longitude)',
        description: 'Description',
        category: 'Category',
        pincode: 'PIN Code'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(formData.pincode)) {
        setError('Please enter a valid 6-digit PIN code');
        setLoading(false);
        return;
      }

      const response = await crimeService.reportCrime(formData);
      console.log('Crime reported successfully:', response);
      
      // Show success message
      setSuccess(true);
      setFormData(initialFormState);
      
    } catch (err) {
      console.error('Error reporting crime:', err);
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto my-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Report a Crime or Incident</h1>
      
      {/* Show guidance if location permission is blocked */}
      {locationPermissionBlocked && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Location Permission Blocked</h3>
          <p className="mt-1">To enable location access:</p>
          <ol className="list-decimal list-inside mt-2 ml-2 text-sm">
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Find "Location" in the site settings</li>
            <li>Change permission from "Block" to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
          <p className="mt-2">Alternatively, you can continue by entering the pincode manually.</p>
        </div>
      )}
      
      {error && !locationPermissionBlocked && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Incident Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Enter a descriptive title"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {SEVERITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="5"
              required
              placeholder="Provide details about the incident. Be as specific as possible."
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">PIN Code <span className="text-red-600">*</span></label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Enter area PIN code"
              pattern="[0-9]{6}"
              title="Please enter a valid 6-digit PIN code"
            />
            <p className="text-xs text-gray-500 mt-1">
              6-digit PIN code for the incident location
            </p>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Report anonymously</span>
            </label>
          </div>
          
          <div className="md:col-span-2 mt-4">
            <label className="block text-gray-700 font-medium mb-2">Location</label>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={useCurrentLocation}
                onChange={() => {
                  setUseCurrentLocation(!useCurrentLocation);
                  if (locationPermissionBlocked) {
                    setError("To use your location, please enable location permission in your browser settings.");
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={locationPermissionBlocked}
              />
              <span className="ml-2 text-gray-700">Use my current location</span>
            </div>
            
            {locationLoading ? (
              <div className="flex items-center justify-center p-6 border border-gray-300 rounded-md bg-gray-50">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                <span className="ml-2 text-gray-600">Getting your location...</span>
              </div>
            ) : formData.latitude && formData.longitude ? (
              <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                <p className="text-gray-700 mb-2">
                  <strong>Selected Location:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
                <div className="h-[400px] mt-2 rounded" style={mapStyle}>
                  <MapContainer
                    center={[formData.latitude, formData.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[formData.latitude, formData.longitude]} />
                    <MapComponent 
                      position={[formData.latitude, formData.longitude]}
                      setPosition={(pos) => {
                        setFormData(prev => ({
                          ...prev,
                          latitude: pos[0],
                          longitude: pos[1]
                        }));
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 text-center">
                {locationPermissionBlocked ? (
                  <div>
                    <p className="text-gray-700 mb-2">Location access is blocked</p>
                    <p className="text-sm text-gray-500 mb-4">Please enable location services in your browser settings or enter location details manually.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-2">Location not available</p>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCurrentLocation(true);
                        setLocationPermissionBlocked(false); // Reset in case user fixed permissions
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Get My Location
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!formData.latitude && !formData.longitude && (
              <div className="mt-3 text-sm text-gray-500">
                <p>Note: If you don't provide location coordinates, we'll use the pincode to approximate the location.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportCrime;
