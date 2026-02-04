# Admin Guide for ThesisHub System

This guide explains how to manage the ThesisHub system from the terminal, including creating admin accounts, viewing student profiles, adding teachers, and monitoring proposals.

## Prerequisites

Before using these scripts, make sure you have:
1. Node.js installed on your system
2. The project dependencies installed (`npm install`)

## Available Admin Scripts

### 1. Create Admin Account
```bash
npm run create-admin
```
This script provides instructions for accessing the admin panel with the default credentials:
- Username: `admin`
- Password: `admin123`

Navigate to `http://localhost:5173/admin/login` to access the admin dashboard.

### 2. Add Teacher Information
```bash
npm run add-teacher
```
This script adds a new teacher to the database. To customize the teacher information:
1. Edit `src/scripts/addTeacher.js` and modify the `teacherData` object
2. Run the script

### 3. View Student Profiles
```bash
npm run view-students
```
This script displays all registered student profiles with their details.

### 4. View Teacher Information
```bash
npm run view-teachers
```
This script displays all registered teacher profiles with their details.

### 5. View Student Group Proposals
```bash
npm run view-proposals
```
This script displays all student group proposals with details about the groups and members.

## Using the Web Admin Interface

For a more comprehensive view of the system:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin login page:
   `http://localhost:5173/admin/login`

3. Login with the default credentials:
   - Username: `admin`
   - Password: `admin123`

4. From the admin dashboard, you can:
   - View statistics about students, teachers, groups, and proposals
   - See all database entities and their records
   - Clear all data (use with caution)
   - Refresh data views

## Customizing Teacher Information

To add a new teacher:

1. Open `src/scripts/addTeacher.js`
2. Modify the `teacherData` object with the desired information:
   ```javascript
   const teacherData = {
     teacher_id: 'T005', // Unique ID
     full_name: 'Dr. New Teacher',
     email: 'new.teacher@university.edu',
     department: 'Computer Science',
     research_field: 'Specialized Research Area',
     password_hash: 'securepassword',
     // ... other fields
   };
   ```
3. Run the script:
   ```bash
   npm run add-teacher
   ```

## Data Management Scripts

Additional data management scripts are available:

- `npm run add-sample-data` - Adds sample student and teacher data
- `npm run add-sample-students` - Adds sample students only
- `npm run create-sample-proposal` - Creates a sample student group and proposal
- `npm run list-data` - Lists all data in JSON format
- `npm run clear-data` - Clears all data from the database

## Important Notes

1. **Data Storage**: All data is stored in the browser's localStorage, not in a traditional database.
2. **Persistence**: Data persists between browser sessions but is specific to each browser.
3. **Security**: Passwords are stored in plain text for demonstration purposes only.
4. **Multi-user**: Each browser has its own separate database.

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed: `npm install`
2. Check that Node.js is properly installed
3. Ensure you're running scripts from the project root directory
4. For web interface issues, check the browser's developer console for errors