const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentGroup = require('../models/StudentGroup');
const Admin = require('../models/Admin');
const Proposal = require('../models/Proposal');
const SupervisionRequest = require('../models/SupervisionRequest');
const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const SharedFile = require('../models/SharedFile');
const WeeklyProgress = require('../models/WeeklyProgress');
const GroupInvitation = require('../models/GroupInvitation');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/thesisHub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createAdminData = async () => {
  return {
    username: 'admin',
    email: 'admin@thesisproject.edu',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    isActive: true
  };
};

const sampleData = {
  Student: [
    {
      student_id: 'S001',
      full_name: 'Alice Johnson',
      email: 'alice.johnson@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      year: 3,
      semester: 6,
      gpa: 3.8,
      skills: ['JavaScript', 'React', 'Node.js'],
      interests: ['Web Development', 'AI'],
      group_id: null,
      status: 'active',
      profile_photo: ''
    },
    {
      student_id: 'S002',
      full_name: 'Bob Smith',
      email: 'bob.smith@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      year: 3,
      semester: 6,
      gpa: 3.6,
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      interests: ['Data Science', 'ML'],
      group_id: null,
      status: 'active',
      profile_photo: ''
    },
    {
      student_id: 'S003',
      full_name: 'Carol Davis',
      email: 'carol.davis@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      year: 3,
      semester: 6,
      gpa: 3.9,
      skills: ['Java', 'Spring Boot', 'Database Design'],
      interests: ['Software Engineering', 'Backend'],
      group_id: null,
      status: 'active',
      profile_photo: ''
    },
    {
      student_id: 'S004',
      full_name: 'David Wilson',
      email: 'david.wilson@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      year: 3,
      semester: 6,
      gpa: 3.7,
      skills: ['React', 'CSS', 'UI/UX Design'],
      interests: ['Frontend', 'Mobile Apps'],
      group_id: null,
      status: 'active',
      profile_photo: ''
    }
  ],
  Teacher: [
    {
      teacher_id: 'T001',
      full_name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      research_field: 'Artificial Intelligence, Machine Learning',
      publications: [
        { title: 'Advanced Machine Learning Techniques', year: 2023, journal: 'AI Journal' },
        { title: 'Deep Learning Applications', year: 2022, journal: 'Neural Networks' },
        { title: 'Computer Vision Innovations', year: 2023, journal: 'Vision Research' }
      ],
      max_students: 10,
      current_students_count: 3,
      profile_photo: '',
      acceptance_criteria: 'Minimum GPA 3.5, Strong programming background',
      accepted_topics: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
      status: 'active'
    },
    {
      teacher_id: 'T002',
      full_name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      research_field: 'Cybersecurity, Network Security',
      publications: [
        { title: 'Network Security Protocols', year: 2023, journal: 'Security Journal' },
        { title: 'Cryptography in Modern Systems', year: 2022, journal: 'Crypto Research' },
        { title: 'Ethical Hacking Methods', year: 2023, journal: 'Cyber Review' }
      ],
      max_students: 8,
      current_students_count: 2,
      profile_photo: '',
      acceptance_criteria: 'Interest in security, Good analytical skills',
      accepted_topics: ['Network Security', 'Cryptography', 'Ethical Hacking'],
      status: 'active'
    },
    {
      teacher_id: 'T003',
      full_name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      password_hash: 'password123',
      department: 'Computer Science',
      research_field: 'Data Science, Big Data Analytics',
      publications: [
        { title: 'Data Mining Algorithms', year: 2023, journal: 'Data Science Journal' },
        { title: 'Big Data Processing Techniques', year: 2022, journal: 'Analytics Review' },
        { title: 'Statistical Analysis Methods', year: 2023, journal: 'Statistics Research' },
        { title: 'Machine Learning in Analytics', year: 2021, journal: 'ML Analytics' }
      ],
      max_students: 12,
      current_students_count: 5,
      profile_photo: '',
      acceptance_criteria: 'Strong mathematics background, Python proficiency',
      accepted_topics: ['Data Mining', 'Big Data', 'Statistical Analysis'],
      status: 'active'
    }
  ]
};

const migrateData = async () => {
  try {
    await connectDB();
    
    console.log('Starting data migration...\n');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await StudentGroup.deleteMany({});
    await Admin.deleteMany({});
    await Proposal.deleteMany({});
    await SupervisionRequest.deleteMany({});
    await Message.deleteMany({});
    await Meeting.deleteMany({});
    await Task.deleteMany({});
    await SharedFile.deleteMany({});
    await WeeklyProgress.deleteMany({});
    await GroupInvitation.deleteMany({});
    
    console.log('Existing data cleared.\n');
    
    // Migrate Students
    console.log('Migrating Students...');
    for (const student of sampleData.Student) {
      await Student.create(student);
    }
    console.log(`✓ Migrated ${sampleData.Student.length} students`);
    
    // Migrate Teachers
    console.log('Migrating Teachers...');
    for (const teacher of sampleData.Teacher) {
      await Teacher.create(teacher);
    }
    console.log(`✓ Migrated ${sampleData.Teacher.length} teachers`);
    
    // Migrate Admins
    console.log('Migrating Admins...');
    const adminData = await createAdminData();
    await Admin.create(adminData);
    console.log('✓ Migrated 1 admin');
    
    console.log('\n✅ Data migration completed successfully!');
    console.log('\nDatabase now contains:');
    console.log(`- ${sampleData.Student.length} Students`);
    console.log(`- ${sampleData.Teacher.length} Teachers`);
    console.log('- 1 Admin');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateData();