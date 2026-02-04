// Script to migrate existing admin accounts from localStorage.json to entity database
import { db } from './nodeDatabaseService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to localStorage.json
const LOCAL_STORAGE_FILE = path.join(__dirname, '..', '..', 'localStorage.json');

console.log('Migrating admin accounts...\n');

try {
  // Check if localStorage.json exists
  if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
    console.log('No localStorage.json file found. Nothing to migrate.');
    process.exit(0);
  }

  // Read localStorage.json
  const localStorageData = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8'));
  
  // Check if thesisHubAdmins exists
  if (!localStorageData.thesisHubAdmins) {
    console.log('No thesisHubAdmins data found. Nothing to migrate.');
    process.exit(0);
  }

  // Parse the admin data
  const admins = JSON.parse(localStorageData.thesisHubAdmins);
  console.log(`Found ${admins.length} admin account(s) to migrate.`);
  
  // Get existing entity admins
  const existingEntityAdmins = await db.entities.Admin.list();
  console.log(`Found ${existingEntityAdmins.length} existing entity admin account(s).`);
  
  // Migrate each admin account
  let migratedCount = 0;
  for (const admin of admins) {
    // Check if admin already exists in entity database
    const entityAdminExists = existingEntityAdmins.find(a => a.username === admin.username);
    
    if (!entityAdminExists) {
      // Create entity admin
      const entityAdmin = {
        username: admin.username,
        password_hash: admin.password,
        role: admin.role || 'admin',
        created_at: admin.created_at
      };
      
      await db.entities.Admin.create(entityAdmin);
      console.log(`  ✅ Migrated: ${admin.username}`);
      migratedCount++;
    } else {
      console.log(`  ℹ️  Skipped (already exists): ${admin.username}`);
    }
  }
  
  console.log(`\n✅ Migration complete! Migrated ${migratedCount} admin account(s).`);
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}