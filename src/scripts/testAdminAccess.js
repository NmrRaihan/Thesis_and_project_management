// Test script to verify admin account access
import { db } from './nodeDatabaseService.js';

console.log('Testing admin account access...\n');

try {
  // Get all admin accounts
  const admins = await db.entities.Admin.list();
  
  console.log(`Found ${admins.length} admin account(s):`);
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. Username: ${admin.username}`);
    console.log(`   Password hash: ${admin.password_hash}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.created_at}`);
    console.log('');
  });
  
  // Test specific account
  const testAdmin = await db.entities.Admin.filter({ username: 'Meheraj' });
  if (testAdmin.length > 0) {
    console.log('✅ Found Meheraj account in entity database');
    console.log(`   Password: ${testAdmin[0].password_hash}`);
  } else {
    console.log('❌ Meheraj account not found in entity database');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}