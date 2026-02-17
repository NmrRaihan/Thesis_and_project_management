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

### Management Commands
```bash
# Show available management commands
npm run manage

# Create default admin user
npm run manage createsuperuser

# Clear all data
npm run manage clearalldata

# List all database entities
npm run manage listentities

# Show database statistics
npm run manage stats
```

### Admin Panel
- Access via the "Admin Panel" link in the footer
- Login with: `admin` / `admin123`
- Features:
  - View all database entities
  - Clear all data
  - System statistics

## Default Accounts

### Sample Student
- Student ID: `S001`
- Password: `password123`

### Sample Teacher
- Teacher ID: `T001`
- Password: `password123`

### Admin
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### If Registration/Login Shows "Fail to Fetch" Error
This error occurs when the application tries to connect to a backend server. The application now uses browser localStorage only, so no server connection is needed.

1. Refresh the page
2. Check that `USE_REAL_DATABASE` is set to `false` in `src/services/databaseService.js`
3. Clear browser data if needed:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear localStorage

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
├── api/               # Database clients
├── components/        # Reusable UI components
├── services/          # Business logic services
└── scripts/           # Management scripts
```

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