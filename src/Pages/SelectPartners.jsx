import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StudentCard from '@/components/cards/StudentCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Users, 
  UserMinus,
  Info,
  Loader2,
  X,
  Clock
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function SelectPartners() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

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
      const allStudents = await db.entities.Student.filter({ status: 'active' });
      setStudents(allStudents.filter(s => s.student_id !== user.student_id && !s.group_id));
      
      // Check if user has a group
      if (user.group_id) {
        const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
        if (groups.length > 0) {
          setGroup(groups[0]);
          const members = await db.entities.Student.filter({ group_id: groups[0].id });
          setGroupMembers(members.filter(m => m.student_id !== user.student_id));
          
          // Load sent invitations
          const invites = await db.entities.GroupInvitation.filter({ 
            group_id: groups[0].id,
            status: 'pending'
          });
          setSentInvites(invites);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    
    setLoading(false);
  };

  const createGroup = async () => {
    setCreating(true);
    
    const newGroup = await db.entities.StudentGroup.create({
      group_name: `${currentUser.full_name}'s Group`,
      admin_student_id: currentUser.student_id,
      member_ids: JSON.stringify([currentUser.student_id]),
      status: 'forming'
    });
    
    // Update student with group_id and admin status
    await db.entities.Student.update(currentUser.id, { 
      group_id: newGroup.id,
      is_group_admin: 1
    });
    
    const updatedUser = { ...currentUser, group_id: newGroup.id, is_group_admin: true };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setGroup(newGroup);
    
    toast.success('Group created successfully!');
    setCreating(false);
  };

  const inviteStudent = async (student) => {
    if (!group) {
      await createGroup();
    }
    
    const currentGroup = group || (await db.entities.StudentGroup.filter({ admin_student_id: currentUser.student_id }))[0];
    
    // Check group size
    const currentMembers = groupMembers.length + 1;
    const pendingInvites = sentInvites.length;
    
    if (currentMembers + pendingInvites >= 3) {
      toast.error('Maximum group size is 3 members');
      return;
    }
    
    // Create invitation
    await db.entities.GroupInvitation.create({
      group_id: currentGroup.id,
      from_student_id: currentUser.student_id,
      to_student_id: student.student_id,
      status: 'pending'
    });
    
    setSentInvites([...sentInvites, { to_student_id: student.student_id }]);
    toast.success(`Invitation sent to ${student.full_name}`);
  };

  const removeMember = async (member) => {
    if (!currentUser.is_group_admin) {
      toast.error('Only group admin can remove members');
      return;
    }
    
    // Update student - remove group_id
    await db.entities.Student.update(member.id, { group_id: null });
    
    // Update group member_ids
    const memberIds = typeof group.member_ids === 'string' ? JSON.parse(group.member_ids) : group.member_ids;
    const updatedMembers = memberIds.filter(id => id !== member.student_id);
    await db.entities.StudentGroup.update(group.id, { member_ids: JSON.stringify(updatedMembers) });
    
    setGroupMembers(groupMembers.filter(m => m.id !== member.id));
    toast.success(`${member.full_name} has been removed from the group`);
  };

  const cancelInvite = async (invite) => {
    // Update invitation status to cancelled
    await db.entities.GroupInvitation.update(invite.id, { status: 'cancelled' });
    
    // Remove from sent invites
    setSentInvites(sentInvites.filter(i => i.id !== invite.id));
    toast.success('Invitation cancelled');
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isInvited = (studentId) => sentInvites.some(i => i.to_student_id === studentId);

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SelectPartners">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-white/20" />)}
            </div>
          </div>
        </DashboardLayout>
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
                  Your Group ({groupMembers.length + 1 + sentInvites.length}/3)
                </h2>
                {currentUser.is_group_admin && (
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">Admin</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current user */}
                <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <Avatar>
                    <AvatarImage src={currentUser?.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {currentUser?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{currentUser?.full_name}</p>
                    <p className="text-sm text-blue-200">You</p>
                  </div>
                </div>
                
                {/* Group members */}
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {member.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{member.full_name}</p>
                        <p className="text-sm text-blue-200">{member.student_id}</p>
                      </div>
                    </div>
                    {currentUser.is_group_admin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {/* Pending invitations */}
                {sentInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between gap-3 p-4 bg-amber-500/20 rounded-xl border border-amber-400/30">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                          <Clock className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">Pending Invite</p>
                        <p className="text-sm text-amber-200">{invite.to_student_id}</p>
                      </div>
                    </div>
                    {currentUser.is_group_admin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelInvite(invite)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        {!group && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-blue-500/20 border-blue-400/30 backdrop-blur-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white">How it works</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Search for students and send them an invitation. Once they accept, they'll be added to your group.
                    You can have up to 2 partners (3 members total).
                  </p>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student, idx) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onInvite={inviteStudent}
                  isInvited={isInvited(student.student_id)}
                  delay={idx * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}