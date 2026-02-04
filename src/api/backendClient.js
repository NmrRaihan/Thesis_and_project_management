// Backend API service
const API_BASE_URL = 'http://localhost:5000/api';

class BackendAPIClient {
  constructor() {
    this.token = localStorage.getItem('adminToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Admin authentication
  async adminLogin(username, password) {
    const data = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // Get admin profile
  async getAdminProfile() {
    return this.request('/admin/profile');
  }

  // Dashboard statistics
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Get all data
  async getAllData() {
    return this.request('/dashboard/all-data');
  }

  // Clear all data
  async clearAllData() {
    return this.request('/dashboard/clear-all', {
      method: 'DELETE'
    });
  }

  // Add teacher
  async addTeacher(teacherData) {
    return this.request('/dashboard/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  }

  // Get all students
  async getAllStudents() {
    return this.request('/students');
  }

  // Get all teachers
  async getAllTeachers() {
    return this.request('/teachers');
  }
}

// Create singleton instance
const backendAPI = new BackendAPIClient();

export default backendAPI;