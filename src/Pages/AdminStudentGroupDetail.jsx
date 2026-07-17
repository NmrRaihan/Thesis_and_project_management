import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Users, 
  GraduationCap, 
  Trash2,
  UserMinus,
  Shield,
  Clock,
  ArrowLeft,
  Mail,
  Building,
  IdCard
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminStudentGroupDetail() {
  const navigate = useNavigate();
  const { groupId } = useParams();  // Must match route param :groupId
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    if (!groupId) {
      toast.error('Group ID is required');
      navigate('/admin/groups');
      return;
    }

    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      
      // Get the specific group by database ID
      const foundGroup = await db.entities.StudentGroup.findById(groupId);
      
      if (!foundGroup) {
        toast.error('Group not found');
        navigate('/admin/groups');
        return;
      }
      
      setGroup(foundGroup);
      
      // Get all students to find group members by database ID
      // (students store the database id in their group_id field)
      const allStudents = await db.entities.Student.list();
      const groupMembers = allStudents.filter(student => 
        student.group_id === foundGroup.id
      );
      setStudents(groupMembers);
      
    } catch (error) {
      console.error('Error loading group details:', error);
      toast.error('Failed to load group details');
      navigate('/admin/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the group?')) {
      try {
        // Find the student record
        const allStudents = await db.entities.Student.list();
        const student = allStudents.find(s => s.student_id === studentId);
        
        if (student) {
          // Update student to remove from group
          await db.entities.Student.update(student.id, {
            ...student,
            group_id: null,
            group_name: null,
            is_group_admin: false, // Reset group admin status if they were the leader
            updated_at: new Date().toISOString()
          });
          
          // Update group member count
          const updatedGroup = {
            ...group,
            members: group.members?.filter(member => member.student_id !== studentId),
            member_count: (group.member_count || students.length) - 1
          };
          
          // Update the group record using database id
          await db.entities.StudentGroup.update(groupId, updatedGroup);
          
          toast.success('Student removed from group successfully');
          loadGroupDetails(); // Refresh the data
        }
      } catch (error) {
        console.error('Error removing member:', error);
        toast.error('Failed to remove student from group');
      }
    }
  };

  const handleDisbandGroup = async () => {
    if (window.confirm('Are you sure you want to disband this entire group? All members will be removed.')) {
      try {
        // Remove all students from the group
        for (const student of students) {
          await db.entities.Student.update(student.id, {
            ...student,
            group_id: null,
            group_name: null,
            is_group_admin: false,
            updated_at: new Date().toISOString()
          });
        }
        
        // Delete the group using database id
        await db.entities.StudentGroup.delete(groupId);
        
        toast.success('Group disbanded successfully');
        navigate('/admin/groups');
      } catch (error) {
        console.error('Error disbanding group:', error);
        toast.error('Failed to disband group');
      }
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </PageBackground>
    );
  }

  if (!group) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <Users className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Group Not Found</h3>
            <p className="text-orange-200 mb-4">The requested group does not exist or has been deleted.</p>
            <Button 
              onClick={() => navigate('/admin/groups')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Back to Groups
            </Button>
          </Card>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/groups">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  Group Details
                </h1>
                <p className="text-blue-200 mt-1">{group.group_name || 'Unnamed Group'}</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/groups')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Groups
              </Button>
            </div>
            
            {/* Group Status & Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Members</p>
                    <p className="text-2xl font-bold text-white">{students.length}/3</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    group.status === 'active' ? 'bg-green-500/20' :
                    group.status === 'supervised' ? 'bg-blue-500/20' :
                    'bg-red-500/20'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      group.status === 'active' ? 'text-green-400' :
                      group.status === 'supervised' ? 'text-blue-400' :
                      'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Status</p>
                    <Badge className={`mt-1 ${
                      group.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                      group.status === 'supervised' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                      'bg-red-500/20 text-red-300 border-red-400/30'
                    }`}>
                      {group.status?.charAt(0).toUpperCase() + group.status?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Supervisor</p>
                    <p className="text-sm font-semibold text-white">
                      {group.supervisor_name || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Created</p>
                    <p className="text-sm font-semibold text-white">
                      {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Group Members Section */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Group Members ({students.length})
              </h2>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-200">No members in this group</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{student.full_name}</h3>
                        <p className="text-xs text-blue-300 flex items-center gap-1">
                          <IdCard className="w-3 h-3" />
                          {student.student_id}
                        </p>
                        {student.is_group_admin && (
                          <Badge className="mt-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs">
                            Group Leader
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-blue-200">
                        <Mail className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-xs">{student.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-200">
                        <Building className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-xs">{student.department || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(student.student_id)}
                        className="w-full bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from Group
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Group Actions */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Group Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleDisbandGroup}
                variant="outline"
                className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}