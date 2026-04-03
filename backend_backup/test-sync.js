// Test script to demonstrate frontend-backend synchronization
const axios = require('axios');

async function testSync() {
  console.log('🧪 Testing Frontend-Backend Synchronization...\n');
  
  try {
    // 1. Check current backend status
    console.log('1. Checking current backend data status...');
    const statusResponse = await axios.get('http://localhost:5000/api/sync/status');
    console.log('Current backend data:');
    console.log(statusResponse.data.backendData);
    
    // 2. Create sample frontend-like data
    console.log('\n2. Creating sample frontend data...');
    const sampleFrontendData = {
      students: [
        {
          student_id: 'TEST001',
          full_name: 'John Doe',
          email: 'john.doe@university.edu',
          password_hash: 'password123',
          department: 'Computer Science',
          year: 3,
          semester: 6,
          gpa: 3.8,
          skills: ['JavaScript', 'React', 'Node.js'],
          interests: ['Web Development', 'AI'],
          status: 'active'
        },
        {
          student_id: 'TEST002',
          full_name: 'Jane Smith',
          email: 'jane.smith@university.edu',
          password_hash: 'password123',
          department: 'Computer Science',
          year: 3,
          semester: 6,
          gpa: 3.9,
          skills: ['Python', 'Machine Learning'],
          interests: ['Data Science', 'ML'],
          status: 'active'
        }
      ],
      teachers: [
        {
          teacher_id: 'TEST001',
          full_name: 'Dr. Test Professor',
          email: 'test.prof@university.edu',
          password_hash: 'password123',
          department: 'Computer Science',
          research_field: 'Software Engineering',
          publications: [],
          max_students: 10,
          current_students_count: 0,
          accepted_topics: ['Software Engineering', 'Web Development'],
          status: 'active'
        }
      ],
      groups: [
        {
          group_id: 'GROUP_TEST001',
          group_name: 'Test Group Alpha',
          members: [
            { student_id: 'TEST001', role: 'leader' },
            { student_id: 'TEST002', role: 'member' }
          ],
          project_title: 'Test Project',
          project_description: 'A test project for synchronization',
          status: 'active'
        }
      ]
    };
    
    console.log('Sample data created:');
    console.log(`- Students: ${sampleFrontendData.students.length}`);
    console.log(`- Teachers: ${sampleFrontendData.teachers.length}`);
    console.log(`- Groups: ${sampleFrontendData.groups.length}`);
    
    // 3. Sync data to backend
    console.log('\n3. Syncing data to backend...');
    const syncResponse = await axios.post('http://localhost:5000/api/sync/frontend-data', sampleFrontendData);
    console.log('Sync response:', syncResponse.data.message);
    console.log('Imported data:', syncResponse.data.imported);
    
    // 4. Verify the data was imported
    console.log('\n4. Verifying imported data...');
    const verifyResponse = await axios.get('http://localhost:5000/api/sync/status');
    console.log('Updated backend data:');
    console.log(verifyResponse.data.backendData);
    
    // 5. Test student login with new data
    console.log('\n5. Testing login with synced data...');
    const loginResponse = await axios.post('http://localhost:5000/api/students/login', {
      student_id: 'TEST001',
      password: 'password123'
    });
    console.log('Login successful:', loginResponse.data.message);
    
    console.log('\n✅ Synchronization test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Data successfully transferred from frontend format to backend');
    console.log('- Backend database updated with new records');
    console.log('- Authentication works with synced data');
    console.log('- Your frontend data can now be seen in the admin backend');
    
  } catch (error) {
    console.error('❌ Sync test failed:', error.response?.data || error.message);
  }
}

testSync();