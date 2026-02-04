// Script to add sample data for testing
import { db } from './services/databaseService.js';

console.log('Adding sample data...');

// Sample student
const sampleStudent = {
  student_id: 'S001',
  full_name: 'John Doe',
  email: 'john.doe@university.edu',
  department: 'Computer Science',
  password_hash: 'password123',
  profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=John+Doe',
  status: 'active',
  is_group_admin: false
};

// Sample teacher
const sampleTeacher = {
  teacher_id: 'T001',
  full_name: 'Dr. Jane Smith',
  email: 'jane.smith@university.edu',
  department: 'Computer Science',
  research_field: 'Artificial Intelligence',
  password_hash: 'password123',
  profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Dr.+Jane+Smith',
  acceptance_criteria: 'Minimum GPA 3.5',
  max_students: 10,
  current_students: 3
};

try {
  console.log('Creating sample student...');
  const createdStudent = await db.entities.Student.create(sampleStudent);
  console.log('Created student:', createdStudent);
  
  console.log('Creating sample teacher...');
  const createdTeacher = await db.entities.Teacher.create(sampleTeacher);
  console.log('Created teacher:', createdTeacher);
  
  console.log('Sample data added successfully!');
  console.log('You can now login with:');
  console.log('Student: S001 / password123');
  console.log('Teacher: T001 / password123');
} catch (error) {
  console.error('Failed to add sample data:', error);
}