// Backend API Service
const API_BASE_URL = 'http://localhost:5000/api';

class BackendAPI {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async loginStudent(student_id, password) {
    return this.request('/students/login', {
      method: 'POST',
      body: { student_id, password }
    });
  }

  async loginTeacher(teacher_id, password) {
    return this.request('/teachers/login', {
      method: 'POST',
      body: { teacher_id, password }
    });
  }

  async loginAdmin(admin_id, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: { admin_id, password }
    });
  }

  // Student endpoints
  async getStudents() {
    return this.request('/students');
  }

  async getAvailableStudentsForInvitation() {
    return this.request('/students/available-for-invitation');
  }

  async getStudentById(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: studentData
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: studentData
    });
  }

  // Teacher endpoints
  async getTeachers() {
    return this.request('/teachers');
  }

  async getTeacherById(id) {
    return this.request(`/teachers/${id}`);
  }

  async createTeacher(teacherData) {
    return this.request('/teachers', {
      method: 'POST',
      body: teacherData
    });
  }

  async updateTeacher(id, teacherData) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: teacherData
    });
  }

  // Admin endpoints
  async getAdmins() {
    return this.request('/admin');
  }

  async createAdmin(adminData) {
    return this.request('/admin', {
      method: 'POST',
      body: adminData
    });
  }

  // Dashboard endpoints
  async getStudentDashboard(student_id) {
    return this.request(`/dashboard/student/${student_id}`);
  }

  async getTeacherDashboard(teacher_id) {
    return this.request(`/dashboard/teacher/${teacher_id}`);
  }

  async getAdminDashboard() {
    return this.request('/dashboard/admin');
  }

  // Groups endpoints
  async getStudentGroups() {
    return this.request('/groups');
  }

  async createStudentGroup(groupData) {
    return this.request('/groups', {
      method: 'POST',
      body: groupData
    });
  }

  async updateStudentGroup(id, groupData) {
    return this.request(`/groups/${id}`, {
      method: 'PUT',
      body: groupData
    });
  }

  // Proposals endpoints
  async getProposals() {
    return this.request('/proposals');
  }

  async createProposal(proposalData) {
    return this.request('/proposals', {
      method: 'POST',
      body: proposalData
    });
  }

  async updateProposal(id, proposalData) {
    return this.request(`/proposals/${id}`, {
      method: 'PUT',
      body: proposalData
    });
  }

  // Messages endpoints
  async getMessages(conversation_id) {
    return this.request(`/messages/${conversation_id}`);
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: messageData
    });
  }

  // Meetings endpoints
  async getMeetings() {
    return this.request('/meetings');
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      body: meetingData
    });
  }

  async updateMeeting(id, meetingData) {
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: meetingData
    });
  }

  // Tasks endpoints
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData
    });
  }

  // Files endpoints
  async getSharedFiles() {
    return this.request('/files');
  }

  async uploadFile(fileData) {
    return this.request('/files', {
      method: 'POST',
      body: fileData
    });
  }

  // Progress endpoints
  async getWeeklyProgress() {
    return this.request('/progress');
  }

  async createWeeklyProgress(progressData) {
    return this.request('/progress', {
      method: 'POST',
      body: progressData
    });
  }

  // Requests endpoints
  async getSupervisionRequests() {
    return this.request('/requests');
  }

  async createSupervisionRequest(requestData) {
    return this.request('/requests', {
      method: 'POST',
      body: requestData
    });
  }

  async updateSupervisionRequest(id, requestData) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: requestData
    });
  }

  // Invitations endpoints
  async getGroupInvitations() {
    return this.request('/invitations');
  }

  async createGroupInvitation(invitationData) {
    return this.request('/invitations', {
      method: 'POST',
      body: invitationData
    });
  }

  async updateGroupInvitation(id, invitationData) {
    return this.request(`/invitations/${id}`, {
      method: 'PUT',
      body: invitationData
    });
  }
}

// Create singleton instance
const backendAPI = new BackendAPI();

export default backendAPI;