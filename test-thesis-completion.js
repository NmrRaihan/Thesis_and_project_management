/**
 * Test Script for Thesis Completion Request System
 * 
 * This script helps verify that the ThesisCompletionRequest entity
 * is properly registered and functional.
 * 
 * Run this in the browser console at http://localhost:5173
 */

console.log('========================================');
console.log('Thesis Completion Request System Test');
console.log('========================================\n');

// Test 1: Check if entity is registered
console.log('Test 1: Checking entity registration...');
try {
  const base44 = await import('/Thesis_and_project_management/src/api/base44Client.js');
  if (base44.base44.entities.ThesisCompletionRequest) {
    console.log('✅ ThesisCompletionRequest entity is registered');
  } else {
    console.log('❌ ThesisCompletionRequest entity is NOT registered');
  }
} catch (error) {
  console.log('❌ Error importing base44Client:', error.message);
}

// Test 2: Check entity operations
console.log('\nTest 2: Testing entity operations...');
try {
  const { databaseService: db } = await import('/Thesis_and_project_management/src/services/databaseService.js');
  
  // List all requests
  const requests = await db.entities.ThesisCompletionRequest.list();
  console.log(`✅ Successfully listed requests. Total: ${requests.length}`);
  
  // Test filter
  const filtered = await db.entities.ThesisCompletionRequest.filter({ status: 'pending_teacher' });
  console.log(`✅ Successfully filtered requests. Pending: ${filtered.length}`);
  
} catch (error) {
  console.log('❌ Error testing entity operations:', error.message);
}

// Test 3: Check localStorage
console.log('\nTest 3: Checking localStorage...');
const storageKey = 'entity_ThesisCompletionRequest';
const storedData = localStorage.getItem(storageKey);
if (storedData) {
  const parsed = JSON.parse(storedData);
  console.log(`✅ Found data in localStorage. Records: ${parsed.length}`);
} else {
  console.log('ℹ️  No data in localStorage yet (this is normal if no requests have been created)');
}

// Test 4: Check current user
console.log('\nTest 4: Checking current user...');
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
const userType = localStorage.getItem('userType');

if (currentUser && userType) {
  console.log(`✅ Current user: ${currentUser.full_name || currentUser.username}`);
  console.log(`✅ User type: ${userType}`);
  
  if (userType === 'student') {
    console.log(`   Student ID: ${currentUser.student_id}`);
    console.log(`   Group ID: ${currentUser.group_id || 'None'}`);
    console.log(`   Is Group Admin: ${currentUser.is_group_admin}`);
  } else if (userType === 'teacher') {
    console.log(`   Teacher ID: ${currentUser.teacher_id}`);
  } else if (userType === 'admin') {
    console.log(`   Admin user logged in`);
  }
} else {
  console.log('⚠️  No user logged in. Please login to test the system.');
}

console.log('\n========================================');
console.log('Test Complete!');
console.log('========================================');
console.log('\nNext Steps:');
console.log('1. Login as a student (group leader with supervised group)');
console.log('2. Navigate to Thesis Completion');
console.log('3. Submit a completion request');
console.log('4. Login as the assigned teacher');
console.log('5. Review and approve/reject the request');
console.log('6. Login as admin');
console.log('7. Give final approval\n');
