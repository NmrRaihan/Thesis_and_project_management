// Enhanced SuggestedTeachers component with explicit leader functionality
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
import { Search, Users, FileText, Loader2, Sparkles, Crown, AlertTriangle } from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function SuggestedTeachersEnhanced() {
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
      const groups = await db.entities.StudentGroup.filter({ group_id: user.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
        
        // Load proposal
        const proposals = await db.entities.Proposal.filter({ group_id: groups[0].id });
        if (proposals.length > 0) {
          setProposal(proposals[0]);
        }
        
        // Load sent requests
        const requests = await db.entities.SupervisionRequest.filter({ group_id: groups[0].id });
        setSentRequests(requests);
      }
    }
    
    setTeachers(allTeachers);
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!selectedTeacher || !group || !proposal) return;
    
    // Check if user is the group leader
    if (group.leader_student_id !== currentUser.student_id) {
      toast.error('Only the group leader can send supervision requests');
      return;
    }
    
    setSending(true);
    
    try {
      // Generate unique request ID
      const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      await db.entities.SupervisionRequest.create({
        request_id: requestId,
        group_id: group.id,
        teacher_id: selectedTeacher.teacher_id,
        request_message: requestMessage,
        status: 'pending',
        requested_date: new Date()
      });
      
      loadData(currentUser);
      setSelectedTeacher(null);
      setRequestMessage('');
      toast.success('Supervision request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request');
    }
    
    setSending(false);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
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
        <DashboardLayout userType="student" currentPage="SuggestedTeachers">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Group Found</h2>
              <p className="text-blue-200 mb-6">
                You need to be part of a group to request supervision from teachers.
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

  // Check if user is the group leader
  const isGroupLeader = group.leader_student_id === currentUser.student_id;

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="SuggestedTeachers">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Find Your Supervisor</h1>
            <p className="text-blue-200 mt-2">
              Connect with teachers who match your research interests
            </p>
            
            {/* Group Leader Indicator */}
            <div className="mt-4 flex items-center gap-3">
              {isGroupLeader ? (
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full">
                  <Crown className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">You are the Group Leader</span>
                  <span className="text-green-400 text-sm">(Can send supervision requests)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 px-4 py-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Group Member</span>
                  <span className="text-yellow-400 text-sm">(Only leaders can send requests)</span>
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
                  {proposal ? proposal.title : 'No proposal created yet'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-300">Requests Sent: {sentRequests.length}</p>
                <p className="text-sm text-blue-300">
                  Status: <span className="font-medium capitalize">{group.status}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
            <Input
              placeholder="Search teachers by name, department, or specialization..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TeacherCard
                    teacher={teacher}
                    onSelect={() => {
                      if (!isGroupLeader) {
                        toast.error('Only group leaders can send supervision requests');
                        return;
                      }
                      if (!proposal) {
                        toast.error('You need to create a proposal first');
                        return;
                      }
                      setSelectedTeacher(teacher);
                    }}
                    isSelected={selectedTeacher?.id === teacher.id}
                    disabled={!isGroupLeader || !proposal}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Send Request Dialog */}
          <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Request Supervision from {selectedTeacher?.full_name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Group Information</h3>
                  <p className="text-blue-200 text-sm">Group: {group?.group_name}</p>
                  <p className="text-blue-200 text-sm">Proposal: {proposal?.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message to Teacher
                  </label>
                  <Textarea
                    placeholder="Explain why you'd like this teacher to supervise your project..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTeacher(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={sending || !requestMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
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