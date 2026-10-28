import axios from 'axios';
import { API_BASE_URL } from '../config';
import api from '../utils/api';

axios.defaults.withCredentials = true;

export const adminService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async updateUserStatus(userId, status) {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Authority Verification
  async getAuthorityRequests() {
    const response = await api.get('/admin/authorities/requests');
    return response.data;
  },

  async updateAuthorityStatus(requestId, status) {
    const response = await api.patch(`/admin/authorities/${requestId}/status`, { status });
    return response.data;
  },

  // Crime Analytics
  async getCrimeAnalytics(timeRange = 'month') {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/analytics`,
        {
          params: { timeRange },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      console.log('Analytics response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Settings and Configuration
  async getAdminSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateAdminSettings(settings) {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(filters) {
    const response = await api.get('/admin/audit-logs', {
      params: filters
    });
    return response.data;
  },

  // System Health
  async getSystemHealth() {
    const response = await api.get('/admin/system/health');
    return response.data;
  },

  // Reports and Exports
  async generateReport(reportType, filters) {
    const response = await api.post('/admin/reports/generate', {
      type: reportType,
      filters
    });
    return response.data;
  },

  async exportData(dataType, filters) {
    const response = await api.post('/admin/export', {
      type: dataType,
      filters
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};