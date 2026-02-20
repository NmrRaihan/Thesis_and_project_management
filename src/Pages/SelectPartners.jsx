// Updated SelectPartners component with explicit leader functionality
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';
import { Search, Users, Plus, CheckCircle, X, Crown, User } from 'lucide-react';

export default function SelectPartnersUpdated() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [accepting, setAccepting] = useState(false);

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
      // Load all students except current user
      const allStudents = await db.entities.Student.list();
      const filteredStudents = allStudents.filter(s => s.student_id !== user.student_id);
      setStudents(filteredStudents);

      // Load group if exists
      if (user.group_id) {
        const groups = await db.entities.StudentGroup.filter({ group_id: user.group_id });
        if (groups.length > 0) {
          setGroup(groups[0]);
          
          // Load group members
          const members = await db.entities.Student.filter({ group_id: groups[0].group_id });
          setGroupMembers(members);
        }
      }

      // Load invitations
      const sent = await db.entities.GroupInvitation.filter({ from_student_id: user.student_id });
      const received = await db.entities.GroupInvitation.filter({ to_student_id: user.student_id });
      setSentInvites(sent);
      setReceivedInvites(received);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const createGroup = async () => {
    if (!currentUser) return;
    
    setCreating(true);
    
    try {
      // Generate unique group ID
      const groupId = `GRP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      // Create group with explicit leader
      const newGroup = await db.entities.StudentGroup.create({
        group_id: groupId,
        group_name: `${currentUser.full_name}'s Group`,
        leader_student_id: currentUser.student_id,
        members: [{
          student_id: currentUser.student_id,
          role: 'leader'
        }],
        status: 'forming'
      });
      
      // Update student with group_id and leader status
      await db.entities.Student.update(currentUser.id, { 
        group_id: newGroup.id,
        is_group_admin: true
      });
      
      const updatedUser = { ...currentUser, group_id: newGroup.id, is_group_admin: true };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setGroup(newGroup);
      
      toast.success('Group created successfully! You are now the group leader.');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
    
    setCreating(false);
  };

  const inviteStudent = async (student) => {
    if (!group) {
      await createGroup();
    }
    
    try {
      const currentGroup = group || (await db.entities.StudentGroup.filter({ leader_student_id: currentUser.student_id }))[0];
      
      // Check group size (max 3 members including leader)
      const currentMembers = await db.entities.Student.filter({ group_id: currentGroup.id });
      if (currentMembers.length >= 3) {
        toast.error('Group is full (maximum 3 members)');
        return;
      }
      
      // Check if already invited
      const existingInvite = await db.entities.GroupInvitation.filter({
        group_id: currentGroup.id,
        to_student_id: student.student_id
      });
      
      if (existingInvite.length > 0) {
        toast.error('Already invited this student');
        return;
      }
      
      // Create invitation
      await db.entities.GroupInvitation.create({
        group_id: currentGroup.id,
        from_student_id: currentUser.student_id,
        to_student_id: student.student_id,
        status: 'pending'
      });
      
      loadData(currentUser);
      toast.success(`Invitation sent to ${student.full_name}`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleAcceptInvite = async (invite) => {
    setAccepting(true);
    try {
      // Update invitation status
      await db.entities.GroupInvitation.update(invite.id, { status: 'accepted' });
      
      // Add student to group
      const groups = await db.entities.StudentGroup.filter({ group_id: invite.group_id });
      if (groups.length > 0) {
        const group = groups[0];
        await db.entities.Student.update(currentUser.id, { 
          group_id: group.id,
          is_group_admin: false // Member, not leader
        });
        
        const updatedUser = { ...currentUser, group_id: group.id, is_group_admin: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setGroup(group);
      }
      
      loadData(currentUser);
      toast.success('Joined group successfully!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to join group');
    }
    setAccepting(false);
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await db.entities.GroupInvitation.update(invite.id, { status: 'rejected' });
      loadData(currentUser);
      toast.success('Invitation declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="SelectPartners">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Select Partners</h1>
            <p className="text-blue-200 mt-1">Form your thesis/project group (max 3 members)</p>
          </div>

          {/* Current Group Members */}
          {(group || groupMembers.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Your Group ({groupMembers.length + 1}/3)
                  </h2>
                  {currentUser?.is_group_admin && (
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Leader
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Leader */}
                  <div className="bg-white/10 rounded-xl p-4 border border-blue-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{currentUser?.full_name}</p>
                        <p className="text-xs text-blue-300">Leader</p>
                      </div>
                      <Crown className="w-4 h-4 text-yellow-400 ml-auto" />
                    </div>
                    <p className="text-sm text-blue-200">ID: {currentUser?.student_id}</p>
                  </div>

                  {/* Other Members */}
                  {groupMembers
                    .filter(member => member.student_id !== currentUser?.student_id)
                    .map((member) => (
                      <div key={member.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{member.full_name}</p>
                            <p className="text-xs text-purple-300">Member</p>
                          </div>
                        </div>
                        <p className="text-sm text-blue-200">ID: {member.student_id}</p>
                      </div>
                    ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Pending Invitations */}
          {receivedInvites.filter(inv => inv.status === 'pending').length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-400" />
                  Group Invitations
                </h2>
                <div className="space-y-3">
                  {receivedInvites
                    .filter(inv => inv.status === 'pending')
                    .map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl">
                        <div>
                          <p className="font-medium text-white">Group Invitation</p>
                          <p className="text-sm text-blue-200">From: {invite.from_student_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptInvite(invite)}
                            disabled={accepting}
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

          {/* Create Group Button */}
          {!group && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Start a New Group</h3>
                <p className="text-blue-200 mb-6">
                  Create a group and invite up to 2 partners to work on your thesis or project together.
                </p>
                <Button
                  onClick={createGroup}
                  disabled={creating}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Search & Student List */}
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <Input
                placeholder="Search by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
                <p className="text-blue-200">Try adjusting your search criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{student.full_name}</h4>
                        <p className="text-sm text-blue-200">ID: {student.student_id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-blue-200">
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span>{student.department}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => inviteStudent(student)}
                      disabled={!currentUser?.is_group_admin || groupMembers.length >= 2}
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite to Group
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}