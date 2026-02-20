import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  ArrowLeft,
  Send,
  Search,
  UserPlus
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function CreateGroupRequest() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/student/login');
      return;
    }
    
    const studentData = JSON.parse(currentUser);
    setStudent(studentData);
    
    // Check if student already has a pending request or is in a group
    checkExistingRequest(studentData);
  }, [navigate]);

  const checkExistingRequest = async (studentData) => {
    try {
      // Check if student is already in a group
      if (studentData.group_id) {
        toast.info('You are already in a group');
        navigate('/student/dashboard');
        return;
      }
      
      // Check for existing group requests
      const groupRequests = await db.entities.GroupInvitation.list();
      const existing = groupRequests.find(request => 
        request.student_id === studentData.student_id && 
        (request.status === 'pending' || request.status === 'approved')
      );
      
      if (existing) {
        setExistingRequest(existing);
        if (existing.status === 'approved') {
          toast.info('You already have an approved group request');
          navigate('/student/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking existing requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      // Create group invitation request
      const newRequest = {
        student_id: student.student_id,
        student_name: student.full_name,
        group_name: groupName,
        group_description: groupDescription,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await db.entities.GroupInvitation.create(newRequest);
      toast.success('Group creation request submitted successfully!');
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
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

  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <Users className="w-16 h-16 text-amber-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Pending Group Request</h2>
              <p className="text-amber-200 mb-6">
                Your group creation request is currently under review by the admin.
              </p>
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{existingRequest.group_name}</h3>
                <p className="text-amber-200">{existingRequest.group_description || 'No description provided'}</p>
                <p className="text-sm text-amber-300 mt-4">Submitted on: {new Date(existingRequest.created_at).toLocaleDateString()}</p>
              </div>
              <Button 
                onClick={() => navigate('/student/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-2xl font-bold text-white">Create Group Request</h1>
                  <p className="text-blue-200">Request admin approval to create a new group</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Group Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="text-blue-200">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter a name for your group"
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription" className="text-blue-200">Group Description</Label>
                    <textarea
                      id="groupDescription"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Describe your group's purpose and goals"
                      className="w-full min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 rounded-xl px-4 py-3"
                    />
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-200 mb-2">Group Rules</h3>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• You cannot create another group request while this one is pending</li>
                      <li>• Once approved, you'll become the group leader</li>
                      <li>• As leader, you can invite up to 5 students</li>
                      <li>• Students can only accept 2 group invitations</li>
                      <li>• Members cannot create their own groups</li>
                    </ul>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Group Request
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Name</p>
                    <p className="text-white font-medium">{student.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Student ID</p>
                    <p className="text-white font-medium">{student.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Department</p>
                    <p className="text-white font-medium">{student.department}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Process Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Submit Request</p>
                      <p className="text-blue-200 text-sm">Create your group proposal</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Admin Review</p>
                      <p className="text-blue-200 text-sm">Wait for admin approval</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Invite Members</p>
                      <p className="text-blue-200 text-sm">Send invitations to other students</p>
                    </div>
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