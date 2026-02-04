// Script to view all student profiles
import { db } from './nodeDatabaseService.js';

console.log('=== Student Profiles ===\n');

try {
  console.log('Fetching student data...\n');
  
  // Get all students
  const students = await db.entities.Student.list();
  
  if (students.length === 0) {
    console.log('No students found in the database.');
    console.log('Add some students by registering through the web interface or using sample data.');
  } else {
    console.log(`Found ${students.length} student(s):\n`);
    
    students.forEach((student, index) => {
      console.log(`--- Student ${index + 1} ---`);
      console.log(`ID: ${student.student_id}`);
      console.log(`Name: ${student.full_name}`);
      console.log(`Email: ${student.email || 'Not provided'}`);
      console.log(`Department: ${student.department || 'Not provided'}`);
      console.log(`Group ID: ${student.group_id || 'Not assigned'}`);
      console.log(`Group Admin: ${student.is_group_admin ? 'Yes' : 'No'}`);
      console.log(`Status: ${student.status || 'active'}`);
      console.log(`Created: ${student.created_at ? new Date(student.created_at).toLocaleString() : 'Unknown'}`);
      console.log('');
    });
  }
  
} catch (error) {
  console.error('❌ Failed to fetch student data:', error.message);
  process.exit(1);
}