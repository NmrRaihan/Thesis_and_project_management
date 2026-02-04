// Simple test script to verify backend API
const axios = require('axios');

async function testBackend() {
  console.log('Testing Backend API...\n');
  
  try {
    // Test student login
    console.log('1. Testing student login...');
    const loginResponse = await axios.post('http://localhost:5000/api/students/login', {
      student_id: 'S001',
      password: 'password123'
    });
    console.log('✅ Student login successful:', loginResponse.data.message);
    
    const token = loginResponse.data.token;
    console.log('Received token:', token.substring(0, 20) + '...');
    
    // Test getting students (this should work with student token since the routes are protected)
    console.log('\n2. Testing get students (with auth)...');
    try {
      const studentsResponse = await axios.get('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Got students:', studentsResponse.data.count, 'students found');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('❌ Students endpoint requires admin token, not student token');
      } else {
        throw error;
      }
    }
    
    // Test getting specific student
    console.log('\n3. Testing get specific student...');
    try {
      const studentResponse = await axios.get('http://localhost:5000/api/students/S001', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Got student:', studentResponse.data.student.full_name);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('❌ Student detail endpoint requires admin token, not student token');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testBackend();