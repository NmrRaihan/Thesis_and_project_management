// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import './initializeAdminData.js';

// Pages
import Home from './Pages/Home.jsx';
import StudentLogin from './Pages/StudentLogin.jsx';
import StudentRegister from './Pages/StudentRegister.jsx';
import StudentDashboard from './Pages/StudentDashboard.jsx';
import SelectPartners from './Pages/SelectPartners.jsx';
import GroupChat from './Pages/GroupChat.jsx';
import CreateProposal from './Pages/CreateProposal.jsx';
import SuggestedTeachers from './Pages/SuggestedTeachers.jsx';
import StudentRequests from './Pages/StudentRequests.jsx';
import StudentMessages from './Pages/StudentMessages.jsx';
import StudentMeetings from './Pages/StudentMeetings.jsx';
import StudentTasks from './Pages/StudentTasks.jsx';
import StudentFiles from './Pages/StudentFiles.jsx';
import StudentProgress from './Pages/StudentProgress.jsx';

import TeacherLogin from './Pages/TeacherLogin.jsx';
import TeacherRegister from './Pages/TeacherRegister.jsx';
import TeacherDashboard from './Pages/TeacherDashboard.jsx';
import TeacherRequests from './Pages/TeacherRequests.jsx';
import TeacherMessages from './Pages/TeacherMessages.jsx';
import TeacherMeetings from './Pages/TeacherMettings.jsx';
import TeacherFiles from './Pages/TeacherFiles.jsx';
import MyStudents from './Pages/MyStudents.jsx';
import ProgressTracker from './Pages/ProgressTracker.jsx';
import TaskBoard from './Pages/TaskBoard.jsx';
import DatabaseAdmin from './Pages/DatabaseAdmin.jsx';
import AdminLogin from './Pages/AdminLogin.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';

const AppRouter = () => (
  <BrowserRouter basename="/Thesis_and_project_management">
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Student Routes */}
      <Route path="/studentlogin" element={<StudentLogin />} />
      <Route path="/studentregister" element={<StudentRegister />} />
      <Route path="/studentdashboard" element={<StudentDashboard />} />
      <Route path="/selectpartners" element={<SelectPartners />} />
      <Route path="/groupchat" element={<GroupChat />} />
      <Route path="/createproposal" element={<CreateProposal />} />
      <Route path="/suggestedteachers" element={<SuggestedTeachers />} />
      <Route path="/studentrequests" element={<StudentRequests />} />
      <Route path="/studentmessages" element={<StudentMessages />} />
      <Route path="/studentmeetings" element={<StudentMeetings />} />
      <Route path="/studenttasks" element={<StudentTasks />} />
      <Route path="/studentfiles" element={<StudentFiles />} />
      <Route path="/studentprogress" element={<StudentProgress />} />
      
      {/* Teacher Routes */}
      <Route path="/teacherlogin" element={<TeacherLogin />} />
      <Route path="/teacherregister" element={<TeacherRegister />} />
      <Route path="/teacherdashboard" element={<TeacherDashboard />} />
      <Route path="/teacherrequests" element={<TeacherRequests />} />
      <Route path="/teachermessages" element={<TeacherMessages />} />
      <Route path="/teachermeetings" element={<TeacherMeetings />} />
      <Route path="/teacherfiles" element={<TeacherFiles />} />
      <Route path="/mystudents" element={<MyStudents />} />
      <Route path="/progresstracker" element={<ProgressTracker />} />
      <Route path="/taskboard" element={<TaskBoard />} />
      <Route path="/admin/database" element={<DatabaseAdmin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
    <Toaster position="top-right" richColors expand={false} />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);