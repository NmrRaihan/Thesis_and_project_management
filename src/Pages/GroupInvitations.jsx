import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Users, 
  Mail, 
  Check,
  X,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function GroupInvitations() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/student/login');
      return;
    }
    
    const studentData = JSON.parse(currentUser);
    setStudent(studentData);
    
    // Check if student is already in a group
    if (studentData.group_id) {
      toast.info('You are already in a group');
      navigate('/student/dashboard');
      return;
    }
    
    loadInvitations(studentData);
  }, [navigate]);

  const loadInvitations = async (studentData) => {
    try {
      const allInvitations = await db.entities.GroupInvitation.list();
      const studentInvitations = allInvitations.filter(inv => 
        inv.to_student_id === studentData.student_id && 
        inv.status === 'pending'
      );
      
      setInvitations(studentInvitations);
      
      // Count accepted invitations (should be max 1)
      const accepted = allInvitations.filter(inv => 
        inv.to_student_id === studentData.student_id && 
        inv.status === 'accepted'
      );
      setAcceptedCount(accepted.length);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    }
  };

  const handleAccept = async (invitation) => {
    // Check if already accepted an invitation
    if (acceptedCount >= 1) {
      toast.error('You have already accepted a group invitation');
      return;
    }

    // Check if already in a group
    if (student.group_id) {
      toast.error('You are already in a group');
      return;
    }

    setLoading(true);
    try {
      // Update invitation status
      await db.entities.GroupInvitation.update(invitation.id, { 
        status: 'accepted',
        responded_at: new Date().toISOString()
      });

      // Update student record to join the group
      const updatedStudent = {
        ...student,
        group_id: invitation.group_id,
        group_name: invitation.group_name,
        is_group_admin: false, // Only the creator is admin
        updated_at: new Date().toISOString()
      };

      await db.entities.Student.update(student.student_id, updatedStudent);
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedStudent));
      
      toast.success(`You have joined ${invitation.group_name}!`);
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (invitationId) => {
    if (window.confirm('Are you sure you want to decline this invitation?')) {
      try {
        await db.entities.GroupInvitation.update(invitationId, { 
          status: 'declined',
          responded_at: new Date().toISOString()
        });
        
        toast.success('Invitation declined');
        loadInvitations(student);
      } catch (error) {
        console.error('Error declining invitation:', error);
        toast.error('Failed to decline invitation');
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

  return (
    <PageBackground>
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate('/student/dashboard')} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Group Invitations</h1>
                  <p className="text-blue-200">Manage your group invitations</p>
                </div>
              </div>
              <div className="text-sm text-blue-200">
                Accepted: {acceptedCount}/1
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {invitations.length > 0 ? (
            <div className="space-y-6">
              {invitations.map((invitation) => (
                <Card 
                  key={invitation.id} 
                  className="p-6 bg-white/10 backdrop-blur-xl border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{invitation.group_name}</h3>
                          <p className="text-blue-200">Invited by {invitation.from_student_name}</p>
                        </div>
                      </div>
                      
                      <div className="ml-15 space-y-2">
                        <div className="flex items-center text-blue-200">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>From: {invitation.from_student_id}</span>
                        </div>
                        <div className="text-sm text-blue-200">
                          <p>Sent on: {new Date(invitation.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3 ml-6">
                      <Button
                        onClick={() => handleAccept(invitation)}
                        disabled={loading || acceptedCount >= 1 || student.group_id}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDecline(invitation.id)}
                        disabled={loading}
                        variant="outline"
                        className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                  
                  {acceptedCount >= 1 && (
                    <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                      <p className="text-amber-200 text-sm">
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        You have already accepted a group invitation and cannot join another group
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">No Invitations</h3>
              <p className="text-blue-200 mb-6">
                You don't have any pending group invitations at the moment.
              </p>
              <Button 
                onClick={() => navigate('/student/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Card>
          )}
          
          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Invitation Rules</h3>
              <ul className="text-sm text-blue-200 space-y-2">
                <li>• You can accept only ONE group invitation</li>
                <li>• Once accepted, you cannot join other groups</li>
                <li>• Declined invitations cannot be accepted later</li>
                <li>• Group leaders can cancel pending invitations</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200">Pending Invitations</span>
                  <span className="text-white font-medium">{invitations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Accepted Invitations</span>
                  <span className="text-white font-medium">{acceptedCount}/1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Group Status</span>
                  <span className="text-white font-medium">
                    {student.group_id ? 'In Group' : 'No Group'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}