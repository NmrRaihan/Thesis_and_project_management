// Script to view all teacher profiles
import { db } from './nodeDatabaseService.js';

console.log('=== Teacher Profiles ===\n');

try {
  console.log('Fetching teacher data...\n');
  
  // Get all teachers
  const teachers = await db.entities.Teacher.list();
  
  if (teachers.length === 0) {
    console.log('No teachers found in the database.');
    console.log('Add some teachers by registering through the web interface or using the add-teacher script.');
  } else {
    console.log(`Found ${teachers.length} teacher(s):\n`);
    
    teachers.forEach((teacher, index) => {
      console.log(`--- Teacher ${index + 1} ---`);
      console.log(`ID: ${teacher.teacher_id}`);
      console.log(`Name: ${teacher.full_name}`);
      console.log(`Email: ${teacher.email || 'Not provided'}`);
      console.log(`Department: ${teacher.department || 'Not provided'}`);
      console.log(`Research Field: ${teacher.research_field || 'Not provided'}`);
      console.log(`Max Students: ${teacher.max_students || 'Not specified'}`);
      console.log(`Current Students: ${teacher.current_students_count || teacher.current_students || 0}`);
      console.log(`Status: ${teacher.status || 'active'}`);
      console.log(`Created: ${teacher.created_at ? new Date(teacher.created_at).toLocaleString() : 'Unknown'}`);
      console.log('');
    });
  }
  
} catch (error) {
  console.error('❌ Failed to fetch teacher data:', error.message);
  process.exit(1);
}