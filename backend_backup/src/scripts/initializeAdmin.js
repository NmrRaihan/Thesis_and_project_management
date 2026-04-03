const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const initializeAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      username: process.env.DEFAULT_ADMIN_USERNAME
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, salt);

    // Create admin user
    const admin = await Admin.create({
      username: process.env.DEFAULT_ADMIN_USERNAME,
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'superuser',
      isActive: true
    });

    console.log('Admin user created successfully:');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log('Login credentials:');
    console.log(`Username: ${process.env.DEFAULT_ADMIN_USERNAME}`);
    console.log(`Password: ${process.env.DEFAULT_ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
};

initializeAdmin();