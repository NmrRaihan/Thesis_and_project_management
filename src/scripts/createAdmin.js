// Script to create an admin account
console.log('Creating admin account...');

try {
  // Create admin user object
  const adminUser = {
    username: 'admin',
    role: 'superuser',
    created_at: new Date().toISOString(),
    logged_in_at: new Date().toISOString()
  };
  
  // Store in localStorage (this is how the app expects it)
  localStorage.setItem('adminUser', JSON.stringify(adminUser));
  
  console.log('✅ Admin account created successfully!');
  console.log('Username: admin');
  console.log('Password: admin123 (hardcoded in the application)');
  console.log('\nYou can now login to the admin panel at http://localhost:5173/admin/login');
} catch (error) {
  console.error('❌ Failed to create admin account:', error);
}