// Script to initialize browser localStorage with admin data from database.json
// This script should be run manually when setting up the application

// Note: This is a conceptual script. In practice, you would need to:
// 1. Read the database.json file
// 2. Extract the entity_Admin data
// 3. Store it in the browser's localStorage

// For now, you can manually run this in the browser's console:
/*
// Get the admin data from database.json (you'll need to copy this manually)
const adminData = [
  {
    "id": "Admin_1766386224875_tfrw1t4x3",
    "created_at": "2025-12-22T06:50:24.874Z",
    "username": "TestAdmin",
    "password_hash": "testpassword123",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618722_nvx2l0fzs",
    "created_at": "2025-12-22T06:13:43.111Z",
    "username": "myadmin",
    "password_hash": "mypassword123",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618726_9ksdq3qh4",
    "created_at": "2025-12-22T06:24:52.263Z",
    "username": "meheraj",
    "password_hash": "12345@raj",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618729_obwqsj1rz",
    "created_at": "2025-12-22T06:41:10.288Z",
    "username": "Meheraj",
    "password_hash": "12345@raj",
    "role": "superuser"
  },
  {
    "id": "Admin_1766387256909_zavxh9rz1",
    "created_at": "2025-12-22T07:07:36.909Z",
    "username": "TestAdmin2",
    "password_hash": "testpassword456",
    "role": "superuser"
  }
];

// Store in localStorage
localStorage.setItem('entity_Admin', JSON.stringify(adminData));
console.log('Admin data initialized in localStorage');
*/

console.log('To initialize admin data in browser localStorage:');
console.log('1. Open browser developer console (F12)');
console.log('2. Copy the admin data from database.json');
console.log('3. Run: localStorage.setItem("entity_Admin", JSON.stringify(adminData));');