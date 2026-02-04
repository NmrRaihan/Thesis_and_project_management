# ThesisHub Admin Management Summary

This document provides a complete overview of how to manage the ThesisHub system, including creating admin accounts, viewing student profiles, adding teacher information, and monitoring student proposals.

## System Architecture

The ThesisHub system uses a client-side database approach:
- **Data Storage**: Browser localStorage (simulated with JSON file for terminal scripts)
- **Persistence**: Data persists between sessions but is browser-specific
- **Entities**: Students, Teachers, Groups, Proposals, Messages, etc.

## Admin Access Methods

### 1. Web Interface (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:5173/admin/login`
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

Features of the web admin interface:
- Dashboard with statistics
- Real-time data viewing
- Entity browsing with previews
- Data clearing capability
- Responsive design

### 2. Terminal Commands

All terminal commands should be run from the project root directory.

## Available Terminal Commands

### Admin Management
```bash
npm run create-admin
```
Provides instructions for accessing the admin panel.

### Data Viewing
```bash
npm run view-students        # View all student profiles
npm run view-teachers        # View all teacher profiles
npm run view-proposals       # View all student group proposals
```

### Data Creation
```bash
npm run add-teacher          # Add a new teacher (customize in script)
npm run add-sample-students  # Add sample students
npm run create-sample-proposal # Create sample group and proposal
```

### Data Management
```bash
npm run add-sample-data      # Add sample students and teachers
npm run list-data            # List all data in JSON format
npm run clear-data           # Clear all data from database
```

## Customizing Teacher Information

To add a custom teacher:

1. Edit `src/scripts/addTeacher.js`
2. Modify the `teacherData` object with your information:
   ```javascript
   const teacherData = {
     teacher_id: 'T005',           // Must be unique
     full_name: 'Dr. New Teacher',
     email: 'new.teacher@university.edu',
     department: 'Computer Science',
     research_field: 'Specialized Research Area',
     password_hash: 'securepassword',
     max_students: 10,
     // ... other fields
   };
   ```
3. Run: `npm run add-teacher`

## Viewing Data Details

### Student Profiles
Shows:
- Student ID
- Full name
- Email
- Department
- Group membership
- Admin status
- Account status
- Creation date

### Teacher Profiles
Shows:
- Teacher ID
- Full name
- Email
- Department
- Research field
- Student capacity
- Current student count
- Account status
- Creation date

### Student Proposals
Shows:
- Proposal title
- Status (draft/submitted/approved)
- Project type
- Research field
- Associated group
- Group members
- Submission date
- Keywords
- Description preview

## Data Flow Process

1. **Student Registration**: Students register through the web interface
2. **Teacher Registration**: Teachers register through the web interface or via terminal script
3. **Group Formation**: Students form groups with up to 3 members
4. **Proposal Creation**: Groups create and submit research proposals
5. **Admin Monitoring**: Admins can view all data through web interface or terminal

## Important Notes

1. **Browser-Specific Data**: Each browser has its own separate database
2. **No Server Required**: Data is stored locally, no backend server needed
3. **Plain Text Passwords**: For demonstration only, not suitable for production
4. **JSON Storage**: Terminal scripts use a `database.json` file in the project root

## Troubleshooting

Common issues and solutions:

1. **Scripts not working**: Ensure Node.js is installed and dependencies are installed (`npm install`)
2. **Data not appearing**: Check that you're using the same browser for web interface and that terminal scripts are updating the same database
3. **Permission errors**: Ensure you have write permissions in the project directory
4. **Port conflicts**: If port 5173 is in use, the dev server will use another port

## Next Steps

To further enhance the admin capabilities:
1. Add script to modify existing records
2. Create script to delete specific entries
3. Implement search functionality in viewing scripts
4. Add export/import capabilities for data migration

For any questions or issues, refer to the individual script files in `src/scripts/` for implementation details.