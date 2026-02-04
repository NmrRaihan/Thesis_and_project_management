// Script to add a teacher directly to the database
import { db } from './nodeDatabaseService.js';

console.log('Adding teacher to database...\n');

// Teacher data - modify this to add your own teacher information
const teacherData = {
  teacher_id: 'T004', // Change this to a unique ID
  full_name: 'Dr. Alice Johnson',
  email: 'alice.johnson@university.edu',
  department: 'Computer Science',
  research_field: 'Machine Learning, Data Science',
  password_hash: 'securepassword123',
  profile_photo: '',
  acceptance_criteria: 'Strong programming background, interest in AI',
  max_students: 8,
  current_students: 0,
  status: 'active'
};

try {
  console.log('Checking if teacher already exists...');
  
  // Check if teacher already exists
  const existing = await db.entities.Teacher.filter({ teacher_id: teacherData.teacher_id });
  if (existing.length > 0) {
    console.log(`❌ Teacher with ID ${teacherData.teacher_id} already exists!`);
    console.log('Please use a different teacher ID.');
    process.exit(1);
  }

  // Check if email already exists
  if (teacherData.email) {
    const existingEmail = await db.entities.Teacher.filter({ email: teacherData.email });
    if (existingEmail.length > 0) {
      console.log(`❌ Teacher with email ${teacherData.email} already exists!`);
      console.log('Please use a different email.');
      process.exit(1);
    }
  }

  console.log('Creating teacher record...');
  
  // Create the teacher
  const createdTeacher = await db.entities.Teacher.create(teacherData);
  
  console.log('✅ Teacher added successfully!');
  console.log('\nTeacher Details:');
  console.log(`  ID: ${createdTeacher.teacher_id}`);
  console.log(`  Name: ${createdTeacher.full_name}`);
  console.log(`  Email: ${createdTeacher.email}`);
  console.log(`  Department: ${createdTeacher.department}`);
  console.log(`  Research Field: ${createdTeacher.research_field}`);
  console.log(`  Max Students: ${createdTeacher.max_students}`);
  
  console.log('\nYou can now login as this teacher using:');
  console.log(`  Teacher ID: ${createdTeacher.teacher_id}`);
  console.log(`  Password: ${teacherData.password_hash}`);
  
} catch (error) {
  console.error('❌ Failed to add teacher:', error.message);
  process.exit(1);
}