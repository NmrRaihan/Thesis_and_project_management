import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  UserPlus, 
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function InviteStudents() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/student/login');
      return;
    }
    
    const studentData = JSON.parse(currentUser);
    setStudent(studentData);
    
    // Check if student is a group leader
    if (!studentData.is_group_admin || !studentData.group_id) {
      toast.error('You must be a group leader to invite students');
      navigate('/student/dashboard');
      return;
    }
    
    loadStudents();
    loadSentInvitations();
  }, [navigate]);

  const loadStudents = async () => {
    try {
      // Use the new method to get available students for invitation
      const availableStudents = await db.entities.Student.getAvailableForInvitation();
      setAllStudents(availableStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
      
      // Fallback: try to get all students and filter client-side
      try {
        const students = await db.entities.Student.list();
        const availableStudents = students.filter(s => 
          s.student_id !== student?.student_id && 
          !s.group_id && 
          s.status === 'active'
        );
        setAllStudents(availableStudents);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setAllStudents([]);
      }
    }
  };

  const loadSentInvitations = async () => {
    try {
      const invitations = await db.entities.GroupInvitation.list();
      const sent = invitations.filter(inv => 
        inv.from_student_id === student.student_id && 
        (inv.status === 'pending' || inv.status === 'accepted')
      );
      setSentInvitations(sent);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getFilteredStudents = () => {
    if (!searchTerm) return allStudents.slice(0, 10); // Show all available students when no search term
    
    return allStudents.filter(student => 
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
  };

  const handleInvite = async (targetStudent) => {
    // Check if already invited
    if (sentInvitations.some(inv => inv.to_student_id === targetStudent.student_id)) {
      toast.error('Already invited this student');
      return;
    }

    // Check invitation limit (max 2 members total = 3 people including leader)
    const acceptedInvitations = sentInvitations.filter(inv => inv.status === 'accepted');
    if (acceptedInvitations.length >= 2) {
      toast.error('Group is full (maximum 3 members including you)');
      return;
    }

    // Also check total invitations (pending + accepted shouldn't exceed 2)
    if (sentInvitations.length >= 2) {
      toast.error('You have reached the maximum of 2 invitations');
      return;
    }

    setLoading(true);
    try {
      const invitation = {
        from_student_id: student.student_id,
        from_student_name: student.full_name,
        to_student_id: targetStudent.student_id,
        to_student_name: targetStudent.full_name,
        group_id: student.group_id,
        group_name: student.group_name,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await db.entities.GroupInvitation.create(invitation);
      toast.success(`Invitation sent to ${targetStudent.full_name}`);
      loadSentInvitations();
      setSearchTerm(''); // Clear search
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await db.entities.GroupInvitation.update(invitationId, { status: 'cancelled' });
        toast.success('Invitation cancelled');
        loadSentInvitations();
      } catch (error) {
        console.error('Error cancelling invitation:', error);
        toast.error('Failed to cancel invitation');
      }
    }
  };

  if (!student) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-200">Loading...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <PageBackground>
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate(createPageUrl('StudentDashboard'))} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Invite Students</h1>
                  <p className="text-blue-200">Invite students to join your group</p>
                </div>
              </div>
              <div className="text-sm text-blue-200">
                Invitations: {sentInvitations.length}/2 (Members: {sentInvitations.filter(inv => inv.status === 'accepted').length}/2)
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search and Invite Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Find Students</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by student ID or name..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  />
                </div>
                
                {searchTerm && (
                  <div className="mt-4 space-y-2">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div 
                          key={student.student_id} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div>
                            <p className="font-medium text-white">{student.full_name}</p>
                            <p className="text-sm text-blue-200">ID: {student.student_id} • {student.department}</p>
                          </div>
                          <Button
                            onClick={() => handleInvite(student)}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-200 text-center py-4">No students found</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Sent Invitations */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Sent Invitations ({sentInvitations.length}/5)</h2>
                {sentInvitations.length > 0 ? (
                  <div className="space-y-3">
                    {sentInvitations.map((invitation) => (
                      <div 
                        key={invitation.id} 
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <p className="font-medium text-white">{invitation.to_student_name}</p>
                          <p className="text-sm text-blue-200">ID: {invitation.to_student_id}</p>
                          <p className="text-xs text-blue-300">
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          variant="outline"
                          className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-200 text-center py-8">No invitations sent yet</p>
                )}
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Group Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Group Name</p>
                    <p className="text-white font-medium">{student.group_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Your Role</p>
                    <p className="text-white font-medium">Group Leader</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Members</p>
                    <p className="text-white font-medium">1/3 (You)</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Invitation Rules</h3>
                <ul className="text-sm text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Maximum 2 invitations can be sent (group max 3 members)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Each student can only accept ONE invitation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cannot invite students already in groups</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Invitations can be cancelled anytime</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Available Students</span>
                    <span className="text-white font-medium">{allStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Invitations Sent</span>
                    <span className="text-white font-medium">{sentInvitations.length}/2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Accepted Members</span>
                    <span className="text-white font-medium">{sentInvitations.filter(inv => inv.status === 'accepted').length}/2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Group Capacity</span>
                    <span className="text-white font-medium">3 members (1 leader + 2)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}