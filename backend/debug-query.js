// Script to debug the student query
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/thesisHub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('./src/models/Student');

async function debugQuery() {
  console.log('Debugging student query...\n');
  
  try {
    // Direct query for S001
    console.log('1. Querying for student_id: S001');
    const student = await Student.findOne({ student_id: 'S001' });
    console.log('Result:', student ? `Found: ${student.full_name}` : 'NOT FOUND');
    
    // Query all students and see what's there
    console.log('\n2. Getting all students to see what is stored:');
    const allStudents = await Student.find({});
    allStudents.forEach((s, i) => {
      console.log(`  ${i+1}. ID: "${s.student_id}" Name: "${s.full_name}"`);
    });
    
    // Try different query approaches
    console.log('\n3. Trying different query approaches:');
    
    // Using regex
    const regexResult = await Student.findOne({ student_id: /^S001$/ });
    console.log('Regex query result:', regexResult ? `Found: ${regexResult.full_name}` : 'NOT FOUND');
    
    // Check raw collection data
    const collection = mongoose.connection.collection('students');
    const rawResults = await collection.find({}).toArray();
    console.log('\n4. Raw collection data:');
    rawResults.forEach((doc, i) => {
      console.log(`  ${i+1}. ID: "${doc.student_id}" Name: "${doc.full_name}" _id: ${doc._id}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Debug completed!');
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
    await mongoose.connection.close();
  }
}

debugQuery();