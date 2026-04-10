// Debug script to check teachers in localStorage
const database = JSON.parse(localStorage.getItem('database') || '{}');
const teachers = database.Teacher || [];

console.log('=== TEACHER DATABASE DEBUG ===');
console.log(`Total teachers found: ${teachers.length}\n`);

if (teachers.length === 0) {
  console.log('⚠️  NO TEACHERS FOUND IN DATABASE!');
  console.log('Teachers need to be created through the Teacher Registration page.');
} else {
  teachers.forEach((teacher, index) => {
    console.log(`\nTeacher ${index + 1}:`);
    console.log(`  ID: ${teacher.id}`);
    console.log(`  Teacher ID: ${teacher.teacher_id}`);
    console.log(`  Name: ${teacher.full_name}`);
    console.log(`  Email: ${teacher.email || 'Not set'}`);
    console.log(`  Department: ${teacher.department || 'Not set'}`);
    console.log(`  Research Field: ${teacher.research_field || 'Not set'}`);
    console.log(`  Status: ${teacher.status || 'Not set'}`);
    console.log(`  Max Students: ${teacher.max_students || 10}`);
    console.log(`  Current Students: ${teacher.current_students_count || 0}`);
    console.log(`  Publications: ${teacher.publications?.length || 0}`);
    console.log(`  Accepted Topics: ${teacher.accepted_topics?.length || 0}`);
  });
}

console.log('\n=== END DEBUG ===');
