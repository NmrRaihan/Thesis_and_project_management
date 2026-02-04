// Script to add sample students to the database
import { db } from './nodeDatabaseService.js';

console.log('Adding sample students to database...\n');

// Sample students data
const sampleStudents = [
  {
    student_id: 'S001',
    full_name: 'John Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science',
    password_hash: 'password123',
    profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=John+Doe',
    status: 'active',
    is_group_admin: false
  },
  {
    student_id: 'S002',
    full_name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    department: 'Computer Science',
    password_hash: 'password123',
    profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane+Smith',
    status: 'active',
    is_group_admin: true
  },
  {
    student_id: 'S003',
    full_name: 'Robert Johnson',
    email: 'robert.johnson@university.edu',
    department: 'Electrical Engineering',
    password_hash: 'password123',
    profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Robert+Johnson',
    status: 'active',
    is_group_admin: false
  }
];

try {
  console.log('Adding sample students...\n');
  
  for (const studentData of sampleStudents) {
    // Check if student already exists
    const existing = await db.entities.Student.filter({ student_id: studentData.student_id });
    if (existing.length > 0) {
      console.log(`⚠️  Student with ID ${studentData.student_id} already exists, skipping...`);
      continue;
    }

    // Create the student
    const createdStudent = await db.entities.Student.create(studentData);
    console.log(`✅ Added student: ${createdStudent.full_name} (${createdStudent.student_id})`);
  }
  
  console.log('\n✅ Sample students added successfully!');
  console.log('\nYou can login as these students using:');
  console.log('Student IDs: S001, S002, S003');
  console.log('Password: password123 (same for all)');
  
} catch (error) {
  console.error('❌ Failed to add sample students:', error.message);
  process.exit(1);
}