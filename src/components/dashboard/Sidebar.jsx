import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
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

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
  { icon: Users, label: 'Students', page: '/admin/students' },
  { icon: GraduationCap, label: 'Teachers', page: '/admin/teachers' },
  { icon: Users, label: 'Groups', page: '/admin/groups' },
  { icon: FileText, label: 'Proposals', page: '/admin/proposals' },
];

export default function Sidebar({ userType, isSupervised, currentPage }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userGroup, setUserGroup] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    console.log('🔄 Sidebar - useEffect triggered');
    
    // Load current user and group info
    const loadUserData = async () => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      console.log('📋 Sidebar - Current user from localStorage:', user?.student_id || 'NO USER');
      
      if (user) {
        setCurrentUser(user);
        
        // If user has a group_id, fetch the latest group status
        if (user.group_id) {
          console.log('🔗 Sidebar - User has group_id:', user.group_id);
          try {
            const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
            if (groups.length > 0) {
              console.log('Sidebar - Group status loaded:', {
                groupId: groups[0].id,
                status: groups[0].status,
                assigned_teacher_id: groups[0].assigned_teacher_id,
                supervisor_name: groups[0].supervisor_name
              });
              setUserGroup(groups[0]);
              
              // Load unread message count for THIS user
              await loadUnreadMessages(user.group_id);
            } else {
              console.log('⚠️ Sidebar - No groups found for id:', user.group_id);
            }
          } catch (error) {
            console.error('❌ Error loading group:', error);
          }
        } else {
          console.log('ℹ️ Sidebar - User has no group_id');
        }
      }
    };
    
    loadUserData();
    
    // Set up polling to refresh group status and messages every 2 seconds (faster!)
    const intervalId = setInterval(() => {
      loadUserData();
    }, 2000);
    
    // Listen for storage changes (when other tabs update localStorage)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('entity_Message')) {
        console.log('💾 Storage event detected - Message changed!');
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user?.group_id) {
          loadUnreadMessages(user.group_id);
        }
      }
    };
    
    // Listen for custom message sent event (same tab)
    const handleMessageSent = () => {
      console.log('📤 Custom event: Message sent in same tab!');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user?.group_id) {
        // Wait a bit for the message to be saved
        setTimeout(() => {
          loadUnreadMessages(user.group_id);
        }, 500);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('messageSent', handleMessageSent);
    
    // Cleanup interval on unmount
    return () => {
      console.log('🧹 Sidebar - Cleaning up');
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('messageSent', handleMessageSent);
    };
  }, []);

  const loadUnreadMessages = async (groupId) => {
    try {
      console.log('\n========== SIDEBAR UNREAD CHECK ==========');
      console.log('🔍 Starting unread check for group:', groupId);
      
      const allMessages = await db.entities.Message.list();
      console.log('📬 ALL messages in database:', allMessages.length);
      
      // Filter for this group's chat messages
      const messages = allMessages.filter(m => 
        m.conversation_id === groupId && 
        m.conversation_type === 'group_chat'
      );
      
      console.log('📬 Messages for THIS group:', messages.length);
      console.log('📬 Group messages:', messages.map(m => ({
        id: m.id,
        sender: m.sender_name,
        sender_id: m.sender_id,
        date: m.created_date || m.created_at,
        content: m.content?.substring(0, 30)
      })));
      
      // Get THIS user's last read timestamp
      const lastReadKey = `groupChat_lastRead_${groupId}`;
      const lastReadTime = localStorage.getItem(lastReadKey);
      
      console.log('🕐 Last read key:', lastReadKey);
      console.log('🕐 Last read time:', lastReadTime || '❌ NEVER READ');
      console.log('👤 Current user ID:', currentUser?.student_id);
      
      if (messages.length === 0) {
        console.log('⚠️ NO messages in group chat!');
        setUnreadMessageCount(0);
        return;
      }
      
      // Count messages
      let unreadCount = 0;
      
      messages.forEach((msg, index) => {
        const msgDate = new Date(msg.created_date || msg.created_at);
        const isNotOwn = msg.sender_id !== currentUser?.student_id;
        
        console.log(`\n--- Message ${index + 1} ---`);
        console.log('  From:', msg.sender_name, `(${msg.sender_id})`);
        console.log('  Date:', msgDate.toISOString());
        console.log('  Is own message?', !isNotOwn);
        
        if (!isNotOwn) {
          console.log('  ❌ SKIP - This is YOUR message');
          return;
        }
        
        if (!lastReadTime) {
          console.log('  ✅ COUNT - Never read before, counting ALL from others');
          unreadCount++;
          return;
        }
        
        const lastReadDate = new Date(lastReadTime);
        const isAfterLastRead = msgDate > lastReadDate;
        
        console.log('  Last read:', lastReadDate.toISOString());
        console.log('  Message after last read?', isAfterLastRead);
        
        if (isAfterLastRead) {
          console.log('  ✅ COUNT - New message!');
          unreadCount++;
        } else {
          console.log('  ❌ SKIP - Already read');
        }
      });
      
      console.log('\n🔢 FINAL UNREAD COUNT:', unreadCount);
      console.log('========================================\n');
      
      setUnreadMessageCount(unreadCount);
    } catch (error) {
      console.error('❌ Error loading unread messages:', error);
    }
  };

  // Determine which nav items to show based on user state
  let navItems;
  
  if (userType === 'admin') {
    navItems = adminNavItems;
  } else if (userType === 'teacher') {
    navItems = teacherNavItems;
  } else {
    // For students, check group status
    const hasGroup = currentUser?.group_id;
    const isSupervisedStatus = userGroup?.status === 'supervised';
    
    if (isSupervisedStatus) {
      // Show supervised student navigation
      navItems = supervisedStudentNavItems;
    } else if (hasGroup) {
      // Has group but not supervised yet - hide Select Partners
      navItems = studentNavItems.filter(item => item.page !== 'SelectPartners');
    } else {
      // No group - show all options including Select Partners
      navItems = studentNavItems;
    }
  }

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
          const isActive = currentPage === item.page || window.location.pathname === item.page;
          
          // Check if this is the Group Chat item and show badge
          const isGroupChat = item.page === 'GroupChat';
          const showBadge = isGroupChat && unreadMessageCount > 0;
          
          return (
            <Link
              key={item.page}
              to={item.page.startsWith('/') ? item.page : createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25" 
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
              )} />
              <span className="font-medium text-sm flex-1">{item.label}</span>
              
              {/* Message Badge */}
              {showBadge && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                  <span className="text-[10px] font-bold text-white">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                </div>
              )}
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