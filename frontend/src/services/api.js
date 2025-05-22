import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,  // Add this line
    headers: {
        'Content-Type': 'application/json'
    }
});

// Set your backend base URL here
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Helper to get JWT token from localStorage
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No JWT token found in localStorage");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export const authService = {
  async login({ username, password }) {
    // Correct endpoint for login
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }
    return response.data;
  },
  async registerUser(data) {
    // Correct endpoint for user registration
    return axios.post(`${API_BASE_URL}/auth/register/user`, data);
  },
  async registerAuthority(data) {
    // Correct endpoint for authority registration
    return axios.post(`${API_BASE_URL}/auth/register/authority`, data);
  },
};

export const userService = {
  async getProfile() {
    return axios.get(`${API_BASE_URL}/users/profile`, { headers: getAuthHeader() });
  },
  async getDashboard() {
    return axios.get(`${API_BASE_URL}/users/dashboard`, { headers: getAuthHeader() });
  },
};

export const adminService = {
  async getDashboardStats() {
    return axios.get(`${API_BASE_URL}/admin/dashboard/stats`, { headers: getAuthHeader() });
  },
  async getAllUsers() {
    return axios.get(`${API_BASE_URL}/admin/users`, { headers: getAuthHeader() });
  },
  // Add more admin endpoints as needed
};

export const authorityService = {
  async getCrimesByPincode(pincode, page = 1, perPage = 10) {
    return axios.get(`${API_BASE_URL}/authority/crimes/pincode/${pincode}`, { 
      headers: getAuthHeader(),
      params: { page, per_page: perPage }
    });
  },
  
  async updateCrimeStatus(crimeId, status, feedback = "") {
    return axios.post(`${API_BASE_URL}/authority/crimes/${crimeId}/update`, 
      { status, feedback }, 
      { headers: getAuthHeader() }
    );
  },
  
  async getDashboard() {
    try {
      console.log('Fetching dashboard with token:', localStorage.getItem("access_token")); // Debug log
      const response = await axios.get(`${API_BASE_URL}/authority/dashboard`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Dashboard response:', response.data); // Debug log
      return response;
    } catch (error) {
      console.error('Dashboard fetch error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getRegisteredPincodes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/authority/pincodes`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      throw error;
    }
  }
};

export const crimeService = {
  async getNearbyCrimes(lat, lng, radius = 5) {
    return axios.get(`${API_BASE_URL}/crimes/nearby`, {
      params: { lat, lng, radius },
      headers: getAuthHeader()
    });
  },
  
  async getAuthorityDashboardData(dateRange) {
    // Change endpoint from /dashboard/authority to /authority/dashboard
    const response = await axios.get(`${API_BASE_URL}/authority/dashboard`, {
      params: { range: dateRange },
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  async getUserCrimeHistory() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/crimes/user-history`,
        { headers: getAuthHeader() }
      );
      // Return just the data, not the full response
      return response.data;
    } catch (error) {
      console.error('Error fetching crime history:', error);
      throw error;
    }
  },
  
  async reportCrime(crimeData) {
    try {
      // Validate required fields
      const requiredFields = ['latitude', 'longitude', 'description', 'category', 'pincode'];
      const missingFields = requiredFields.filter(field => !crimeData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Format data properly
      const formattedData = {
        ...crimeData,
        latitude: parseFloat(crimeData.latitude),
        longitude: parseFloat(crimeData.longitude),
        severity: parseInt(crimeData.severity || 3),
        is_anonymous: Boolean(crimeData.is_anonymous)
      };

      const response = await axios.post(
        `${API_BASE_URL}/crimes/report`, 
        formattedData, 
        { headers: getAuthHeader() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error in reportCrime:', error);
      throw error;
    }
  },
  
  async getCrimeDetails(crimeId) {
    return axios.get(`${API_BASE_URL}/crimes/${crimeId}`, {
      headers: getAuthHeader()
    });
  },
  
  async getCrimeStats(filters = {}) {
    return axios.get(`${API_BASE_URL}/crimes/stats`, {
      params: filters,
      headers: getAuthHeader()
    });
  }
};

export const chatService = {
  async getChatRooms() {
    return axios.get(`${API_BASE_URL}/chat/rooms`, { headers: getAuthHeader() });
  },
  
  async getChatRoomByCrime(crimeId) {
    return axios.get(`${API_BASE_URL}/chat/room/crime/${crimeId}`, { headers: getAuthHeader() });
  },
  
  async getMessages(roomId) {
    return axios.get(`${API_BASE_URL}/chat/room/${roomId}/messages`, { headers: getAuthHeader() });
  },
  
  async sendMessage(roomId, message) {
    return axios.post(`${API_BASE_URL}/chat/room/${roomId}/send`, 
      { message }, 
      { headers: getAuthHeader() }
    );
  }
};

// Assign the object to a variable before exporting
const services = {
  authService,
  userService,
  adminService,
  authorityService,
  crimeService,
  chatService,
};

export default services;