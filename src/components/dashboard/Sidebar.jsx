import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  UserCheck,
  Send,
  Mail,
  Calendar,
  FolderOpen,
  ClipboardList,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils';

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'StudentDashboard' },
  { icon: Users, label: 'Select Partners', page: 'SelectPartners' },
  { icon: MessageSquare, label: 'Group Chat', page: 'GroupChat' },
  { icon: FileText, label: 'Create Proposal', page: 'CreateProposal' },
  { icon: UserCheck, label: 'Suggested Teachers', page: 'SuggestedTeachers' },
  { icon: Send, label: 'My Requests', page: 'StudentRequests' },
  { icon: Mail, label: 'Messages', page: 'StudentMessages' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'TeacherDashboard' },
  { icon: Send, label: 'Student Requests', page: 'TeacherRequests' },
  { icon: Users, label: 'My Students', page: 'MyStudents' },
  { icon: ClipboardList, label: 'Task Board', page: 'TaskBoard' },
  { icon: Calendar, label: 'Meetings', page: 'TeacherMeetings' },
  { icon: FolderOpen, label: 'Shared Files', page: 'TeacherFiles' },
  { icon: TrendingUp, label: 'Progress Tracker', page: 'ProgressTracker' },
  { icon: Mail, label: 'Messages', page: 'TeacherMessages' },
];

const supervisedStudentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'StudentDashboard' },
  { icon: MessageSquare, label: 'Group Chat', page: 'GroupChat' },
  { icon: Mail, label: 'Teacher Messages', page: 'StudentMessages' },
  { icon: ClipboardList, label: 'My Tasks', page: 'StudentTasks' },
  { icon: Calendar, label: 'Meetings', page: 'StudentMeetings' },
  { icon: FolderOpen, label: 'Shared Files', page: 'StudentFiles' },
  { icon: TrendingUp, label: 'Weekly Progress', page: 'StudentProgress' },
];

export default function Sidebar({ userType, isSupervised, currentPage }) {
  const navigate = useNavigate();
  const navItems = userType === 'teacher' 
    ? teacherNavItems 
    : (isSupervised ? supervisedStudentNavItems : studentNavItems);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <motion.div
      initial={false}
      animate={{ x: 0 }}
      className={cn(
        "h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col",
        "w-64"
      )}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">ThesisHub</h2>
            <p className="text-xs text-slate-400 capitalize">{userType} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25" 
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
}