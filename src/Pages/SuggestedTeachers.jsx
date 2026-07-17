import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Users, 
  FileText, 
  Loader2, 
  Sparkles, 
  Crown, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle, 
  MessageSquare, 
  Calendar,
  Mail,
  BookOpen,
  Star,
  Send,
  Award,
  TrendingUp,
  Eye,
  X
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function SuggestedTeachersEnhanced() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    try {
      // Load student's group and proposal first
      if (user.group_id) {
        // FIX: Use 'id' instead of 'group_id' for filtering
        const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
        console.log('SuggestedTeachers - Groups loaded:', groups);
        
        if (groups.length > 0) {
          const groupData = groups[0];
          setGroup(groupData);
                
          // Load proposal
          const proposals = await db.entities.Proposal.filter({ group_id: groupData.id });
          if (proposals.length > 0) {
            setProposal(proposals[0]);
          }
                
          // Load sent requests
          const requests = await db.entities.SupervisionRequest.filter({ group_id: groupData.id });
          setSentRequests(requests);
          
          // If group has an assigned teacher, load that teacher
          if (groupData.assigned_teacher_id) {
            const teachers = await db.entities.Teacher.filter({ teacher_id: groupData.assigned_teacher_id });
            if (teachers.length > 0) {
              console.log('SuggestedTeachers - Assigned teacher found:', teachers[0]);
              // Show only the assigned teacher
              setTeachers(teachers);
            } else {
              console.log('SuggestedTeachers - Assigned teacher not found in database');
              setTeachers([]);
            }
          } else {
            // No teacher assigned yet, show ALL teachers (not just active)
            const allTeachers = await db.entities.Teacher.list();
            console.log('SuggestedTeachers - All teachers loaded:', {
              total: allTeachers.length,
              teachers: allTeachers.map(t => ({
                id: t.id,
                teacher_id: t.teacher_id,
                name: t.full_name,
                status: t.status,
                department: t.department
              }))
            });
            setTeachers(allTeachers);
          }
        } else {
          console.log('SuggestedTeachers - No group found with ID:', user.group_id);
        }
      } else {
        // No group, load all teachers anyway
        const allTeachers = await db.entities.Teacher.list();
        console.log('SuggestedTeachers - No group, loaded all teachers:', allTeachers.length);
        setTeachers(allTeachers);
      }
    } catch (error) {
      console.error('SuggestedTeachers - Error loading data:', error);
      toast.error('Failed to load teachers');
    }
    
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!selectedTeacher || !group || !proposal) return;
    
    // Check if user is the group leader
    if (group.leader_student_id !== currentUser.student_id) {
      toast.error('Only the group leader can send supervision requests');
      return;
    }
    
    // Check if proposal has been approved by admin
    if (!proposal || proposal.status !== 'approved') {
      toast.error('Your proposal must be approved by admin before requesting a supervisor');
      return;
    }
    
    setSending(true);
    
    try {
      // Generate unique request ID
      const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      await db.entities.SupervisionRequest.create({
        request_id: requestId,
        group_id: group.id,
        teacher_id: selectedTeacher.teacher_id,
        request_message: requestMessage,
        status: 'pending',
        requested_date: new Date()
      });
      
      loadData(currentUser);
      setSelectedTeacher(null);
      setRequestMessage('');
      toast.success('Supervision request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request');
    }
    
    setSending(false);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const query = searchQuery.toLowerCase();
    return (
      (teacher.full_name || '').toLowerCase().includes(query) ||
      (teacher.department || '').toLowerCase().includes(query) ||
      (teacher.research_field || '').toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-blue-200">Loading teachers...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check if user has a group
  if (!group) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Group Found</h2>
              <p className="text-blue-200 mb-6">
                You need to be part of a group to request supervision from teachers.
              </p>
              <Button 
                onClick={() => navigate(createPageUrl('StudentDashboard'))}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Dashboard
              </Button>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check if group is active (admin has approved it)
  if (group.status !== 'active' && group.status !== 'supervised') {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Group Not Yet Activated</h2>
              <p className="text-blue-200 mb-2">
                Your group "{group.group_name}" is still in <strong>{group.status}</strong> status.
              </p>
              <p className="text-blue-200 mb-6">
                Please wait for the admin to activate your group before requesting supervisors.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate(createPageUrl('StudentDashboard'))}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl('GroupChat'))}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Open Group Chat
                </Button>
              </div>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check if user is the group leader
  const isGroupLeader = group.leader_student_id === currentUser.student_id;

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="SuggestedTeachers">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Find Your Supervisor</h1>
            <p className="text-blue-200 mt-2">
              Connect with teachers who match your research interests
            </p>
            
            {/* Group Leader Indicator */}
            <div className="mt-4 flex items-center gap-3">
              {isGroupLeader ? (
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full">
                  <Crown className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">You are the Group Leader</span>
                  <span className="text-green-400 text-sm">(Can send supervision requests)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 px-4 py-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Group Member</span>
                  <span className="text-yellow-400 text-sm">(Only leaders can send requests)</span>
                </div>
              )}
            </div>
          </div>

          {/* Group Info */}
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{group.group_name}</h2>
                <p className="text-blue-200 mt-1">
                  {proposal ? proposal.title : 'No proposal created yet'}
                </p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-sm text-blue-300">Requests Sent: {sentRequests.length}</p>
                <p className="text-sm text-blue-300">
                  Status: <span className="font-medium capitalize">{group.status}</span>
                </p>
                {group.assigned_teacher_id && (
                  <div className="bg-green-500/20 border border-green-400/30 px-3 py-1 rounded-full inline-block">
                    <p className="text-xs text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Teacher Assigned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Assigned Teacher Banner */}
          {group.assigned_teacher_id && teachers.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Your Assigned Supervisor</h3>
                  <p className="text-green-200 text-sm mb-3">
                    The admin has assigned <strong>{teachers[0]?.full_name}</strong> as your group supervisor. 
                    You can now connect with them through messages and meetings.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate(createPageUrl('StudentMessages'))}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button 
                      onClick={() => navigate(createPageUrl('StudentMeetings'))}
                      variant="outline"
                      className="border-green-400/30 text-green-200 hover:bg-green-500/20"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
            <Input
              placeholder="Search teachers by name, department, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Teachers Grid */}
          {filteredTeachers.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No teachers found</h3>
              <p className="text-blue-200">Try adjusting your search criteria</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher, index) => {
                const initials = teacher.full_name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || 'T';
                
                const isAssigned = group.assigned_teacher_id === teacher.teacher_id;
                
                return (
                  <motion.div
                    key={teacher.id || teacher.teacher_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                      {/* Top Gradient Bar */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      
                      {/* Assigned Badge */}
                      {isAssigned && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-green-500 text-white border-none px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assigned
                          </Badge>
                        </div>
                      )}
                      
                      <div className="p-6 space-y-5">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-start gap-4">
                          <Avatar className="w-20 h-20 border-3 border-white/30 shadow-lg ring-2 ring-white/10">
                            <AvatarImage src={teacher.profile_photo} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-2xl font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-lg truncate group-hover:text-blue-200 transition-colors">
                              {teacher.full_name}
                            </h3>
                            <p className="text-blue-300 text-sm flex items-center gap-1 mt-1">
                              <Award className="w-4 h-4" />
                              {teacher.department || 'Department Not Specified'}
                            </p>
                            <Badge variant="secondary" className="mt-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/30">
                              {teacher.research_field || 'General'}
                            </Badge>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-blue-300">Publications</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                              {teacher.publications?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Accepted Topics */}
                        {teacher.accepted_topics && teacher.accepted_topics.length > 0 && (
                          <div>
                            <p className="text-xs text-blue-300 mb-2 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400" />
                              Research Interests:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.accepted_topics.slice(0, 3).map((topic, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-white/5 text-blue-200 border-white/20"
                                >
                                  {topic}
                                </Badge>
                              ))}
                              {teacher.accepted_topics.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-white/5 text-blue-200 border-white/20">
                                  +{teacher.accepted_topics.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              teacher.status === 'active' ? 'bg-green-500 animate-pulse' : 
                              teacher.status === 'on_leave' ? 'bg-yellow-500' : 
                              'bg-gray-500'
                            }`} />
                            <span className="text-xs text-blue-300 capitalize">
                              {teacher.status === 'active' ? 'Active' : 
                               teacher.status === 'on_leave' ? 'On Leave' : 
                               teacher.status || 'Active'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setViewingTeacher(teacher)}
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 border-white/20 text-white hover:bg-white/10 bg-transparent"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            
                            {isAssigned ? (
                              <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">
                                Connected
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => {
                                  if (!isGroupLeader) {
                                    toast.error('Only group leaders can send supervision requests');
                                    return;
                                  }
                                  if (!proposal) {
                                    toast.error('You need to create a proposal first');
                                    return;
                                  }
                                  if (proposal.status !== 'approved') {
                                    toast.error('Your proposal must be approved by admin first');
                                    return;
                                  }
                                  setSelectedTeacher(teacher);
                                }}
                                disabled={!isGroupLeader || !proposal || proposal.status !== 'approved'}
                                size="sm"
                                className="h-9 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Teacher Profile Dialog */}
          <Dialog open={!!viewingTeacher} onOpenChange={() => setViewingTeacher(null)}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
              {viewingTeacher && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl flex items-center gap-3">
                      <Avatar className="w-16 h-16 border-2 border-blue-400">
                        <AvatarImage src={viewingTeacher.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-2xl font-bold">
                          {viewingTeacher.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{viewingTeacher.full_name}</h2>
                        <p className="text-blue-300 text-sm flex items-center gap-2 mt-1">
                          <Award className="w-4 h-4" />
                          {viewingTeacher.department}
                        </p>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="text-blue-200">
                      Complete profile and research information
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Contact Information */}
                    <Card className="p-5 bg-white/5 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-400" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-blue-300">Email</p>
                            <p className="text-white">{viewingTeacher.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-xs text-blue-300">Department</p>
                            <p className="text-white">{viewingTeacher.department || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-xs text-blue-300">Research Field</p>
                            <p className="text-white">{viewingTeacher.research_field || 'General'}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Academic Profile */}
                    <Card className="p-5 bg-white/5 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Academic Profile
                      </h3>
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-400/20">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-blue-200">Publications</span>
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {viewingTeacher.publications?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Publications List */}
                      {viewingTeacher.publications && viewingTeacher.publications.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Recent Publications:</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {viewingTeacher.publications.map((pub, idx) => (
                              <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-white text-sm font-medium">{pub.title}</p>
                                <p className="text-blue-300 text-xs mt-1">
                                  {pub.journal}{pub.year ? ` • ${pub.year}` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Research Interests */}
                    {viewingTeacher.accepted_topics && viewingTeacher.accepted_topics.length > 0 && (
                      <Card className="p-5 bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-400" />
                          Research Interests & Accepted Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {viewingTeacher.accepted_topics.map((topic, idx) => (
                            <Badge 
                              key={idx} 
                              className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-400/30 px-3 py-1.5"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Status */}
                    <Card className="p-5 bg-white/5 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Current Status
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          viewingTeacher.status === 'active' ? 'bg-green-500 animate-pulse' : 
                          viewingTeacher.status === 'on_leave' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-white capitalize text-lg font-medium">
                          {viewingTeacher.status?.replace('_', ' ') || 'Active'}
                        </span>
                      </div>
                    </Card>
                  </div>
                  
                  <DialogFooter className="flex gap-3">
                    <Button
                      onClick={() => setViewingTeacher(null)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                    {group.assigned_teacher_id !== viewingTeacher.teacher_id && (
                      <Button
                        onClick={() => {
                          setViewingTeacher(null);
                          if (isGroupLeader && proposal && proposal.status === 'approved') {
                            setSelectedTeacher(viewingTeacher);
                          }
                        }}
                        disabled={!isGroupLeader || !proposal || proposal.status !== 'approved'}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Request Supervision
                      </Button>
                    )}
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Send Request Dialog */}
          <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Request Supervision from {selectedTeacher?.full_name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Group Information</h3>
                  <p className="text-blue-200 text-sm">Group: {group?.group_name}</p>
                  <p className="text-blue-200 text-sm">Proposal: {proposal?.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message to Teacher
                  </label>
                  <Textarea
                    placeholder="Explain why you'd like this teacher to supervise your project..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTeacher(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={sending || !requestMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}