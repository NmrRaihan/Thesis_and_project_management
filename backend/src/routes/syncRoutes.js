const express = require('express');
const router = express.Router();
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

// @desc    Sync frontend localStorage data to backend
// @route   POST /api/sync/frontend-data
// @access  Public (for development/testing)
const syncFrontendData = async (req, res) => {
  try {
    const {
      students = [],
      teachers = [],
      groups = [],
      proposals = [],
      messages = [],
      meetings = [],
      tasks = [],
      files = [],
      progress = [],
      requests = [],
      invitations = []
    } = req.body;

    console.log('📥 Receiving frontend sync data...');
    console.log(`Students: ${students.length}`);
    console.log(`Teachers: ${teachers.length}`);
    console.log(`Groups: ${groups.length}`);

    // Clear existing data first
    console.log('\n🗑️  Clearing existing data...');
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await StudentGroup.deleteMany({});
    await Proposal.deleteMany({});
    await SupervisionRequest.deleteMany({});
    await Message.deleteMany({});
    await Meeting.deleteMany({});
    await Task.deleteMany({});
    await SharedFile.deleteMany({});
    await WeeklyProgress.deleteMany({});
    await GroupInvitation.deleteMany({});

    // Import Students
    if (students.length > 0) {
      console.log(`\n👤 Importing ${students.length} students...`);
      for (const student of students) {
        const studentData = {
          student_id: student.student_id,
          full_name: student.full_name,
          email: student.email,
          password_hash: student.password_hash || student.password || 'password123',
          department: student.department,
          year: student.year,
          semester: student.semester,
          gpa: student.gpa,
          skills: Array.isArray(student.skills) ? student.skills : [],
          interests: Array.isArray(student.interests) ? student.interests : [],
          group_id: student.group_id,
          status: student.status || 'active',
          profile_photo: student.profile_photo || '',
          created_at: student.created_at || student.created_date || new Date(),
          updated_at: student.updated_at || student.updated_date || new Date()
        };
        
        // Remove undefined fields
        Object.keys(studentData).forEach(key => {
          if (studentData[key] === undefined) {
            delete studentData[key];
          }
        });
        
        await Student.create(studentData);
      }
      console.log('✅ Students imported');
    }

    // Import Teachers
    if (teachers.length > 0) {
      console.log(`\n👨‍🏫 Importing ${teachers.length} teachers...`);
      for (const teacher of teachers) {
        const teacherData = {
          teacher_id: teacher.teacher_id,
          full_name: teacher.full_name,
          email: teacher.email,
          password_hash: teacher.password_hash || teacher.password || 'password123',
          department: teacher.department,
          research_field: teacher.research_field,
          publications: Array.isArray(teacher.publications) ? teacher.publications : [],
          max_students: teacher.max_students || 10,
          current_students_count: teacher.current_students || teacher.current_students_count || 0,
          profile_photo: teacher.profile_photo || '',
          acceptance_criteria: teacher.acceptance_criteria || '',
          accepted_topics: Array.isArray(teacher.accepted_topics) ? teacher.accepted_topics : [],
          status: teacher.status || 'active',
          created_at: teacher.created_at || teacher.created_date || new Date(),
          updated_at: teacher.updated_at || teacher.updated_date || new Date()
        };
        
        // Remove undefined fields
        Object.keys(teacherData).forEach(key => {
          if (teacherData[key] === undefined) {
            delete teacherData[key];
          }
        });
        
        await Teacher.create(teacherData);
      }
      console.log('✅ Teachers imported');
    }

    // Import Student Groups
    if (groups.length > 0) {
      console.log(`\n👥 Importing ${groups.length} student groups...`);
      for (const group of groups) {
        const groupData = {
          group_id: group.group_id || `GRP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          group_name: group.group_name,
          members: Array.isArray(group.members) ? group.members : 
                   Array.isArray(group.member_ids) ? group.member_ids.map(id => ({ student_id: id, role: 'member' })) : [],
          supervisor_id: group.supervisor_id || group.assigned_teacher_id,
          project_title: group.project_title || group.project_type,
          project_description: group.project_description || group.field_of_interest,
          status: group.status || 'forming',
          created_date: group.created_date || group.created_at || new Date()
        };
        
        // Remove undefined fields
        Object.keys(groupData).forEach(key => {
          if (groupData[key] === undefined) {
            delete groupData[key];
          }
        });
        
        await StudentGroup.create(groupData);
      }
      console.log('✅ Student groups imported');
    }

    // Note: Other entities would need similar import logic
    // For now, we'll just log that they were received
    const otherEntities = [
      { name: 'Proposals', data: proposals },
      { name: 'Messages', data: messages },
      { name: 'Meetings', data: meetings },
      { name: 'Tasks', data: tasks },
      { name: 'Files', data: files },
      { name: 'Progress', data: progress },
      { name: 'Requests', data: requests },
      { name: 'Invitations', data: invitations }
    ];

    otherEntities.forEach(entity => {
      if (entity.data.length > 0) {
        console.log(`\n📄 ${entity.name}: ${entity.data.length} records received (not imported yet)`);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Frontend data synchronized successfully',
      imported: {
        students: students.length,
        teachers: teachers.length,
        groups: groups.length
      },
      received: {
        proposals: proposals.length,
        messages: messages.length,
        meetings: meetings.length,
        tasks: tasks.length,
        files: files.length,
        progress: progress.length,
        requests: requests.length,
        invitations: invitations.length
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error synchronizing frontend data',
      error: error.message
    });
  }
};

// @desc    Get current backend data summary
// @route   GET /api/sync/status
// @access  Public
const getSyncStatus = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const groupCount = await StudentGroup.countDocuments();
    const proposalCount = await Proposal.countDocuments();
    const requestCount = await SupervisionRequest.countDocuments();

    res.status(200).json({
      success: true,
      backendData: {
        students: studentCount,
        teachers: teacherCount,
        groups: groupCount,
        proposals: proposalCount,
        requests: requestCount
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking sync status',
      error: error.message
    });
  }
};

router.post('/frontend-data', syncFrontendData);
router.get('/status', getSyncStatus);

module.exports = router;