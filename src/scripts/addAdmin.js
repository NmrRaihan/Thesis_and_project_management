// Script to add a custom admin account
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './nodeDatabaseService.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the admins data in localStorage format
const LOCAL_STORAGE_FILE = path.join(__dirname, '..', '..', 'localStorage.json');

console.log('Creating custom admin account...\n');

// Get admin credentials from command line arguments
const args = process.argv.slice(2);
let username, password;

if (args.length >= 2) {
  username = args[0];
  password = args[1];
} else {
  console.log('Usage: node addAdmin.js <username> <password>');
  console.log('Example: node addAdmin.js myadmin mypassword123');
  process.exit(1);
}

try {
  // Get existing localStorage data
  let localStorageData = {};
  if (fs.existsSync(LOCAL_STORAGE_FILE)) {
    const localStorageJson = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8');
    localStorageData = JSON.parse(localStorageJson);
  }
  
  // Get existing admins
  let admins = [];
  if (localStorageData.thesisHubAdmins) {
    admins = JSON.parse(localStorageData.thesisHubAdmins);
  }
  
  // Check if admin already exists
  const existingAdmin = admins.find(a => a.username === username);
  if (existingAdmin) {
    console.log(`❌ Admin with username '${username}' already exists!`);
    process.exit(1);
  }
  
  // Add new admin
  const newAdmin = {
    username: username,
    password: password,
    role: 'superuser',
    created_at: new Date().toISOString()
  };
  
  admins.push(newAdmin);
  localStorageData.thesisHubAdmins = JSON.stringify(admins);
  fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(localStorageData, null, 2));
  
  // Also store in entity database for browser access
  const entityAdmin = {
    username: username,
    password_hash: password,
    role: 'superuser',
    created_at: new Date().toISOString()
  };
  
  // Check if admin already exists in entity database
  const existingEntityAdmins = await db.entities.Admin.list();
  const entityAdminExists = existingEntityAdmins.find(a => a.username === username);
  
  if (!entityAdminExists) {
    await db.entities.Admin.create(entityAdmin);
  }
  
  // Also generate a script to initialize browser localStorage
  const allAdmins = await db.entities.Admin.list();
  const browserInitScript = `// Auto-generated script to initialize browser localStorage with admin data
window.initializeAdminData = function() {
  const adminData = ${JSON.stringify(allAdmins, null, 2)};
  localStorage.setItem('entity_Admin', JSON.stringify(adminData));
  console.log('Admin data initialized in localStorage');
};

// Run initialization if in browser environment
if (typeof window !== 'undefined') {
  window.initializeAdminData();
}`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'initializeAdminData.js'), browserInitScript);
  
  console.log('✅ Admin account created successfully!');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log('\nYou can now login to the admin panel at http://localhost:5173/admin/login');
  
} catch (error) {
  console.error('❌ Failed to create admin account:', error.message);
  process.exit(1);
}