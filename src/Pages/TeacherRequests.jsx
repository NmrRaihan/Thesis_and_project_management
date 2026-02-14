// Enhanced TeacherRequests component with leader validation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Send, 
  Clock, 
  Check, 
  X, 
  Users, 
  FileText,
  Eye,
  Loader2,
  Crown,
  AlertTriangle
} from 'lucide-react';

export default function TeacherRequestsEnhanced() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [groups, setGroups] = useState({});
  const [students, setStudents] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate(createPageUrl('TeacherLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    try {
      // Load all pending requests for this teacher
      const pendingRequests = await db.entities.SupervisionRequest.filter({ 
        teacher_id: user.teacher_id,
        status: 'pending'
      });
      
      // Load approved requests
      const approvedRequests = await db.entities.SupervisionRequest.filter({ 
        teacher_id: user.teacher_id,
        status: 'approved'
      });
      
      // Load rejected requests
      const rejectedRequests = await db.entities.SupervisionRequest.filter({ 
        teacher_id: user.teacher_id,
        status: 'rejected'
      });
      
      // Combine all requests
      const allRequests = [...pendingRequests, ...approvedRequests, ...rejectedRequests];
      setRequests(allRequests);
      
      // Load associated data
      const groupIds = [...new Set(allRequests.map(r => r.group_id))];
      const proposalIds = [...new Set(allRequests.map(r => r.proposal_id).filter(Boolean))];
      
      // Load groups
      const groupPromises = groupIds.map(id => 
        db.entities.StudentGroup.filter({ id: id })
      );
      const groupResults = await Promise.all(groupPromises);
      const groupsMap = {};
      groupResults.flat().forEach(g => groupsMap[g.id] = g);
      setGroups(groupsMap);
      
      // Load proposals
      const proposalPromises = proposalIds.map(id => 
        db.entities.Proposal.filter({ id: id })
      );
      const proposalResults = await Promise.all(proposalPromises);
      const proposalsMap = {};
      proposalResults.flat().forEach(p => proposalsMap[p.id] = p);
      setProposals(proposalsMap);
      
      // Load students (group leaders)
      const leaderIds = Object.values(groupsMap)
        .map(g => g.leader_student_id)
        .filter(Boolean);
      const studentPromises = leaderIds.map(id => 
        db.entities.Student.filter({ student_id: id })
      );
      const studentResults = await Promise.all(studentPromises);
      const studentsMap = {};
      studentResults.flat().forEach(s => studentsMap[s.student_id] = s);
      setStudents(studentsMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load requests');
    }
    setLoading(false);
  };

  const handleApproveRequest = async (request) => {
    setProcessing(true);
    try {
      await db.entities.SupervisionRequest.update(request.id, {
        status: 'approved',
        response_message: response || 'Request approved',
        response_date: new Date()
      });
      
      // Update group status if needed
      const group = groups[request.group_id];
      if (group) {
        await db.entities.StudentGroup.update(group.id, {
          status: 'active',
          supervisor_id: currentUser.teacher_id
        });
      }
      
      loadData(currentUser);
      setSelectedRequest(null);
      setResponse('');
      toast.success('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
    setProcessing(false);
  };

  const handleRejectRequest = async (request) => {
    setProcessing(true);
    try {
      await db.entities.SupervisionRequest.update(request.id, {
        status: 'rejected',
        response_message: response || 'Request rejected',
        response_date: new Date()
      });
      
      loadData(currentUser);
      setSelectedRequest(null);
      setResponse('');
      toast.success('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
    setProcessing(false);
  };

  const getRequestCard = (request) => {
    const group = groups[request.group_id];
    const proposal = proposals[request.proposal_id];
    const leader = students[group?.leader_student_id];
    
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
              
              {/* Leader Indicator */}
              <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-full">
                <Crown className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-xs">Group Leader</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              Request from {group?.group_name || 'Unknown Group'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-blue-300 mb-1">Leader:</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                      {leader?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{leader?.full_name || 'Unknown Student'}</p>
                    <p className="text-xs text-blue-300">{leader?.student_id || 'Unknown ID'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-blue-300 mb-1">Proposal:</p>
                <p className="text-white">{proposal?.title || 'No proposal title'}</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Request Message:</span> {request.request_message || 'No message provided'}
              </p>
            </div>
            
            {request.response_message && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Your Response:</span> {request.response_message}
                </p>
                {request.response_date && (
                  <p className="text-xs text-gray-400 mt-1">
                    Responded on {new Date(request.response_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            {request.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedRequest(request)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRequest(request);
                    setResponse('Request rejected');
                  }}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="Requests">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="Requests">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Supervision Requests</h1>
            <p className="text-blue-200 mt-2">
              Review and respond to student supervision requests
            </p>
            <div className="mt-4 flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full inline-flex">
              <AlertTriangle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">All requests come from group leaders only</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
                  <p className="text-blue-300">Pending Requests</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{approvedRequests.length}</p>
                  <p className="text-blue-300">Approved</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{rejectedRequests.length}</p>
                  <p className="text-blue-300">Rejected</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Requests Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur border-white/20">
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/30">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-500/30">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/30">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/30">
                All Requests ({requests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6 mt-6">
              {pendingRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-white mb-2">No pending requests</h3>
                  <p className="text-blue-200">All caught up! No new requests to review.</p>
                </Card>
              ) : (
                pendingRequests.map(getRequestCard)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6 mt-6">
              {approvedRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Check className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-white mb-2">No approved requests</h3>
                  <p className="text-blue-200">You haven't approved any supervision requests yet.</p>
                </Card>
              ) : (
                approvedRequests.map(getRequestCard)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6 mt-6">
              {rejectedRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <X className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-white mb-2">No rejected requests</h3>
                  <p className="text-blue-200">You haven't rejected any requests.</p>
                </Card>
              ) : (
                rejectedRequests.map(getRequestCard)
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6 mt-6">
              {requests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-white mb-2">No requests</h3>
                  <p className="text-blue-200">No students have requested your supervision yet.</p>
                </Card>
              ) : (
                requests.map(getRequestCard)
              )}
            </TabsContent>
          </Tabs>

          {/* Response Dialog */}
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedRequest?.status === 'approved' ? 'Approve Request' : 'Reject Request'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Request Details</h3>
                  <p className="text-blue-200 text-sm">
                    Group: {groups[selectedRequest?.group_id]?.group_name || 'Unknown'}
                  </p>
                  <p className="text-blue-200 text-sm">
                    Leader: {students[groups[selectedRequest?.group_id]?.leader_student_id]?.full_name || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Response Message
                  </label>
                  <Textarea
                    placeholder="Enter your response message..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setResponse('');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRequest?.status === 'approved') {
                      handleApproveRequest(selectedRequest);
                    } else {
                      handleRejectRequest(selectedRequest);
                    }
                  }}
                  disabled={processing || !response.trim()}
                  className={selectedRequest?.status === 'approved' 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedRequest?.status === 'approved' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Approve Request
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Reject Request
                        </>
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}