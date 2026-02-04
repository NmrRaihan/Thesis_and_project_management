import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Send, 
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  ClipboardList,
  Edit3
} from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
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
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    // Load pending requests
    const requests = await db.entities.SupervisionRequest.filter({ 
      teacher_id: user.teacher_id,
      status: 'pending'
    });
    setPendingRequests(requests);
    
    // Load supervised groups
    const groups = await db.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id 
    });
    setSupervisedGroups(groups);
    
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
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-center gap-5">
            <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
              <AvatarImage src={currentUser?.profile_photo} />
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white">Welcome, {currentUser?.full_name}!</h1>
              <p className="text-indigo-100 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  ID: {currentUser?.teacher_id}
                </span>
                {currentUser?.department && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    {currentUser?.department}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {currentUser?.research_field}
                </span>
              </p>
            </div>
            <Button 
              onClick={() => setShowProfileEdit(true)}
              variant="secondary" 
              className="ml-auto bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={Send}
            label="Pending Requests"
            value={pendingRequests.length}
            iconBg="bg-amber-500"
            delay={0.1}
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={createPageUrl('TeacherRequests')}>
              <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <Send className="w-6 h-6 text-amber-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Review Requests</h3>
                    <p className="text-sm text-blue-200">{pendingRequests.length} pending</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('MyStudents')}>
              <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-blue-400/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Users className="w-6 h-6 text-blue-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">My Students</h3>
                    <p className="text-sm text-blue-200">View all groups</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('TaskBoard')}>
              <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-purple-400/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ClipboardList className="w-6 h-6 text-purple-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Task Board</h3>
                    <p className="text-sm text-blue-200">Manage tasks</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('TeacherMeetings')}>
              <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-emerald-400/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Calendar className="w-6 h-6 text-emerald-300 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Meetings</h3>
                    <p className="text-sm text-blue-200">Schedule & manage</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pending Requests
                </h2>
                <Link to={createPageUrl('TeacherRequests')}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
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