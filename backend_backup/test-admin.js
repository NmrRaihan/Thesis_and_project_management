// Test script to verify admin login
const axios = require('axios');

async function testAdmin() {
  console.log('Testing Admin Login...\n');
  
  try {
    // Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Admin login successful:', loginResponse.data.message);
    
    const token = loginResponse.data.token;
    console.log('Received token:', token.substring(0, 20) + '...');
    
    // Test getting students with admin token
    console.log('\n2. Testing get students with admin token...');
    const studentsResponse = await axios.get('http://localhost:5000/api/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Got students:', studentsResponse.data.count, 'students found');
    
    console.log('\n✅ Admin test completed successfully!');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testAdmin();