// Enhanced StudentRequests component with leader indicators
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Send, Clock, Check, X, Crown, Users } from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentRequestsEnhanced() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [teachers, setTeachers] = useState({});

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
    
    if (!user.group_id) {
      setLoading(false);
      return;
    }
    
    try {
      // Load group
      const groups = await db.entities.StudentGroup.filter({ group_id: user.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
      }
      
      // Load requests for this group
      const reqs = await db.entities.SupervisionRequest.filter({ group_id: groups[0]?.id });
      setRequests(reqs);
      
      // Load proposals
      const props = await db.entities.Proposal.filter({ group_id: groups[0]?.id });
      const propsMap = {};
      props.forEach(p => propsMap[p.id] = p);
      setProposals(propsMap);
      
      // Load teachers for requests
      const teacherIds = [...new Set(reqs.map(r => r.teacher_id))];
      const teacherPromises = teacherIds.map(id => 
        db.entities.Teacher.filter({ teacher_id: id })
      );
      const teacherResults = await Promise.all(teacherPromises);
      const teachersMap = {};
      teacherResults.flat().forEach(t => teachersMap[t.teacher_id] = t);
      setTeachers(teachersMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300';
      case 'approved':
        return 'bg-green-500/20 border-green-400/30 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 border-red-400/30 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="MyRequests">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check if user has a group
  if (!group) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="MyRequests">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Group Found</h2>
              <p className="text-blue-200 mb-6">
                You need to be part of a group to send supervision requests.
              </p>
              <Button 
                onClick={() => navigate(createPageUrl('SelectPartners'))}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create or Join a Group
              </Button>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  const isGroupLeader = group.leader_student_id === currentUser.student_id;
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="MyRequests">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Supervision Requests</h1>
            <p className="text-blue-200 mt-2">
              Track your supervision requests and responses
            </p>
            
            {/* Role Indicator */}
            <div className="mt-4">
              {isGroupLeader ? (
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full inline-flex">
                  <Crown className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">Group Leader</span>
                  <span className="text-green-400 text-sm">(Managing supervision requests)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-full inline-flex">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">Group Member</span>
                  <span className="text-blue-400 text-sm">(Requests managed by leader)</span>
                </div>
              )}
            </div>
          </div>

          {/* Group Info */}
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{group.group_name}</h2>
                <p className="text-blue-200 mt-1">
                  {Object.keys(proposals).length > 0 ? 'Proposal Ready' : 'No proposal created yet'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-300">Total Requests: {requests.length}</p>
                <p className="text-sm text-yellow-300">Pending: {pendingRequests.length}</p>
                <p className="text-sm text-green-300">Approved: {approvedRequests.length}</p>
              </div>
            </div>
          </Card>

          {/* Requests Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur border-white/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/30">
                All Requests
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/30">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-500/30">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/30">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {requests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Send className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No requests yet</h3>
                  <p className="text-blue-200 mb-4">
                    {isGroupLeader 
                      ? "Send your first supervision request to get started!"
                      : "Your group leader hasn't sent any requests yet."
                    }
                  </p>
                  {isGroupLeader && (
                    <Button 
                      onClick={() => navigate(createPageUrl('SuggestedTeachers'))}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Find Teachers
                    </Button>
                  )}
                </Card>
              ) : (
                requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`px-3 py-1 rounded-full border ${getStatusColor(request.status)} flex items-center gap-2`}>
                            {getStatusIcon(request.status)}
                            <span className="capitalize font-medium">{request.status}</span>
                          </div>
                          <span className="text-sm text-blue-300">
                            {new Date(request.requested_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Request to {teachers[request.teacher_id]?.full_name || 'Unknown Teacher'}
                        </h3>
                        
                        <p className="text-blue-200 mb-3">
                          {request.request_message || 'No message provided'}
                        </p>
                        
                        {request.response_message && (
                          <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-gray-300">
                              <span className="font-medium">Response:</span> {request.response_message}
                            </p>
                            {request.response_date && (
                              <p className="text-xs text-gray-400 mt-1">
                                Responded on {new Date(request.response_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-blue-300">
                          {teachers[request.teacher_id]?.department || 'Unknown Department'}
                        </p>
                        <p className="text-xs text-blue-400">
                          {teachers[request.teacher_id]?.specialization || 'No specialization'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingRequests.length === 0 ? (
                <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
                  <p className="text-blue-200">
                    {isGroupLeader 
                      ? "All your requests have been responded to!"
                      : "No pending requests from your group leader."
                    }
                  </p>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} teacher={teachers[request.teacher_id]} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedRequests.length === 0 ? (
                <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No approved requests</h3>
                  <p className="text-blue-200">
                    {isGroupLeader 
                      ? "Send requests to get approved supervision!"
                      : "Your group doesn't have any approved supervision yet."
                    }
                  </p>
                </Card>
              ) : (
                approvedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} teacher={teachers[request.teacher_id]} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedRequests.length === 0 ? (
                <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No rejected requests</h3>
                  <p className="text-blue-200">Great! None of your requests have been rejected.</p>
                </Card>
              ) : (
                rejectedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} teacher={teachers[request.teacher_id]} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}

// Reusable Request Card Component
function RequestCard({ request, teacher }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved': return <Check className="w-5 h-5 text-green-400" />;
      case 'rejected': return <X className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300';
      case 'approved': return 'bg-green-500/20 border-green-400/30 text-green-300';
      case 'rejected': return 'bg-red-500/20 border-red-400/30 text-red-300';
      default: return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`px-3 py-1 rounded-full border ${getStatusColor(request.status)} flex items-center gap-2 mb-3 inline-flex`}>
            {getStatusIcon(request.status)}
            <span className="capitalize font-medium">{request.status}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            Request to {teacher?.full_name || 'Unknown Teacher'}
          </h3>
          
          <p className="text-blue-200 mb-3">
            {request.request_message || 'No message provided'}
          </p>
          
          {request.response_message && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Response:</span> {request.response_message}
              </p>
              {request.response_date && (
                <p className="text-xs text-gray-400 mt-1">
                  Responded on {new Date(request.response_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-sm text-blue-300">
            {teacher?.department || 'Unknown Department'}
          </p>
          <p className="text-xs text-blue-400">
            {teacher?.specialization || 'No specialization'}
          </p>
          <p className="text-xs text-blue-300 mt-2">
            Sent: {new Date(request.requested_date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}