import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Send, 
  ArrowRight,
  CheckCircle,
  UserPlus,
  BookOpen,
  Bell,
  Sparkles,
  Edit3,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []); // Only run once on mount

  const loadData = async (user) => {
    setLoading(true);
    
    // Load group if exists
    if (user.group_id) {
      const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
        
        // Load group members
        const members = await db.entities.Student.filter({ group_id: groups[0].group_id });
        // Ensure correct admin status based on group's leader information
        const updatedMembers = members.map(member => ({
          ...member,
          is_group_admin: member.student_id === groups[0].leader_student_id
        }));
        setGroupMembers(updatedMembers);
        
        // Load proposal
        const proposals = await db.entities.Proposal.filter({ group_id: groups[0].id });
        if (proposals.length > 0) setProposal(proposals[0]);
        
        // Load supervision requests
        const reqs = await db.entities.SupervisionRequest.filter({ group_id: groups[0].id });
        setRequests(reqs);
      }
    }
    
    // Load pending invitations to this student
    const invites = await db.entities.GroupInvitation.filter({ 
      to_student_id: user.student_id,
      status: 'pending'
    });
    setPendingInvites(invites);
    
    setLoading(false);
  };

  const handleAcceptInvite = async (invite) => {
    try {
      // Update invitation
      await db.entities.GroupInvitation.update(invite.id, { status: 'accepted' });
      
      // Update student with group_id
      await db.entities.Student.update(currentUser.id, { group_id: invite.group_id });
      
      // Update group member_ids
      const groups = await db.entities.StudentGroup.filter({ id: invite.group_id });
      if (groups.length > 0) {
        const updatedMembers = [...(groups[0].member_ids || []), currentUser.student_id];
        await db.entities.StudentGroup.update(invite.group_id, { member_ids: updatedMembers });
      }
      
      // Refresh user data
      const updatedUser = { ...currentUser, group_id: invite.group_id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      loadData(updatedUser);
      toast.success('Group invitation accepted!');
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invitation. Please try again.');
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      // Update invitation status to declined
      await db.entities.GroupInvitation.update(invite.id, { status: 'declined' });
      
      // Remove from pending invites
      setPendingInvites(pendingInvites.filter(i => i.id !== invite.id));
      toast.success('Group invitation declined.');
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error('Failed to decline invitation. Please try again.');
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const updatedUser = await db.entities.Student.update(currentUser.id, profileData);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const initials = currentUser?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'S';

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentDashboard">
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
      <DashboardLayout userType="student" currentPage="StudentDashboard">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-5">
                <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
                  <AvatarImage src={currentUser?.profile_photo} />
                  <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-1 text-white">Welcome, {currentUser?.full_name}!</h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                      ID: {currentUser?.student_id}
                    </span>
                    {currentUser?.department && (
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                        {currentUser?.department}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowProfileEdit(true)}
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                
                {group?.status === 'supervised' && (
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Supervised
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-amber-500/10 border border-amber-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <h2 className="font-semibold text-white">Pending Group Invitations</h2>
                </div>
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Group Invitation</p>
                        <p className="text-sm text-blue-200">From: {invite.from_student_id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptInvite(invite)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleDeclineInvite(invite)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{groupMembers.length || 0}</p>
                    <p className="text-blue-200">Group Members</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {proposal?.status?.replace('_', ' ') || 'Not Started'}
                    </p>
                    <p className="text-blue-200">Proposal Status</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{requests.length}</p>
                    <p className="text-blue-200">Requests Sent</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {!group && !currentUser?.group_id && (
                <button onClick={() => navigate('/student/create-group-request')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-blue-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                        <UserPlus className="w-6 h-6 text-blue-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Create Group</h3>
                        <p className="text-sm text-blue-200">Request admin approval</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {currentUser?.is_group_admin && currentUser?.group_id && (
                <button onClick={() => navigate('/student/invite-students')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-purple-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <UserPlus className="w-6 h-6 text-purple-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Invite Students</h3>
                        <p className="text-sm text-blue-200">Add members to group</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {currentUser?.is_group_admin && currentUser?.group_id && (
                <button onClick={() => navigate('/student/create-group-proposal')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-emerald-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <FileText className="w-6 h-6 text-emerald-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Create Proposal</h3>
                        <p className="text-sm text-blue-200">Group research proposal</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {currentUser?.is_group_admin && currentUser?.group_id && currentUser?.group_name && (
                <button onClick={() => navigate('/student/request-teachers')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <GraduationCap className="w-6 h-6 text-amber-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Request Teachers</h3>
                        <p className="text-sm text-blue-200">Find supervisors</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {!currentUser?.group_id && (
                <button onClick={() => navigate('/student/group-invitations')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <Bell className="w-6 h-6 text-amber-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Group Invitations</h3>
                        <p className="text-sm text-blue-200">View pending invites</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {group && (
                <Link to={createPageUrl('GroupChat')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-purple-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <MessageSquare className="w-6 h-6 text-purple-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Group Chat</h3>
                        <p className="text-sm text-blue-200">Discuss with team</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}
              
              <Link to={createPageUrl('CreateProposal')}>
                <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-emerald-400/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <Sparkles className="w-6 h-6 text-emerald-300 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Create Proposal</h3>
                      <p className="text-sm text-blue-200">AI-powered generator</p>
                    </div>
                  </div>
                </Card>
              </Link>
              
              <Link to={createPageUrl('SuggestedTeachers')}>
                <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <BookOpen className="w-6 h-6 text-amber-300 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Find Supervisors</h3>
                      <p className="text-sm text-blue-200">Auto-suggested</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </motion.div>

          {/* Group Members */}
          {groupMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Your Group</h2>
                  <Badge className="bg-white/20 text-white border-white/30">{group?.project_type || 'Undecided'}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                      <Avatar>
                        <AvatarImage src={member.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {member.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{member.full_name}</p>
                        <p className="text-sm text-blue-200">ID: {member.student_id}</p>
                        {member.is_group_admin && (
                          <Badge className="mt-1 text-xs bg-blue-500/30 text-blue-200 border-blue-400/50">Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Proposal Status */}
          {proposal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Your Proposal</h2>
                  <Badge className={proposal.status === 'approved' ? 'bg-green-500/30 text-green-200 border-green-400/50' : proposal.status === 'submitted' ? 'bg-blue-500/30 text-blue-200 border-blue-400/50' : proposal.status === 'revision_required' ? 'bg-amber-500/30 text-amber-200 border-amber-400/50' : 'bg-white/20 text-white border-white/30'}>
                    {proposal.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{proposal.title}</h3>
                <p className="text-blue-200 line-clamp-2">{proposal.description}</p>
                <Link to={createPageUrl('CreateProposal')}>
                  <Button variant="outline" className="mt-4 border-white/30 text-white hover:bg-white/10">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </div>
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          user={currentUser}
          userType="student"
          onSave={handleUpdateProfile}
          darkMode={true}
        />
      </DashboardLayout>
    </PageBackground>
  );
}