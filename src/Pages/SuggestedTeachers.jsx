import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TeacherCard from '@/components/cards/TeacherCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Users, FileText, Loader2, Sparkles } from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function SuggestedTeachers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);

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
    
    // Load all teachers
    const allTeachers = await db.entities.Teacher.filter({ status: 'active' });
    
    // Load student's group and proposal
    if (user.group_id) {
      const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
        
        const proposals = await db.entities.Proposal.filter({ group_id: groups[0].id });
        if (proposals.length > 0) {
          setProposal(proposals[0]);
          
          // Calculate relevance scores based on topic matching
          const scoredTeachers = allTeachers.map(teacher => {
            let score = 0;
            const proposalKeywords = (proposals[0].keywords || []).map(k => k.toLowerCase());
            const proposalField = proposals[0].field?.toLowerCase() || '';
            const proposalTitle = proposals[0].title?.toLowerCase() || '';
            
            // Match research field
            if (teacher.research_field?.toLowerCase().includes(proposalField) ||
                proposalField.includes(teacher.research_field?.toLowerCase())) {
              score += 40;
            }
            
            // Match accepted topics
            teacher.accepted_topics?.forEach(topic => {
              if (proposalKeywords.some(k => topic.toLowerCase().includes(k) || k.includes(topic.toLowerCase()))) {
                score += 20;
              }
              if (proposalTitle.includes(topic.toLowerCase())) {
                score += 15;
              }
            });
            
            // Penalize if at capacity
            if (teacher.current_students_count >= teacher.max_students) {
              score -= 30;
            }
            
            return { ...teacher, relevanceScore: Math.min(100, Math.max(0, score)) };
          });
          
          // Sort by relevance
          scoredTeachers.sort((a, b) => b.relevanceScore - a.relevanceScore);
          setTeachers(scoredTeachers);
        } else {
          setTeachers(allTeachers.map(t => ({ ...t, relevanceScore: 50 })));
        }
        
        // Load sent requests
        if (groups.length > 0) {
          const requests = await db.entities.SupervisionRequest.filter({ group_id: groups[0].id });
          setSentRequests(requests);
        }
      }
    } else {
      setTeachers(allTeachers.map(t => ({ ...t, relevanceScore: 50 })));
    }
    
    setLoading(false);
  };

  const handleRequestSupervision = (teacher) => {
    if (!group) {
      toast.error('You need to create a group first');
      return;
    }
    if (!proposal) {
      toast.error('You need to submit a proposal first');
      return;
    }
    setSelectedTeacher(teacher);
  };

  const sendRequest = async () => {
    if (!selectedTeacher) return;
    
    setSending(true);
    
    try {
      await db.entities.SupervisionRequest.create({
        group_id: group.id,
        teacher_id: selectedTeacher.teacher_id,
        proposal_id: proposal.id,
        message: requestMessage,
        status: 'pending'
      });
      
      setSentRequests([...sentRequests, { teacher_id: selectedTeacher.teacher_id }]);
      setSelectedTeacher(null);
      setRequestMessage('');
      setSending(false);
      
      toast.success('Supervision request sent!');
    } catch (error) {
      console.error('Error sending request:', error);
      setSending(false);
      toast.error('Failed to send request. Please try again.');
    }
  };

  const isRequestSent = (teacherId) => sentRequests.some(r => r.teacher_id === teacherId);

  const filteredTeachers = teachers.filter(t => 
    t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.research_field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.accepted_topics?.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-white/20" />)}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="SuggestedTeachers">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h1 className="text-3xl font-bold text-white">Suggested Teachers</h1>
            </div>
            <p className="text-blue-200">
              Teachers are ranked by relevance to your proposal topic
            </p>
          </div>

        {/* Info Cards */}
        {(!group || !proposal) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-amber-500/20 border-amber-400/30 backdrop-blur-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white">Complete your setup</h3>
                  <p className="text-sm text-amber-100 mt-1">
                    {!group && 'You need to create a group first. '}
                    {group && !proposal && 'You need to submit a proposal to get personalized teacher suggestions.'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
          <Input
            placeholder="Search by name, field, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No teachers found</h3>
            <p className="text-blue-200">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTeachers.map((teacher, idx) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                relevanceScore={proposal ? teacher.relevanceScore : null}
                onRequestSupervision={handleRequestSupervision}
                requestSent={isRequestSent(teacher.teacher_id)}
                delay={idx * 0.05}
              />
            ))}
          </div>
        )}

        {/* Request Dialog */}
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Supervision</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-blue-100">
                Send a supervision request to <strong className="text-white">{selectedTeacher?.full_name}</strong>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Message (optional)</label>
                <Textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you'd like this teacher to supervise your work..."
                  className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTeacher(null)} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button 
                onClick={sendRequest} 
                disabled={sending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}