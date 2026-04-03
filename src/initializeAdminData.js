// Auto-generated script to initialize browser localStorage with admin data
window.initializeAdminData = function() {
  const adminData = [
  {
    "id": "admin_" + Date.now(),
    "created_at": new Date().toISOString(),
    "username": "admin",
    "password_hash": "admin547",
    "password_plain": "admin547",
    "role": "superuser"
  }
];
  localStorage.setItem('entity_Admin', JSON.stringify(adminData));
  console.log('✅ Admin data initialized in localStorage');
  console.log('Username: admin, Password: admin547');
};

// Run initialization if in browser environment
if (typeof window !== 'undefined') {
  window.initializeAdminData();
}