# Thesis & Project Management Platform

A comprehensive academic platform for managing thesis and project work with student and teacher collaboration features.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation
1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd e:\thesisProject\NUB-Thesis-and-Project-Management
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
```bash
npm run dev
```

The application will be available at http://localhost:5173

## User Roles

### Student Features
- Register and login
- Form groups with up to 3 members
- Create project proposals
- Communicate with group members via chat
- Request supervision from teachers
- Track progress and submit weekly updates
- Schedule and manage meetings
- Share files with group members

### Teacher Features
- Register and login
- Review and accept supervision requests
- Communicate with students via chat
- Monitor student progress
- Schedule and manage meetings
- Review and provide feedback on submissions
- Assign tasks to student groups

## Database Management

The application uses **browser localStorage** for data persistence. All data is stored locally in your browser - no external database or server required.

### ⚠️ Important Security Update (March 2026)
All passwords are now **hashed with bcrypt** before storage. This includes:
- Student passwords
- Teacher passwords  
- Admin passwords

If you have existing accounts, run the migration script:
```bash
npm run migrate-passwords
```

### Management Commands
```bash
# Show available management commands
npm run manage

# Create admin user (password will be hashed)
npm run add-admin <username> <password>
# Example: npm run add-admin myadmin MySecurePass123!

# Migrate existing passwords to bcrypt
npm run migrate-passwords

# Clear all data
npm run manage clearalldata

# List all database entities
npm run manage listentities

# Show database statistics
npm run manage stats
```

### Admin Panel
- Access via the "Admin Panel" link in the footer
- **Create admin account:** `npm run add-admin <username> <password>`
- **Default credentials removed for security**
- Features:
  - View all database entities
  - Clear all data
  - System statistics

## Default Accounts

### ⚠️ Security Notice
Default hardcoded credentials have been **removed** for security. Create your own admin account using:
```bash
npm run add-admin admin your_secure_password
```

### Sample Student (Demo Data)
- Student ID: `S001`
- Password: `password123` *(if sample data is loaded)*

### Sample Teacher (Demo Data)
- Teacher ID: `T001`
- Password: `password123` *(if sample data is loaded)*

## Troubleshooting

### If Registration/Login Shows "Fail to Fetch" Error
The application now uses **localStorage only** - no backend server required.

1. Refresh the page
2. Clear browser data if needed:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear localStorage
3. Reinstall dependencies: `npm install`

### Reset All Data
If you need to completely reset the application:
1. Via Admin Panel:
   - Navigate to Admin Panel
   - Login with admin credentials
   - Click "Clear All Data"
2. Via Browser Console:
   ```javascript
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('entity_')) {
       localStorage.removeItem(key);
     }
   });
   ```
3. Via Management Command:
   ```bash
   npm run manage clearalldata
   ```

## Development

### Project Structure
```
src/
├── Entities/          # Data models (JSON)
├── Pages/             # UI pages for students and teachers
├── api/               # Database clients (base44Client for localStorage)
├── components/        # Reusable UI components
├── services/          # Business logic services (databaseService.js)
├── scripts/           # Management scripts (add-admin, migrate-passwords, etc.)
└── utils/             # Utility functions
```

### Architecture
**LocalStorage Only** - All data persists in browser localStorage
- No backend server required
- No network latency
- Works offline
- Browser-specific storage (~5-10MB limit)

For production deployment considerations, see `SECURITY_ARCHITECTURE_IMPROVEMENTS.md`

### Technology Stack
- React 19 with Vite
- Tailwind CSS v4
- Framer Motion for animations
- Lucide React for icons
- React Router DOM for routing

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is licensed under the MIT License.