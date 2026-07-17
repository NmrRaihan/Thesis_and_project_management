import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
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
  GraduationCap,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { cn } from '@/utils';

// Helper function to format time ago
const getTimeAgo = (date) => {
  if (!date) return 'Unknown';
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return msgDate.toLocaleDateString();
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [hasCompletedWork, setHasCompletedWork] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
    
    // Check for new messages immediately
    checkForNewMessages(user);
    
    // Set up polling to refresh data every 2 seconds
    const intervalId = setInterval(() => {
      const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUserData) {
        loadData(currentUserData);
        checkForNewMessages(currentUserData);
      }
    }, 2000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Only run once on mount

  const loadData = async (user) => {
    setLoading(true);
    
    // Verify group_id is still valid
    if (user.group_id) {
      try {
        const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
        
        if (groups.length === 0) {
          // Group was deleted or student was removed
          console.log('Group no longer exists, updating localStorage...');
          
          const updatedUser = { 
            ...user, 
            group_id: null, 
            is_group_admin: false 
          };
          
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          
          toast.info('Your group membership has been updated. You can now select new partners.');
          
          // Load pending invitations for ungrouped student
          const invites = await db.entities.GroupInvitation.filter({ 
            to_student_id: user.student_id,
            status: 'pending'
          });
          setPendingInvites(invites);
          
          // Load sent invitations (ALWAYS load these)
          const allSent = await db.entities.GroupInvitation.filter({ 
            from_student_id: user.student_id
          });
          
          // Deduplicate: Keep only the latest invitation per student
          const uniqueSent = [];
          const seenStudents = new Map();
          allSent.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
          for (const invite of allSent) {
            if (!seenStudents.has(invite.to_student_id)) {
              seenStudents.set(invite.to_student_id, true);
              uniqueSent.push(invite);
            }
          }
          setSentInvites(uniqueSent);
          
          setLoading(false);
          return; // Exit early, no group to load
        }
        
        // Group exists, continue normal loading
        const group = groups[0];
        setGroup(group);
        
        console.log('Student Dashboard - Group loaded:', {
          groupId: group.id,
          groupName: group.group_name,
          status: group.status,
          assigned_teacher_id: group.assigned_teacher_id,
          supervisor_name: group.supervisor_name
        });
        
        // Load group members - query by group_id to get all students in the group
        const members = await db.entities.Student.filter({ group_id: group.id });
        
        // Ensure correct admin status based on group's leader information
        const updatedMembers = members.map(member => ({
          ...member,
          is_group_admin: member.student_id === group.leader_student_id
        }));
        setGroupMembers(updatedMembers);
        
        // Load proposal
        const proposals = await db.entities.Proposal.filter({ group_id: group.id });
        if (proposals.length > 0) {
          const proposal = proposals[0];
          setProposal(proposal);
          
          // Check if proposal was rejected
          if (proposal.status === 'rejected') {
            console.log('Proposal was rejected, freeing student...');
            
            // Update student record in database
            await db.entities.Student.update(user.id, {
              group_id: null,
              is_group_admin: false
            });
            
            // Update localStorage
            const updatedUser = { 
              ...user, 
              group_id: null, 
              is_group_admin: false 
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            
            toast.info('Your proposal was rejected. You can now select new partners.');
            
            // Clear group state
            setGroup(null);
            setGroupMembers([]);
            setProposal(null);
            
            // Load pending invitations for ungrouped student
            const invites = await db.entities.GroupInvitation.filter({ 
              to_student_id: user.student_id,
              status: 'pending'
            });
            setPendingInvites(invites);
            
            // Load sent invitations (ALWAYS load these)
            const allSent = await db.entities.GroupInvitation.filter({ 
              from_student_id: user.student_id
            });
            
            // Deduplicate: Keep only the latest invitation per student
            const uniqueSent = [];
            const seenStudents = new Map();
            allSent.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
            for (const invite of allSent) {
              if (!seenStudents.has(invite.to_student_id)) {
                seenStudents.set(invite.to_student_id, true);
                uniqueSent.push(invite);
              }
            }
            setSentInvites(uniqueSent);
            
            setLoading(false);
            return;
          }
        }
        
        // Load supervision requests
        const reqs = await db.entities.SupervisionRequest.filter({ group_id: group.id });
        setRequests(reqs);
        
      } catch (error) {
        console.error('Error verifying group:', error);
        // On error, assume group is invalid
        const updatedUser = { ...user, group_id: null, is_group_admin: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        toast.error('Error loading group data. Please refresh.');
            
        // Still load invitations even on error
        const invites = await db.entities.GroupInvitation.filter({ 
          to_student_id: user.student_id,
          status: 'pending'
        });
        setPendingInvites(invites);
            
        // Load sent invitations (ALWAYS load these)
        const allSent = await db.entities.GroupInvitation.filter({ 
          from_student_id: user.student_id
        });
            
        // Deduplicate: Keep only the latest invitation per student
        const uniqueSent = [];
        const seenStudents = new Map();
        allSent.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
        for (const invite of allSent) {
          if (!seenStudents.has(invite.to_student_id)) {
            seenStudents.set(invite.to_student_id, true);
            uniqueSent.push(invite);
          }
        }
        setSentInvites(uniqueSent);
      }
          
      // Load recent group chat messages for preview
      if (user.group_id) {
        try {
          const messages = await db.entities.Message.filter({ 
            conversation_id: user.group_id,
            conversation_type: 'group_chat'
          }, 'created_date');
              
          // Get last 5 messages
          const recent = messages.slice(-5).reverse();
          setGroupChatPreview(recent);
          console.log('Loaded group chat preview:', recent.length, 'messages');
        } catch (error) {
          console.error('Error loading group chat preview:', error);
        }
      }
    }
    
    // Load pending invitations to this student (if not already loaded above)
    if (!user.group_id || pendingInvites.length === 0) {
      const invites = await db.entities.GroupInvitation.filter({ 
        to_student_id: user.student_id,
        status: 'pending'
      });
      setPendingInvites(invites);
    }
    
    // Load sent invitations from this student (include all statuses) - FINAL FALLBACK
    // This ensures sent invites are ALWAYS loaded regardless of code path
    const allSent = await db.entities.GroupInvitation.filter({ 
      from_student_id: user.student_id
    });
    
    console.log('Student Dashboard - Sent invitations loaded:', {
      studentId: user.student_id,
      totalInvitations: allSent.length,
      invitations: allSent.map(inv => ({
        id: inv.id,
        to_student_id: inv.to_student_id,
        status: inv.status,
        created_at: inv.created_at
      }))
    });
    
    // Deduplicate: Keep only the latest invitation per student (by created_at date)
    const uniqueSent = [];
    const seenStudents = new Map();
    
    // Sort by date (newest first)
    allSent.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    
    // Keep only the most recent invitation for each student
    for (const invite of allSent) {
      if (!seenStudents.has(invite.to_student_id)) {
        seenStudents.set(invite.to_student_id, true);
        uniqueSent.push(invite);
      }
    }
    
    console.log('Student Dashboard - After deduplication:', {
      uniqueCount: uniqueSent.length,
      invites: uniqueSent.map(inv => `${inv.to_student_id} (${inv.status})`)
    });
    
    setSentInvites(uniqueSent);
    
    // Check if student has completed work
    try {
      const completionRequests = await db.entities.ThesisCompletionRequest.list();
      const studentCompletions = completionRequests.filter(r => 
        r.student_id === user.student_id && 
        (r.status === 'completed' || r.status === 'admin_approved')
      );
      
      if (studentCompletions.length > 0) {
        setHasCompletedWork(true);
        console.log('Student has completed work - restricting group/proposal creation');
      }
    } catch (error) {
      console.error('Error checking completion status:', error);
    }
    
    // Check for new messages
    if (user.group_id) {
      try {
        const messages = await db.entities.Message.list();
        const groupMessages = messages.filter(m => 
          m.conversation_id === user.group_id && 
          m.conversation_type === 'group_chat'
        );
        
        // If message count increased, show notification
        if (groupMessages.length > lastMessageCount && lastMessageCount > 0) {
          setHasNewMessage(true);
          console.log('🔔 New message detected!');
        }
        
        setLastMessageCount(groupMessages.length);
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    }
    
    setLoading(false);
  };

  const checkForNewMessages = async (user) => {
    if (!user.group_id) return;
    
    try {
      const messages = await db.entities.Message.list();
      const groupMessages = messages.filter(m => 
        m.conversation_id === user.group_id && 
        m.conversation_type === 'group_chat'
      );
      
      console.log('🔔 Checking messages - Current count:', groupMessages.length, 'Last count:', lastMessageCount, 'Notification showing:', hasNewMessage);
      
      // If message count increased, show notification
      if (groupMessages.length > lastMessageCount && lastMessageCount > 0) {
        console.log('🔔 New message detected! Showing persistent notification...');
        setHasNewMessage(true);
      }
      
      // Only update lastMessageCount if notification is NOT showing
      // This keeps the banner visible until user dismisses it
      if (!hasNewMessage) {
        setLastMessageCount(groupMessages.length);
      } else {
        console.log('⏸️ Keeping notification visible - not updating count');
      }
    } catch (error) {
      console.error('Error checking messages:', error);
    }
  };

  const dismissNewMessage = () => {
    console.log('✅ User clicked notification - dismissing and updating count');
    setHasNewMessage(false);
    // Update count so we're caught up to current messages
    if (currentUser?.group_id) {
      checkForNewMessages(currentUser);
    }
  };

  const handleAcceptInvite = async (invite) => {
    try {
      // Update invitation
      await db.entities.GroupInvitation.update(invite.id, { status: 'accepted' });
      
      // Get the group
      const groups = await db.entities.StudentGroup.filter({ id: invite.group_id });
      if (groups.length > 0) {
        const group = groups[0];
        
        // Update student with group_id
        await db.entities.Student.update(currentUser.id, { 
          group_id: group.id
        });
        
        // Add student to group members array if not already present
        const existingMembers = group.members || [];
        const isAlreadyMember = existingMembers.some(m => m.student_id === currentUser.student_id);
        
        if (!isAlreadyMember) {
          const updatedMembers = [
            ...existingMembers,
            {
              student_id: currentUser.student_id,
              full_name: currentUser.full_name,
              role: 'member'
            }
          ];
          
          // Check if group is now full (3 members) and activate it
          const newMemberCount = updatedMembers.length;
          const newStatus = newMemberCount >= 3 ? 'active' : group.status;
          
          await db.entities.StudentGroup.update(group.id, {
            ...group,
            members: updatedMembers,
            status: newStatus, // Activate group when it reaches 3 members
            updated_at: new Date().toISOString()
          });
          
          if (newStatus === 'active') {
            toast.success('Group is now full and activated!');
          }
        }
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
        <div className="space-y-6">
          {/* New Message Notification Banner */}
          <AnimatePresence>
            {hasNewMessage && group && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.6)',
                    '0 0 20px rgba(139, 92, 246, 0.3)'
                  ]
                }}
                transition={{ 
                  duration: 0.4,
                  boxShadow: {
                    repeat: Infinity,
                    duration: 2
                  }
                }}
              >
                <div 
                  onClick={() => {
                    dismissNewMessage();
                    navigate(createPageUrl('GroupChat'));
                  }}
                  className="relative overflow-hidden cursor-pointer group rounded-2xl"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Bouncing message icon */}
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity
                          }}
                          className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                          <MessageSquare className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <motion.h3 
                            className="text-2xl font-bold text-white mb-1"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            💬 New Message Received!
                          </motion.h3>
                          <p className="text-white/90 text-base">
                            Someone from <span className="font-semibold">{group.group_name || 'your group'}</span> sent you a message - Click to view!
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <motion.span 
                          className="text-white/90 text-sm font-medium hidden sm:block"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Click anywhere to open chat →
                        </motion.span>
                        <motion.div 
                          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <ArrowRight className="w-6 h-6 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Extra glow effect */}
                  <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] pointer-events-none"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Section */}
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
                
                {/* Show group status badge */}
                {group && (
                  <Badge className={`px-4 py-2 text-sm ${
                    group.status === 'active' ? 'bg-green-500 text-white' :
                    group.status === 'supervised' ? 'bg-purple-500 text-white' :
                    group.status === 'forming' ? 'bg-yellow-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {group.status === 'active' && <CheckCircle className="w-4 h-4 mr-2" />}
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </Badge>
                )}
                
                {group?.status === 'supervised' && (
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Supervised
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Completed Work Notice */}
          {hasCompletedWork && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="p-6 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur border border-emerald-400/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      🎉 Congratulations! Your Work is Completed
                    </h3>
                    <p className="text-emerald-200 mb-3">
                      You have successfully completed your project/thesis. Your group has been disbanded. You can view your completion status below.
                    </p>
                    <Link to="/student/thesis-completion">
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                        <Award className="w-4 h-4 mr-2" />
                        View Completion Status
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Assigned Teacher Section */}
          {group && group.assigned_teacher_id && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/30 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Assigned Supervisor</h2>
                      <p className="text-purple-200 text-lg">{group.supervisor_name || 'Loading...'}</p>
                      <p className="text-purple-300 text-sm mt-1">Teacher ID: {group.assigned_teacher_id}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/30 text-green-200 border-green-400/50 px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connected
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )}

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

          {/* Sent Invitations */}
          {sentInvites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-6 bg-blue-500/10 border border-blue-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="w-5 h-5 text-blue-400" />
                  <h2 className="font-semibold text-white">Sent Invitations ({sentInvites.length})</h2>
                </div>
                <div className="space-y-3">
                  {sentInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          invite.status === 'accepted' ? 'bg-green-400' :
                          invite.status === 'declined' ? 'bg-red-400' :
                          'bg-yellow-400'
                        }`} />
                        <div>
                          <p className="font-medium text-white">Invitation to: {invite.to_student_id}</p>
                          <p className="text-sm text-blue-200">
                            Status: 
                            <Badge className={`ml-2 ${
                              invite.status === 'accepted' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                              invite.status === 'declined' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                              'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                            }`}>
                              {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-blue-300">
                        {new Date(invite.created_at).toLocaleDateString()}
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
              {/* Show Create Group only if no group exists AND no completed work */}
              {!group && !currentUser?.group_id && !hasCompletedWork && (
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
              
              {/* Show Invite Students for group leaders with forming/inactive groups AND group not full */}
              {currentUser?.is_group_admin && currentUser?.group_id && (group?.status === 'forming' || group?.status === 'inactive') && groupMembers.length < 3 && (
                <button onClick={() => navigate('/student/invite-students')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-purple-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <UserPlus className="w-6 h-6 text-purple-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Invite Students</h3>
                        <p className="text-sm text-blue-200">Add members to group ({groupMembers.length}/3)</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {/* Show Group Full message for group leaders when group is full */}
              {currentUser?.is_group_admin && currentUser?.group_id && (group?.status === 'forming' || group?.status === 'inactive') && groupMembers.length >= 3 && (
                <Card className="p-5 bg-green-500/10 backdrop-blur border border-green-400/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-300">Group Full</h3>
                      <p className="text-sm text-green-200">All 3 members confirmed ✓</p>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Show Create Proposal for group leaders AND no completed work */}
              {currentUser?.is_group_admin && currentUser?.group_id && !hasCompletedWork && (
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
              
              {/* Show Request Teachers/Suggested Teachers when group is ACTIVE */}
              {currentUser?.is_group_admin && currentUser?.group_id && group?.status === 'active' && (
                <button onClick={() => navigate('/student/suggested-teachers')}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur border border-white/20 hover:border-amber-400/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <GraduationCap className="w-6 h-6 text-amber-300 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Suggested Teachers</h3>
                        <p className="text-sm text-blue-200">Find supervisors</p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
              
              {/* Show Group Invitations if not in a group */}
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
              
              {/* Show Group Chat if in a group */}
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
              
              {/* Always show Find Supervisors for students with active groups */}
              {(group?.status === 'active' || currentUser?.group_id) && (
                <Link to="/student/suggested-teachers">
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
              )}
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