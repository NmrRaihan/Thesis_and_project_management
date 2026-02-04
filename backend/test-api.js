// Test script to verify backend API
const backendAPI = require('./src/api/backendClient.js').default;

async function testBackend() {
  console.log('Testing Backend API...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await backendAPI.adminLogin('admin', 'admin123');
    console.log('Login response:', loginResponse);
    
    if (loginResponse.success) {
      console.log('✅ Login successful!');
      
      // Test get dashboard stats
      console.log('\n3. Testing dashboard stats...');
      const statsResponse = await backendAPI.getDashboardStats();
      console.log('Dashboard stats:', statsResponse);
      
      // Test get all data
      console.log('\n4. Testing get all data...');
      const allDataResponse = await backendAPI.getAllData();
      console.log('All data response received - entities count:', 
        Object.keys(allDataResponse.data || {}).length);
      
    } else {
      console.log('❌ Login failed:', loginResponse.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackend();