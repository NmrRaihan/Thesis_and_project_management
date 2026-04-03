// Quick script to add admin to browser localStorage
// Run this in your browser console (F12)

const adminAccount = {
  id: "admin_" + Date.now(),
  created_at: new Date().toISOString(),
  username: "admin",
  password_hash: "admin547", // Plain text for now (will be hashed on next login)
  role: "superuser"
};

// Get existing admins or create new array
let admins = [];
const existing = localStorage.getItem('entity_Admin');
if (existing) {
  try {
    admins = JSON.parse(existing);
  } catch(e) {
    admins = [];
  }
}

// Add new admin
admins.push(adminAccount);

// Save to localStorage
localStorage.setItem('entity_Admin', JSON.stringify(admins));

console.log('✅ Admin account added to browser localStorage!');
console.log('Username: admin');
console.log('Password: admin547');
console.log('\nYou can now login at: http://localhost:5173/admin/login');
console.log('Refreshing page...');

setTimeout(() => {
  window.location.reload();
}, 2000);
