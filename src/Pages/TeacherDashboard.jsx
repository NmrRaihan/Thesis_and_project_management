import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  Send, 
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  ClipboardList,
  Edit3,
  CheckCircle,
  Bell
} from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingCompletionRequests, setPendingCompletionRequests] = useState([]);
  const [supervisedGroups, setSupervisedGroups] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate(createPageUrl('TeacherLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
    
    // Set up polling to refresh data every 10 seconds
    const intervalId = setInterval(() => {
      const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUserData) {
        loadData(currentUserData);
      }
    }, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    // Load pending requests
    const requests = await db.entities.SupervisionRequest.filter({ 
      teacher_id: user.teacher_id,
      status: 'pending'
    });
    setPendingRequests(requests);
    
    // Load pending completion requests (Project/Thesis)
    const allCompletionRequests = await db.entities.ThesisCompletionRequest.list();
    const pendingCompletions = allCompletionRequests.filter(r => 
      r.teacher_id === user.teacher_id && r.status === 'pending_teacher'
    );
    setPendingCompletionRequests(pendingCompletions);
    
    // Load supervised groups - query by assigned_teacher_id (show all statuses)
    const allGroups = await db.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id
    });
    
    console.log('Teacher Dashboard - Loaded groups:', {
      teacherId: user.teacher_id,
      totalGroups: allGroups.length,
      groups: allGroups.map(g => ({
        id: g.id,
        group_name: g.group_name,
        status: g.status,
        assigned_teacher_id: g.assigned_teacher_id
      }))
    });
    
    // Filter to show only active/supervised groups
    const activeGroups = allGroups.filter(g => 
      g.status === 'supervised' || g.status === 'active'
    );
    setSupervisedGroups(activeGroups);
    
    // Update teacher's current student count based on supervised groups
    const currentStudentCount = activeGroups.reduce((count, group) => count + (group.member_count || group.members?.length || 1), 0);
    
    // Update the teacher's record in the database with the current count
    if (currentStudentCount !== user.current_students_count) {
      await db.entities.Teacher.update(user.id, {
        ...user,
        current_students_count: currentStudentCount
      });
      
      // Update current user in localStorage
      const updatedUser = { ...user, current_students_count: currentStudentCount };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
    
    // Load upcoming meetings
    const meetings = await db.entities.Meeting.filter({ 
      teacher_id: user.teacher_id,
      status: 'scheduled'
    });
    setUpcomingMeetings(meetings);
    
    setLoading(false);
  };

  const initials = currentUser?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'T';

  const handleUpdateProfile = async (profileData) => {
    try {
      const updatedUser = await db.entities.Teacher.update(currentUser.id, profileData);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherDashboard">
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-2xl bg-white/20" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-2xl bg-white/20" />
              <Skeleton className="h-32 rounded-2xl bg-white/20" />
              <Skeleton className="h-32 rounded-2xl bg-white/20" />
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="TeacherDashboard">
        <div className="max-w-7xl mx-auto space-y-4">
        {/* Compact Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-white/30 shadow-lg">
              <AvatarImage src={currentUser?.profile_photo} />
              <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 text-white">Welcome, {currentUser?.full_name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs">
                  {currentUser?.teacher_id}
                </span>
                {currentUser?.department && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs">
                    {currentUser?.department}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs">
                  {currentUser?.research_field}
                </span>
              </div>
            </div>
            <Button 
              onClick={() => setShowProfileEdit(true)}
              variant="secondary" 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Send}
            label="Pending Requests"
            value={pendingRequests.length}
            iconBg="bg-amber-500"
            delay={0.1}
          />
          <StatCard
            icon={CheckCircle}
            label="Completion Requests"
            value={pendingCompletionRequests.length}
            iconBg="bg-purple-500"
            delay={0.15}
          />
          <StatCard
            icon={Users}
            label="Current Students"
            value={`${currentUser?.current_students_count || 0}/${currentUser?.max_students}`}
            iconBg="bg-blue-500"
            delay={0.2}
          />
          <StatCard
            icon={FileText}
            label="Active Groups"
            value={supervisedGroups.length}
            iconBg="bg-emerald-500"
            delay={0.3}
          />
          <StatCard
            icon={BookOpen}
            label="Publications"
            value={currentUser?.publications?.length || 0}
            iconBg="bg-purple-500"
            delay={0.4}
          />
        </div>

        {/* Completion Requests Alert - Compact */}
        {pendingCompletionRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur border border-purple-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      🔔 {pendingCompletionRequests.length} Project/Thesis Completion {pendingCompletionRequests.length === 1 ? 'Request' : 'Requests'} Pending
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Review and approve student completions
                    </p>
                  </div>
                </div>
                <Link to="/teacher/completion-review">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('TeacherRequests')}>
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50 hover:scale-105">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <Send className="w-5 h-5 text-amber-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Review Requests</h3>
                    <p className="text-xs text-blue-200">{pendingRequests.length} pending</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('MyStudents')}>
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-blue-400/50 hover:scale-105">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Users className="w-5 h-5 text-blue-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">My Students</h3>
                    <p className="text-xs text-blue-200">View groups</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('TaskBoard')}>
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-purple-400/50 hover:scale-105">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ClipboardList className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Task Board</h3>
                    <p className="text-xs text-blue-200">Manage tasks</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('TeacherMeetings')}>
              <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-emerald-400/50 hover:scale-105">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Calendar className="w-5 h-5 text-emerald-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Meetings</h3>
                    <p className="text-xs text-blue-200">Schedule</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending Requests - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-5 bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Pending Requests
                </h2>
                <Link to={createPageUrl('TeacherRequests')}>
                  <Button variant="outline-dark" size="sm">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-blue-200">
                  <Send className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">Group Request</p>
                          <p className="text-sm text-blue-200">
                            {new Date(req.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-amber-500/30 text-amber-200 border-amber-400/50">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Upcoming Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Upcoming Meetings
                </h2>
                <Link to={createPageUrl('TeacherMeetings')}>
                  <Button variant="outline-dark">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8 text-blue-200">
                  <Calendar className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                  <p>No upcoming meetings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{meeting.title}</p>
                          <p className="text-sm text-blue-200">
                            {new Date(meeting.scheduled_date).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/50">Scheduled</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Accepted Topics */}
        {currentUser?.accepted_topics?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-4">Your Interested Topics</h2>
              <div className="flex flex-wrap gap-2">
                {currentUser?.accepted_topics?.map((topic, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-500/30 text-blue-200 border-blue-400/50 px-3 py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        user={currentUser}
        userType="teacher"
        onSave={handleUpdateProfile}
        darkMode={true}
      />
    </DashboardLayout>
  </PageBackground>
);
}