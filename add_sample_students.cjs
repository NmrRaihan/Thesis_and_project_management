// Script to add sample students to localStorage for testing
const fs = require('fs');

// Sample students data
const sampleStudents = [
  {
    id: 'student_1703123456789_a1b2c3d4e',
    student_id: 'STU001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Computer Science',
    year: 3,
    semester: 2,
    gpa: 3.8,
    skills: ['JavaScript', 'React', 'Node.js'],
    interests: ['AI', 'Web Development'],
    group_id: null,
    status: 'active',
    profile_photo: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student_1703123456790_f5g6h7i8j',
    student_id: 'STU002',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Computer Science',
    year: 3,
    semester: 2,
    gpa: 3.9,
    skills: ['Python', 'Machine Learning', 'Data Science'],
    interests: ['ML', 'AI'],
    group_id: null,
    status: 'active',
    profile_photo: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student_1703123456791_k9l0m1n2o',
    student_id: 'STU003',
    full_name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    department: 'Software Engineering',
    year: 3,
    semester: 2,
    gpa: 3.7,
    skills: ['Java', 'Spring Boot', 'Microservices'],
    interests: ['Backend Development', 'DevOps'],
    group_id: null,
    status: 'active',
    profile_photo: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student_1703123456792_p3q4r5s6t',
    student_id: 'STU004',
    full_name: 'Emily Davis',
    email: 'emily.davis@example.com',
    department: 'Information Technology',
    year: 3,
    semester: 2,
    gpa: 3.6,
    skills: ['UI/UX', 'React', 'CSS'],
    interests: ['Web Design', 'Frontend Development'],
    group_id: null,
    status: 'active',
    profile_photo: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'student_1703123456793_u7v8w9x0y',
    student_id: 'STU005',
    full_name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    department: 'Computer Engineering',
    year: 3,
    semester: 2,
    gpa: 3.5,
    skills: ['C++', 'Embedded Systems', 'Hardware'],
    interests: ['IoT', 'Hardware Design'],
    group_id: null,
    status: 'active',
    profile_photo: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Create localStorage-like object for Node.js
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Load any existing localStorage data from the browser storage file if it exists
try {
  const localStoragePath = './localStorage.json';
  if (fs.existsSync(localStoragePath)) {
    const localStorageData = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
    global.localStorage.store = localStorageData;
  }
} catch (error) {
  console.log('No existing localStorage data found, starting fresh');
}

// Simulate the base44 client structure to access localStorage data
const entityManager = {
  getAll: function() {
    const data = localStorage.getItem(`entity_Student`);
    return data ? JSON.parse(data) : [];
  },
  save: function(items) {
    localStorage.setItem(`entity_Student`, JSON.stringify(items));
  }
};

// Load existing students or start fresh
let existingStudents = entityManager.getAll();

// Add sample students if none exist
if (existingStudents.length === 0) {
  existingStudents = sampleStudents;
  entityManager.save(existingStudents);
  console.log(`Added ${sampleStudents.length} sample students to localStorage`);
} else {
  // Check if sample students already exist (by student_id)
  const existingIds = new Set(existingStudents.map(s => s.student_id));
  const newStudents = sampleStudents.filter(s => !existingIds.has(s.student_id));
  
  if (newStudents.length > 0) {
    existingStudents = [...existingStudents, ...newStudents];
    entityManager.save(existingStudents);
    console.log(`Added ${newStudents.length} new sample students to localStorage`);
  } else {
    console.log('Sample students already exist in localStorage');
  }
}

console.log(`Total students in localStorage: ${existingStudents.length}`);
console.log('Sample students added to localStorage successfully!');

// Save the updated localStorage back to file
try {
  fs.writeFileSync('./localStorage.json', JSON.stringify(global.localStorage.store, null, 2));
  console.log('localStorage data saved to localStorage.json');
} catch (error) {
  console.error('Error saving localStorage data:', error);
}

console.log('You can now run the frontend application and students should appear on the invite page.');