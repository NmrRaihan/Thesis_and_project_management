// Script to check data in MongoDB
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/thesis_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const Admin = require('./src/models/Admin');

async function checkData() {
  console.log('Checking database data...\n');
  
  try {
    // Check students
    console.log('1. Checking Students...');
    const students = await Student.find({});
    console.log(`Found ${students.length} students:`);
    students.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.full_name} (${student.student_id}) - Available fields: ${Object.keys(student._doc).filter(field => field.includes('pass'))} - Password_hash: ${student.password_hash}, Password: ${student.password}`);
    });
    
    console.log('\n2. Checking Teachers...');
    const teachers = await Teacher.find({});
    console.log(`Found ${teachers.length} teachers:`);
    teachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.full_name} (${teacher.teacher_id}) - Available fields: ${Object.keys(teacher._doc).filter(field => field.includes('pass'))} - Password_hash: ${teacher.password_hash}, Password: ${teacher.password}`);
    });
    
    console.log('\n3. Checking Admins...');
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admins:`);
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.username} (${admin.email}) - Available fields: ${Object.keys(admin._doc).filter(field => field.includes('pass'))} - Password: ${admin.password}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Data check completed!');
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    await mongoose.connection.close();
  }
}

checkData();