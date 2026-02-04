import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
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
  Loader2
} from 'lucide-react';
import { format } from '@/utils';

export default function TeacherRequests() {
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
    
    // Load all requests for this teacher
    const reqs = await base44.entities.SupervisionRequest.filter({ 
      teacher_id: user.teacher_id 
    });
    setRequests(reqs);
    
    // Load proposals
    const proposalIds = [...new Set(reqs.map(r => r.proposal_id))];
    const propsData = await base44.entities.Proposal.list();
    const propsMap = {};
    propsData.forEach(p => propsMap[p.id] = p);
    setProposals(propsMap);
    
    // Load groups
    const groupIds = [...new Set(reqs.map(r => r.group_id))];
    const groupsData = await base44.entities.StudentGroup.list();
    const groupsMap = {};
    groupsData.forEach(g => groupsMap[g.id] = g);
    setGroups(groupsMap);
    
    // Load students
    const studentsData = await base44.entities.Student.list();
    const studentsMap = {};
    studentsData.forEach(s => {
      studentsMap[s.student_id] = s;
      studentsMap[s.id] = s;
    });
    setStudents(studentsMap);
    
    setLoading(false);
  };

  const handleAccept = async (request) => {
    setProcessing(true);
    
    // Update request status
    await base44.entities.SupervisionRequest.update(request.id, { 
      status: 'accepted',
      teacher_response: response
    });
    
    // Update group with assigned teacher
    await base44.entities.StudentGroup.update(request.group_id, { 
      assigned_teacher_id: currentUser.teacher_id,
      status: 'supervised'
    });
    
    // Update teacher's student count
    const group = groups[request.group_id];
    const memberCount = group?.member_ids?.length || 1;
    await base44.entities.Teacher.update(currentUser.id, { 
      current_students_count: (currentUser.current_students_count || 0) + memberCount
    });
    
    // Update students' isSupervised status
    if (group?.member_ids) {
      for (const memberId of group.member_ids) {
        const student = Object.values(students).find(s => s.student_id === memberId);
        if (student) {
          // Students will see the change on next login
        }
      }
    }
    
    setSelectedRequest(null);
    setResponse('');
    setProcessing(false);
    toast.success('Request accepted successfully!');
    loadData(currentUser);
  };

  const handleReject = async (request) => {
    setProcessing(true);
    
    await base44.entities.SupervisionRequest.update(request.id, { 
      status: 'rejected',
      teacher_response: response
    });
    
    setSelectedRequest(null);
    setResponse('');
    setProcessing(false);
    toast.success('Request rejected');
    loadData(currentUser);
  };

  const getGroupStudents = (groupId) => {
    const group = groups[groupId];
    if (!group?.member_ids) return [];
    return group.member_ids.map(id => students[id]).filter(Boolean);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherRequests">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <Skeleton className="h-64 rounded-xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="TeacherRequests">
        <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Requests</h1>
          <p className="text-blue-200 mt-1">Review and manage supervision requests</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10 backdrop-blur border border-white/20">
            <TabsTrigger value="pending" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
              <Clock className="w-4 h-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
              <Check className="w-4 h-4" />
              Accepted ({acceptedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
              <X className="w-4 h-4" />
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
                <Send className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
                <p className="text-blue-200">New supervision requests will appear here</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req, idx) => {
                  const proposal = proposals[req.proposal_id];
                  const groupStudents = getGroupStudents(req.group_id);
                  
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className="bg-amber-500/30 text-amber-200 border-amber-400/50">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Review
                          </Badge>
                          <span className="text-sm text-blue-200">
                            {format(new Date(req.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {proposal && (
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {proposal.title}
                            </h3>
                            <p className="text-blue-200 text-sm line-clamp-2">
                              {proposal.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="border-white/30 text-white">
                                {proposal.project_type === 'thesis' ? 'Thesis' : 'Project'}
                              </Badge>
                              {proposal.field && (
                                <Badge variant="secondary" className="bg-blue-500/30 text-blue-200 border-blue-400/50">
                                  {proposal.field}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-xs text-blue-200 mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Group Members ({groupStudents.length})
                          </p>
                          <div className="flex items-center gap-3">
                            {groupStudents.map((student) => (
                              <div key={student.id} className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={student.profile_photo} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                    {student.full_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-white">{student.full_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {req.message && (
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
                            <p className="text-sm text-blue-200 italic">"{req.message}"</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-white/20">
                          {proposal && (
                            <Button
                              variant="outline"
                              onClick={() => setSelectedProposal(proposal)}
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Proposal
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              setSelectedRequest(req);
                              setResponse('');
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest({ ...req, action: 'reject' });
                              setResponse('');
                            }}
                            className="text-red-300 border-red-400/30 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted">
            {acceptedRequests.length === 0 ? (
              <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
                <Check className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No accepted requests</h3>
              </Card>
            ) : (
              <div className="space-y-4">
                {acceptedRequests.map((req) => {
                  const proposal = proposals[req.proposal_id];
                  return (
                    <Card key={req.id} className="p-6 bg-green-500/20 border border-green-400/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{proposal?.title}</h3>
                          <p className="text-sm text-green-200">{proposal?.field}</p>
                        </div>
                        <Badge className="bg-green-500/30 text-green-200 border-green-400/50">Accepted</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
                <X className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No rejected requests</h3>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map((req) => {
                  const proposal = proposals[req.proposal_id];
                  return (
                    <Card key={req.id} className="p-6 bg-white/10 backdrop-blur border border-white/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{proposal?.title}</h3>
                          {req.teacher_response && (
                            <p className="text-sm text-red-200 mt-1">Reason: {req.teacher_response}</p>
                          )}
                        </div>
                        <Badge className="bg-red-500/30 text-red-200 border-red-400/50">Rejected</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Accept/Reject Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="bg-white/10 backdrop-blur border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest?.action === 'reject' ? 'Reject Request' : 'Accept Request'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-blue-200">
                {selectedRequest?.action === 'reject' 
                  ? 'Provide a reason for rejection (optional):'
                  : 'Add a message to the students (optional):'}
              </p>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={selectedRequest?.action === 'reject' 
                  ? 'e.g., Topic doesn\'t align with my research...'
                  : 'e.g., Looking forward to working with you...'}
                className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)} className="border-white/30 text-white hover:bg-white/10">
                Cancel
              </Button>
              {selectedRequest?.action === 'reject' ? (
                <Button 
                  onClick={() => handleReject(selectedRequest)}
                  disabled={processing}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Reject
                </Button>
              ) : (
                <Button 
                  onClick={() => handleAccept(selectedRequest)}
                  disabled={processing}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Accept
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Proposal View Dialog */}
        <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white/10 backdrop-blur border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{selectedProposal?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="border-white/30 text-white">
                  {selectedProposal?.project_type === 'thesis' ? 'Thesis' : 'Project'}
                </Badge>
                {selectedProposal?.field && (
                  <Badge variant="secondary" className="bg-blue-500/30 text-blue-200 border-blue-400/50">{selectedProposal.field}</Badge>
                )}
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Description</h4>
                <p className="text-blue-200">{selectedProposal?.description}</p>
              </div>
              {selectedProposal?.full_proposal && (
                <div>
                  <h4 className="font-medium text-white mb-2">Full Proposal</h4>
                  <div className="bg-white/10 rounded-xl p-4 whitespace-pre-wrap text-sm text-blue-200 max-h-[400px] overflow-y-auto border border-white/20">
                    {selectedProposal.full_proposal}
                  </div>
                </div>
              )}
              {selectedProposal?.keywords?.length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.keywords.map((kw, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-500/30 text-blue-200 border-blue-400/50">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  </PageBackground>
);
}