// Test script to verify separated components work correctly
import http from 'http';

console.log('Testing separated components server...');

// Test home page
const testHomePage = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Home Page Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Home page is running and responding correctly');
    } else {
      console.log('❌ Home page returned an unexpected status code');
    }
    
    res.on('data', () => {
      // Just consume the data
    });
    
    res.on('end', testStudentLogin);
  });

  req.on('error', (error) => {
    console.log('❌ Server is not responding:', error.message);
    console.log('Please make sure the server is running with: npm run serve-separated');
    process.exit(1);
  });

  req.end();
};

// Test student login page
const testStudentLogin = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/studentlogin',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Student Login Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Student Login page is running and responding correctly');
    } else {
      console.log('❌ Student Login page returned an unexpected status code');
    }
    
    res.on('data', () => {
      // Just consume the data
    });
    
    res.on('end', () => {
      console.log('All tests completed');
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.log('❌ Server is not responding:', error.message);
    console.log('Please make sure the server is running with: npm run serve-separated');
    process.exit(1);
  });

  req.end();
};

// Start testing
testHomePage();