// Script to make one student a group leader for testing
const fs = require('fs');

// Read the localStorage data
let localStorageData;
try {
  const data = fs.readFileSync('./localStorage.json', 'utf8');
  localStorageData = JSON.parse(data);
} catch (error) {
  console.error('Error reading localStorage.json:', error);
  process.exit(1);
}

// Get the student entity data (it's stored as a JSON string)
let studentDataStr = localStorageData['entity_Student'];
if (typeof studentDataStr === 'string') {
  try {
    var studentData = JSON.parse(studentDataStr);
  } catch (error) {
    console.error('Error parsing student data:', error);
    process.exit(1);
  }
} else {
  studentData = studentDataStr;
}

if (!studentData || !Array.isArray(studentData)) {
  console.error('No student data found in localStorage');
  process.exit(1);
}

// Find the first student and make them a group leader
const firstStudent = studentData[0];
if (!firstStudent) {
  console.error('No students found in localStorage');
  process.exit(1);
}

// Update the student to be a group leader
firstStudent.is_group_admin = true;
firstStudent.group_id = 'group_' + Date.now(); // Create a unique group ID
firstStudent.group_name = 'Test Group';

console.log(`Made ${firstStudent.full_name} (${firstStudent.student_id}) a group leader`);
console.log(`Group ID: ${firstStudent.group_id}`);
console.log(`Group Name: ${firstStudent.group_name}`);

// Save the updated data back to localStorage (store as JSON string like the original)
localStorageData['entity_Student'] = JSON.stringify(studentData);

// Write back to the files
fs.writeFileSync('./localStorage.json', JSON.stringify(localStorageData, null, 2));
fs.writeFileSync('./database.json', JSON.stringify(localStorageData, null, 2));

console.log('Updated localStorage.json and database.json with group leader data');
console.log('You can now log in as this student and access the invite students page.');
console.log(`Login info: Student ID: ${firstStudent.student_id}, Full Name: ${firstStudent.full_name}`);