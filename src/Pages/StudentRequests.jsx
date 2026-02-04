import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RequestCard from '@/components/cards/RequestCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Send, Clock, Check, X } from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentRequests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
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
      // Load requests for this group
      const reqs = await base44.entities.SupervisionRequest.filter({ group_id: user.group_id });
      setRequests(reqs);
      
      // Load proposals
      const props = await base44.entities.Proposal.filter({ group_id: user.group_id });
      const propsMap = {};
      props.forEach(p => propsMap[p.id] = p);
      setProposals(propsMap);
      
      // Load teachers
      const teacherIds = [...new Set(reqs.map(r => r.teacher_id))];
      const teachersData = await base44.entities.Teacher.list();
      const teachersMap = {};
      teachersData.forEach(t => teachersMap[t.teacher_id] = t);
      setTeachers(teachersMap);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
    
    setLoading(false);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentRequests">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <Skeleton className="h-64 rounded-xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="StudentRequests">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Requests</h1>
            <p className="text-blue-200 mt-1">Track your supervision requests</p>
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
                <Card className="p-12 text-center bg-white/10 backdrop-blur border-white/20">
                  <Clock className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
                  <p className="text-blue-200">Your supervision requests will appear here</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req, idx) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">
                              Request to {teachers[req.teacher_id]?.full_name}
                            </h3>
                            <p className="text-sm text-blue-200">
                              {teachers[req.teacher_id]?.research_field}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-amber-500/30 text-amber-200 rounded-full text-sm font-medium border border-amber-400/50">
                            Pending
                          </span>
                        </div>
                        {proposals[req.proposal_id] && (
                          <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/20">
                            <p className="text-sm text-blue-200">
                              <strong>Proposal:</strong> {proposals[req.proposal_id].title}
                            </p>
                          </div>
                        )}
                        {req.message && (
                          <p className="text-sm text-blue-200 italic">"{req.message}"</p>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted">
              {acceptedRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur border-white/20">
                  <Check className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No accepted requests</h3>
                  <p className="text-blue-200">Accepted requests will appear here</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests.map((req, idx) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 bg-green-500/20 border-green-400/30">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">
                              {teachers[req.teacher_id]?.full_name}
                            </h3>
                            <p className="text-sm text-green-200">
                              Your supervisor
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm font-medium border border-green-400/50">
                            Accepted
                          </span>
                        </div>
                        {req.teacher_response && (
                          <p className="text-sm text-green-200">
                            <strong>Response:</strong> {req.teacher_response}
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white/10 backdrop-blur border-white/20">
                  <X className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No rejected requests</h3>
                  <p className="text-blue-200">Rejected requests will appear here</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rejectedRequests.map((req, idx) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">
                              {teachers[req.teacher_id]?.full_name}
                            </h3>
                          </div>
                          <span className="px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-sm font-medium border border-red-400/50">
                            Rejected
                          </span>
                        </div>
                        {req.teacher_response && (
                          <p className="text-sm text-red-200">
                            <strong>Reason:</strong> {req.teacher_response}
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
      </PageBackground>
    );
}