// Test script to verify teacher login
const axios = require('axios');

async function testTeacher() {
  console.log('Testing Teacher Login...\n');
  
  try {
    // Test teacher login
    console.log('1. Testing teacher login...');
    const loginResponse = await axios.post('http://localhost:5000/api/teachers/login', {
      teacher_id: 'T001',
      password: 'password123'
    });
    console.log('✅ Teacher login successful:', loginResponse.data.message);
    
    const token = loginResponse.data.token;
    console.log('Received token:', token.substring(0, 20) + '...');
    
    console.log('\n✅ Teacher login test completed successfully!');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testTeacher();