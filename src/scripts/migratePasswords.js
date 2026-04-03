// Migration script to hash all plain-text passwords in localStorage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORAGE_FILE = path.join(__dirname, '..', 'localStorage.json');

console.log('🔐 Starting password migration...\n');

try {
  // Check if localStorage file exists
  if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
    console.log('❌ localStorage.json not found. No data to migrate.');
    process.exit(0);
  }

  const localStorageData = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8'));
  let migrated = false;

  // Migrate Admins
  if (localStorageData.thesisHubAdmins) {
    const admins = JSON.parse(localStorageData.thesisHubAdmins);
    let adminMigrated = 0;
    
    for (const admin of admins) {
      // Skip if already hashed (bcrypt hashes start with $2)
      if (admin.password_hash && !admin.password_hash.startsWith('$2')) {
        console.log(`Migrating admin: ${admin.username}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password_hash, salt);
        admin.password_hash = hashedPassword;
        adminMigrated++;
        migrated = true;
      }
    }
    
    if (adminMigrated > 0) {
      localStorageData.thesisHubAdmins = JSON.stringify(admins);
      console.log(`✅ Migrated ${adminMigrated} admin(s)\n`);
    }
  }

  // Migrate entity_Admin (browser storage)
  if (localStorageData['entity_Admin']) {
    const admins = JSON.parse(localStorageData['entity_Admin']);
    let entityAdminMigrated = 0;
    
    for (const admin of admins) {
      if (admin.password_hash && !admin.password_hash.startsWith('$2')) {
        console.log(`Migrating entity admin: ${admin.username}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password_hash, salt);
        admin.password_hash = hashedPassword;
        entityAdminMigrated++;
        migrated = true;
      }
    }
    
    if (entityAdminMigrated > 0) {
      localStorageData['entity_Admin'] = JSON.stringify(admins);
      console.log(`✅ Migrated ${entityAdminMigrated} entity admin(s)\n`);
    }
  }

  // Migrate Students
  if (localStorageData['entity_Student']) {
    const students = JSON.parse(localStorageData['entity_Student']);
    let studentMigrated = 0;
    
    for (const student of students) {
      if (student.password_hash && !student.password_hash.startsWith('$2')) {
        console.log(`Migrating student: ${student.student_id} (${student.full_name})`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(student.password_hash, salt);
        student.password_hash = hashedPassword;
        studentMigrated++;
        migrated = true;
      }
    }
    
    if (studentMigrated > 0) {
      localStorageData['entity_Student'] = JSON.stringify(students);
      console.log(`✅ Migrated ${studentMigrated} student(s)\n`);
    }
  }

  // Migrate Teachers
  if (localStorageData['entity_Teacher']) {
    const teachers = JSON.parse(localStorageData['entity_Teacher']);
    let teacherMigrated = 0;
    
    for (const teacher of teachers) {
      if (teacher.password_hash && !teacher.password_hash.startsWith('$2')) {
        console.log(`Migrating teacher: ${teacher.teacher_id} (${teacher.full_name})`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(teacher.password_hash, salt);
        teacher.password_hash = hashedPassword;
        teacherMigrated++;
        migrated = true;
      }
    }
    
    if (teacherMigrated > 0) {
      localStorageData['entity_Teacher'] = JSON.stringify(teachers);
      console.log(`✅ Migrated ${teacherMigrated} teacher(s)\n`);
    }
  }

  // Save migrated data
  if (migrated) {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(localStorageData, null, 2));
    console.log('✅ Password migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: All passwords are now hashed with bcrypt.');
    console.log('Users can still login with their original passwords.\n');
  } else {
    console.log('✅ No plain-text passwords found. All passwords are already hashed.');
  }

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
