const mongoose = require('mongoose');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentGroup = require('../models/StudentGroup');
const Proposal = require('../models/Proposal');
const SupervisionRequest = require('../models/SupervisionRequest');
const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const SharedFile = require('../models/SharedFile');
const WeeklyProgress = require('../models/WeeklyProgress');
const GroupInvitation = require('../models/GroupInvitation');

// Connect to MongoDB
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

// Import frontend data to backend
const importFrontendData = async (frontendData) => {
  try {
    await connectDB();
    
    console.log('Starting frontend data import...\n');
    
    // Import Students
    if (frontendData['entity_Student'] && frontendData['entity_Student'].length > 0) {
      console.log(`Importing ${frontendData['entity_Student'].length} students...`);
      
      // Clear existing students
      await Student.deleteMany({});
      
      // Import new students
      for (const student of frontendData['entity_Student']) {
        // Transform frontend student data to match backend schema
        const studentData = {
          student_id: student.student_id,
          full_name: student.full_name,
          email: student.email,
          password_hash: student.password_hash || student.password || 'password123',
          department: student.department,
          year: student.year,
          semester: student.semester,
          gpa: student.gpa,
          skills: student.skills || [],
          interests: student.interests || [],
          group_id: student.group_id,
          status: student.status || 'active',
          profile_photo: student.profile_photo || ''
        };
        
        await Student.create(studentData);
      }
      console.log('✅ Students imported successfully');
    }
    
    // Import Teachers
    if (frontendData['entity_Teacher'] && frontendData['entity_Teacher'].length > 0) {
      console.log(`\nImporting ${frontendData['entity_Teacher'].length} teachers...`);
      
      // Clear existing teachers
      await Teacher.deleteMany({});
      
      // Import new teachers
      for (const teacher of frontendData['entity_Teacher']) {
        // Transform frontend teacher data to match backend schema
        const teacherData = {
          teacher_id: teacher.teacher_id,
          full_name: teacher.full_name,
          email: teacher.email,
          password_hash: teacher.password_hash || teacher.password || 'password123',
          department: teacher.department,
          research_field: teacher.research_field,
          publications: teacher.publications || [],
          max_students: teacher.max_students || 10,
          current_students_count: teacher.current_students || teacher.current_students_count || 0,
          profile_photo: teacher.profile_photo || '',
          acceptance_criteria: teacher.acceptance_criteria || '',
          accepted_topics: teacher.accepted_topics || [],
          status: teacher.status || 'active'
        };
        
        await Teacher.create(teacherData);
      }
      console.log('✅ Teachers imported successfully');
    }
    
    // Import Student Groups
    if (frontendData['entity_StudentGroup'] && frontendData['entity_StudentGroup'].length > 0) {
      console.log(`\nImporting ${frontendData['entity_StudentGroup'].length} student groups...`);
      
      // Clear existing groups
      await StudentGroup.deleteMany({});
      
      // Import new groups
      for (const group of frontendData['entity_StudentGroup']) {
        const groupData = {
          group_name: group.group_name,
          member_ids: group.member_ids || [],
          assigned_teacher_id: group.assigned_teacher_id,
          project_type: group.project_type,
          field_of_interest: group.field_of_interest,
          status: group.status || 'active',
          created_date: group.created_date || new Date()
        };
        
        await StudentGroup.create(groupData);
      }
      console.log('✅ Student groups imported successfully');
    }
    
    // Import other entities (simplified - just clear and log)
    const entities = [
      { name: 'Proposal', key: 'entity_Proposal', model: Proposal },
      { name: 'SupervisionRequest', key: 'entity_SupervisionRequest', model: SupervisionRequest },
      { name: 'Message', key: 'entity_Message', model: Message },
      { name: 'Meeting', key: 'entity_Meeting', model: Meeting },
      { name: 'Task', key: 'entity_Task', model: Task },
      { name: 'SharedFile', key: 'entity_SharedFile', model: SharedFile },
      { name: 'WeeklyProgress', key: 'entity_WeeklyProgress', model: WeeklyProgress },
      { name: 'GroupInvitation', key: 'entity_GroupInvitation', model: GroupInvitation }
    ];
    
    for (const entity of entities) {
      if (frontendData[entity.key] && frontendData[entity.key].length > 0) {
        console.log(`\nImporting ${frontendData[entity.key].length} ${entity.name}s...`);
        await entity.model.deleteMany({});
        // For now, just clear the data. Full import would require more complex mapping
        console.log(`✅ ${entity.name}s cleared (full import not implemented)`);
      }
    }
    
    console.log('\n✅ Frontend data import completed successfully!');
    
    // Display summary
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Students: ${frontendData['entity_Student'] ? frontendData['entity_Student'].length : 0}`);
    console.log(`Teachers: ${frontendData['entity_Teacher'] ? frontendData['entity_Teacher'].length : 0}`);
    console.log(`Groups: ${frontendData['entity_StudentGroup'] ? frontendData['entity_StudentGroup'].length : 0}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
};

// If run directly, expect frontend data as argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node importFrontendData.js <path-to-frontend-data.json>');
    process.exit(1);
  }
  
  const fs = require('fs');
  const filePath = args[0];
  
  try {
    const frontendData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    importFrontendData(frontendData);
  } catch (error) {
    console.error('Error reading frontend data file:', error.message);
    process.exit(1);
  }
}

module.exports = { importFrontendData };