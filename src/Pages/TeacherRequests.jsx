import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  FileText, 
  Check,
  X,
  Users,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function TeacherRequests() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/teacher/login');
      return;
    }
    
    const teacherData = JSON.parse(currentUser);
    setTeacher(teacherData);
    loadRequests(teacherData);
  }, [navigate]);

  const loadRequests = async (teacherData) => {
    try {
      const allRequests = await db.entities.SupervisionRequest.list();
      const teacherRequests = allRequests.filter(req => 
        req.teacher_id === teacherData.teacher_id && 
        req.status === 'pending'
      );
      setRequests(teacherRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const handleAccept = async (request) => {
    // Check if teacher has capacity
    if (teacher.current_students_count >= teacher.max_students) {
      toast.error('You have reached your maximum student capacity');
      return;
    }

    setLoading(true);
    try {
      // Update request status to accepted (pending admin approval)
      await db.entities.SupervisionRequest.update(request.id, {
        status: 'accepted',
        responded_at: new Date().toISOString()
      });

      toast.success(`Request accepted! Awaiting admin approval.`);
      loadRequests(teacher);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await db.entities.SupervisionRequest.update(requestId, {
          status: 'rejected',
          responded_at: new Date().toISOString()
        });
        
        toast.success('Request rejected');
        loadRequests(teacher);
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request');
      }
    }
  };

  if (!teacher) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-purple-200">Loading...</p>
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
                  onClick={() => navigate('/teacher/dashboard')} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Supervision Requests</h1>
                  <p className="text-purple-200">Review requests from student groups</p>
                </div>
              </div>
              <div className="text-sm text-purple-200">
                Pending: {requests.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => (
                <Card 
                  key={request.id} 
                  className="p-6 bg-white/10 backdrop-blur-xl border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{request.group_name}</h3>
                          <p className="text-purple-200">Requested by {request.student_name}</p>
                        </div>
                      </div>
                      
                      <div className="ml-15 space-y-3">
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="font-medium text-white mb-2">{request.proposal_title}</h4>
                          <p className="text-sm text-purple-200">Field: {request.research_field}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-purple-200">Group ID</p>
                            <p className="text-white font-medium">{request.group_id}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">Requested</p>
                            <p className="text-white font-medium">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3 ml-6">
                      <Button
                        onClick={() => handleAccept(request)}
                        disabled={loading || teacher.current_students_count >= teacher.max_students}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        disabled={loading}
                        variant="outline"
                        className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  
                  {teacher.current_students_count >= teacher.max_students && (
                    <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                      <p className="text-amber-200 text-sm">
                        <Users className="w-4 h-4 inline mr-1" />
                        You have reached your maximum capacity ({teacher.max_students} students)
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <GraduationCap className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
              <p className="text-purple-200 mb-6">
                You don't have any pending supervision requests at the moment.
              </p>
              <Button 
                onClick={() => navigate('/teacher/dashboard')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Card>
          )}
          
          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Capacity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Current Students</span>
                  <span className="text-white font-medium">
                    {teacher.current_students_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Maximum Capacity</span>
                  <span className="text-white font-medium">{teacher.max_students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Available Slots</span>
                  <span className="text-white font-medium">
                    {teacher.max_students - (teacher.current_students_count || 0)}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Request Process</h3>
              <ul className="text-sm text-purple-200 space-y-2">
                <li>• Review group proposal details</li>
                <li>• Check research field alignment</li>
                <li>• Verify capacity availability</li>
                <li>• Accept or reject requests</li>
                <li>• Accepted requests await admin approval</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
              <div className="space-y-3 text-sm text-purple-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Accept suitable requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span>Admin reviews your acceptance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Supervision officially begins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Access group chat and files</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}