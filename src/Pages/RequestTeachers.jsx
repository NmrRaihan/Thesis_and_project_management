import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Search, 
  Send, 
  ArrowLeft,
  User,
  BookOpen,
  Users
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function RequestTeachers() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/student/login');
      return;
    }
    
    const studentData = JSON.parse(currentUser);
    setStudent(studentData);
    
    // Check if student is a group leader with a proposal
    if (!studentData.is_group_admin || !studentData.group_id) {
      toast.error('You must be a group leader to request teachers');
      navigate('/student/dashboard');
      return;
    }
    
    loadData(studentData);
  }, [navigate]);

  const loadData = async (studentData) => {
    try {
      // Load proposal
      const proposals = await db.entities.Proposal.list();
      const groupProposal = proposals.find(p => p.group_id === studentData.group_id);
      
      if (!groupProposal) {
        toast.error('Please create a proposal first');
        navigate('/student/create-group-proposal');
        return;
      }
      
      setProposal(groupProposal);
      
      // Load all teachers
      const teachers = await db.entities.Teacher.list();
      setAllTeachers(teachers);
      
      // Load sent requests
      const requests = await db.entities.SupervisionRequest.list();
      const groupRequests = requests.filter(req => 
        req.group_id === studentData.group_id && req.status === 'pending'
      );
      setSentRequests(groupRequests);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const getFilteredTeachers = () => {
    if (!searchTerm) return [];
    
    return allTeachers
      .filter(teacher => 
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.research_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(teacher => 
        // Exclude teachers who already have pending requests from this group
        !sentRequests.some(req => req.teacher_id === teacher.teacher_id)
      )
      .slice(0, 10);
  };

  const handleRequest = async (teacher) => {
    // Check if already requested this teacher
    if (sentRequests.some(req => req.teacher_id === teacher.teacher_id)) {
      toast.error('Already requested this teacher');
      return;
    }

    // Check request limit (max 3 requests)
    if (sentRequests.length >= 3) {
      toast.error('You have reached the maximum of 3 requests');
      return;
    }

    setLoading(true);
    try {
      const request = {
        group_id: student.group_id,
        group_name: student.group_name,
        proposal_id: proposal.id,
        proposal_title: proposal.title,
        teacher_id: teacher.teacher_id,
        teacher_name: teacher.full_name,
        student_id: student.student_id,
        student_name: student.full_name,
        research_field: proposal.field,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await db.entities.SupervisionRequest.create(request);
      toast.success(`Request sent to ${teacher.full_name}`);
      
      // Refresh requests
      const requests = await db.entities.SupervisionRequest.list();
      const groupRequests = requests.filter(req => 
        req.group_id === student.group_id && req.status === 'pending'
      );
      setSentRequests(groupRequests);
      
      setSearchTerm(''); // Clear search
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await db.entities.SupervisionRequest.update(requestId, { status: 'cancelled' });
        toast.success('Request cancelled');
        
        // Refresh requests
        const requests = await db.entities.SupervisionRequest.list();
        const groupRequests = requests.filter(req => 
          req.group_id === student.group_id && req.status === 'pending'
        );
        setSentRequests(groupRequests);
      } catch (error) {
        console.error('Error cancelling request:', error);
        toast.error('Failed to cancel request');
      }
    }
  };

  if (!student || !proposal) {
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

  const filteredTeachers = getFilteredTeachers();

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
                  <h1 className="text-2xl font-bold text-white">Request Supervisors</h1>
                  <p className="text-blue-200">Find and request teachers for your proposal</p>
                </div>
              </div>
              <div className="text-sm text-blue-200">
                Requests: {sentRequests.length}/3
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Proposal Info */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Your Proposal</h2>
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white text-lg mb-2">{proposal.title}</h3>
                  <p className="text-blue-200 text-sm mb-2">Field: {proposal.field}</p>
                  <p className="text-blue-200 text-sm">Type: {proposal.project_type}</p>
                </div>
              </Card>

              {/* Search Bar */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Find Teachers</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, department, or research field..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  />
                </div>
                
                {searchTerm && (
                  <div className="space-y-3">
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <div 
                          key={teacher.teacher_id} 
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{teacher.full_name}</h3>
                              <p className="text-sm text-blue-200">
                                {teacher.department} • {teacher.research_field}
                              </p>
                              <p className="text-xs text-blue-300">
                                Students: {teacher.current_students_count || 0}/{teacher.max_students}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRequest(teacher)}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Request
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-200 text-center py-4">No teachers found</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Sent Requests */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Sent Requests ({sentRequests.length}/3)</h2>
                {sentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{request.teacher_name}</h3>
                            <p className="text-sm text-blue-200">Requested on: {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCancelRequest(request.id)}
                          variant="outline"
                          className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-200 text-center py-8">No requests sent yet</p>
                )}
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Request Guidelines</h3>
                <ul className="text-sm text-blue-200 space-y-2">
                  <li>• Maximum 3 requests per group</li>
                  <li>• Teachers can accept or reject requests</li>
                  <li>• Accepted requests go to admin for final approval</li>
                  <li>• You can cancel pending requests</li>
                  <li>• Search by field for better matches</li>
                </ul>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Teacher Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total Teachers</span>
                    <span className="text-white font-medium">{allTeachers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Requests Sent</span>
                    <span className="text-white font-medium">{sentRequests.length}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Proposal Field</span>
                    <span className="text-white font-medium">{proposal.field}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Process Overview</h3>
                <div className="space-y-3 text-sm text-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Send requests to teachers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Teacher reviews and accepts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Admin final approval</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Supervision begins</span>
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