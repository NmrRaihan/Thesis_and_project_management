import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Calendar, 
  MessageSquare, 
  File, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  UserMinus,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function AdminStudentGroupDetail() {
  const navigate = useNavigate();
  const { groupId } = useParams();
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
      
      // Get the specific group
      const allGroups = await db.entities.StudentGroup.list();
      const foundGroup = allGroups.find(g => g.group_id === groupId);
      
      if (!foundGroup) {
        toast.error('Group not found');
        navigate('/admin/groups');
        return;
      }
      
      setGroup(foundGroup);
      
      // Get all students to find group members
      const allStudents = await db.entities.Student.list();
      const groupMembers = allStudents.filter(student => 
        student.group_id === groupId
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
          
          // Update the group record
          const allGroups = await db.entities.StudentGroup.list();
          const groupToUpdate = allGroups.find(g => g.group_id === groupId);
          if (groupToUpdate) {
            await db.entities.StudentGroup.update(groupToUpdate.id, updatedGroup);
          }
          
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
        
        // Delete the group
        const allGroups = await db.entities.StudentGroup.list();
        const groupToDelete = allGroups.find(g => g.group_id === groupId);
        if (groupToDelete) {
          await db.entities.StudentGroup.delete(groupToDelete.id);
        }
        
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
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Group Details</h1>
                  <p className="text-blue-200">Manage group {group.group_name}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate('/admin/groups')}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back to Groups
                </Button>
                <Button 
                  onClick={handleDisbandGroup}
                  variant="destructive"
                  className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disband Group
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Group Overview */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-blue-200 mb-1">Group Name</h3>
                <p className="text-white font-semibold text-lg">{group.group_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-200 mb-1">Group ID</h3>
                <p className="text-white">{group.group_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-200 mb-1">Members</h3>
                <p className="text-white">
                  {group.member_count || students.length} / {group.max_members || 3}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-200 mb-1">Status</h3>
                <Badge className={
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : group.status === 'inactive'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }>
                  {group.status?.charAt(0).toUpperCase() + group.status?.slice(1)}
                </Badge>
              </div>
            </div>
            
            {group.group_description && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-blue-200 mb-2">Description</h3>
                <p className="text-white">{group.group_description}</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-blue-200 mb-1">Created</h3>
                <p className="text-white">{new Date(group.created_at).toLocaleString()}</p>
              </div>
              {group.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-blue-200 mb-1">Last Updated</h3>
                  <p className="text-white">{new Date(group.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
            
            {group.supervisor_name && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-blue-200 mb-1">Supervisor</h3>
                <p className="text-white flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                  {group.supervisor_name} ({group.supervisor_id})
                </p>
              </div>
            )}
          </Card>

          {/* Group Members */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Group Members ({students.length})
              </h2>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">No Members</h3>
                <p className="text-blue-200">This group currently has no members.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white">{student.full_name}</h4>
                            {student.is_group_admin && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                                <Shield className="w-3 h-3 mr-1" />
                                Leader
                              </Badge>
                            )}
                          </div>
                          <p className="text-blue-200 text-sm">{student.student_id} • {student.department}</p>
                          <p className="text-blue-300 text-xs">Email: {student.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }>
                          {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                        </Badge>
                        
                        <Button
                          onClick={() => handleRemoveMember(student.student_id)}
                          variant="outline"
                          size="sm"
                          className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Related Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Group Proposals */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                Group Proposals
              </h3>
              <p className="text-blue-200 text-center py-4">No proposals linked to this group yet.</p>
            </Card>

            {/* Group Messages */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
                Group Messages
              </h3>
              <p className="text-blue-200 text-center py-4">No messages available for this group.</p>
            </Card>

            {/* Group Files */}
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                <File className="w-5 h-5 mr-2 text-purple-400" />
                Group Files
              </h3>
              <p className="text-blue-200 text-center py-4">No files shared by this group.</p>
            </Card>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}