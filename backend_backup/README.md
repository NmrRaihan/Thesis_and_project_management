# ThesisHub Backend API

This is the backend API for the ThesisHub admin system, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example` if provided):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/thesisHub
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thesisHub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin Credentials
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_EMAIL=admin@thesisHub.com

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
- For local installation: `mongod`
- For MongoDB Atlas: Ensure your connection string is correct in `.env`

### 4. Initialize Admin User

```bash
npm run init-admin
```

This will create the default admin user with credentials:
- Username: `admin`
- Password: `admin123`

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile (protected)
- `POST /api/admin/create` - Create new admin (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)
- `GET /api/dashboard/all-data` - Get all database entities (protected)
- `DELETE /api/dashboard/clear-all` - Clear all data (protected)
- `POST /api/dashboard/teachers` - Add new teacher (protected)

### Students
- `GET /api/students` - Get all students (protected)
- `GET /api/students/:id` - Get student by ID (protected)
- `POST /api/students` - Create new student (protected)

### Teachers
- `GET /api/teachers` - Get all teachers (protected)
- `GET /api/teachers/:id` - Get teacher by ID (protected)

### Health Check
- `GET /api/health` - Server health check

## Frontend Integration

The frontend is configured to connect to the backend API at `http://localhost:5000`. Make sure both the frontend and backend servers are running.

### Frontend Development Server
```bash
# In the root directory
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Database Schema

The system includes the following collections:
- Admins
- Students
- Teachers
- StudentGroups
- Proposals
- Messages
- Meetings
- Tasks
- SharedFiles
- WeeklyProgress
- GroupInvitations
- SupervisionRequests

## Testing

You can test the API endpoints using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example curl request:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env`
   - Verify network connectivity for MongoDB Atlas

2. **Port Already in Use**
   - Change the `PORT` in `.env`
   - Kill the process using the port: `lsof -i :5000` then `kill -9 <PID>`

3. **JWT Secret Error**
   - Make sure `JWT_SECRET` is set in `.env`
   - Generate a strong secret key

4. **CORS Issues**
   - Verify `FRONTEND_URL` matches your frontend address
   - Check browser console for CORS errors

### Logs

Check the console output for detailed error messages and server logs.

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Configure proper SSL/HTTPS
5. Use a process manager like PM2

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request