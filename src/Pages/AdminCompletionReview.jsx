import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  GraduationCap,
  AlertCircle,
  X,
  Send,
  Loader2,
  Award,
  File,
  Download
} from 'lucide-react';

export default function AdminCompletionReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${file.name}`);
  };

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const allRequests = await db.entities.ThesisCompletionRequest.list();
      // Filter requests that are pending admin review
      const pendingAdmin = allRequests.filter(r => r.status === 'pending_admin');
      setRequests(pendingAdmin);
      
      // Also get completed requests for reference
      const completed = allRequests.filter(r => 
        r.status === 'admin_approved' || r.status === 'completed'
      );
      setCompletedRequests(completed);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
    setLoading(false);
  };

  const handleExportToExcel = () => {
    const allRequests = [...requests, ...completedRequests];
    const headers = [
      { key: 'proposal_title', label: 'Title' },
      { key: 'student_name', label: 'Student' },
      { key: 'group_name', label: 'Group' },
      { key: 'teacher_name', label: 'Teacher' },
      { key: 'status', label: 'Status' },
      { key: 'teacher_reviewed_at', label: 'Teacher Review Date' },
      { key: 'admin_reviewed_at', label: 'Admin Review Date' }
    ];
    exportToExcel(allRequests, headers, 'completion-requests-list');
  };

  const handleApprove = async (request) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setProcessing(true);
    try {
      // Update the completion request
      await db.entities.ThesisCompletionRequest.update(request.id, {
        status: 'completed',
        admin_feedback: feedback,
        admin_reviewed_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

      // Update the group status to completed and mark as disbanded
      const groups = await db.entities.StudentGroup.filter({ id: request.group_id });
      if (groups.length > 0) {
        await db.entities.StudentGroup.update(groups[0].id, {
          status: 'completed',
          disbanded: true,
          disbanded_at: new Date().toISOString(),
          disbanded_reason: 'Project/Thesis completed'
        });

        // Remove all students from the group
        const allStudents = await db.entities.Student.list();
        const groupStudents = allStudents.filter(s => s.group_id === request.group_id);
        
        for (const student of groupStudents) {
          await db.entities.Student.update(student.student_id, {
            ...student,
            group_id: null,
            group_name: null,
            is_group_admin: false,
            updated_at: new Date().toISOString()
          });
        }
      }

      // Update the proposal status
      const proposals = await db.entities.Proposal.filter({ id: request.proposal_id });
      if (proposals.length > 0) {
        await db.entities.Proposal.update(proposals[0].id, {
          status: 'completed'
        });
      }

      toast.success('Thesis/Project marked as completed! Group has been disbanded.');
      setSelectedRequest(null);
      setFeedback('');
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
    setProcessing(false);
  };

  const handleReject = async (request) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    setProcessing(true);
    try {
      await db.entities.ThesisCompletionRequest.update(request.id, {
        status: 'admin_rejected',
        admin_feedback: feedback,
        admin_reviewed_at: new Date().toISOString()
      });

      toast.success('Request rejected');
      setSelectedRequest(null);
      setFeedback('');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
    setProcessing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_admin':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Pending Admin Review</Badge>;
      case 'admin_approved':
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Completed</Badge>;
      case 'admin_rejected':
        return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="admin" currentPage="AdminCompletionReview">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminCompletionReview">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Project/Thesis Completion Approval</h1>
              <p className="text-blue-200 mt-2">Final approval for project/thesis completion requests</p>
            </div>
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Pending Final Approval</p>
                  <p className="text-2xl font-bold text-white">{requests.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Total Completed</p>
                  <p className="text-2xl font-bold text-white">{completedRequests.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Total Reviewed</p>
                  <p className="text-2xl font-bold text-white">{completedRequests.filter(r => r.status === 'admin_rejected').length + completedRequests.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Requests */}
          {requests.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-blue-200">There are no thesis completion requests pending final approval.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Pending Final Approval ({requests.length})</h2>
              {requests.map((request) => (
                <Card key={request.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{request.proposal_title}</h3>
                          <p className="text-blue-200">{request.group_name}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-200">{request.student_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-200">{request.teacher_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-200">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-200">
                            Teacher Approved: {request.teacher_reviewed_at ? new Date(request.teacher_reviewed_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {request.student_notes && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-4">
                          <p className="text-sm text-blue-300 mb-1">Student Notes:</p>
                          <p className="text-white text-sm">{request.student_notes}</p>
                        </div>
                      )}

                      {request.teacher_feedback && (
                        <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-400/30 mb-4">
                          <p className="text-sm text-purple-300 mb-1">Teacher Feedback (Approved):</p>
                          <p className="text-white text-sm">{request.teacher_feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600"
                      >
                        Review & Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Requests */}
          {completedRequests.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold text-white">Recently Completed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedRequests.slice(0, 6).map((request) => (
                  <Card key={request.id} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium truncate">{request.proposal_title}</h4>
                        <p className="text-blue-200 text-sm">{request.student_name}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Review Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl bg-slate-900 border-white/20 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Final Approval Review</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(null);
                      setFeedback('');
                    }}
                    className="text-blue-300 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-blue-300">Project/Thesis Title:</p>
                    <p className="text-white font-medium">{selectedRequest.proposal_title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-300">Student:</p>
                      <p className="text-white">{selectedRequest.student_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-300">Group:</p>
                      <p className="text-white">{selectedRequest.group_name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Supervising Teacher:</p>
                    <p className="text-white">{selectedRequest.teacher_name}</p>
                  </div>
                  {selectedRequest.student_notes && (
                    <div>
                      <p className="text-sm text-blue-300">Student Notes:</p>
                      <p className="text-white">{selectedRequest.student_notes}</p>
                    </div>
                  )}
                  {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-blue-300 mb-2">Attached Files ({selectedRequest.attachments.length}):</p>
                      <div className="space-y-2">
                        {selectedRequest.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                <p className="text-blue-300 text-xs">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadFile(file)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRequest.teacher_feedback && (
                    <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-400/30">
                      <p className="text-sm text-purple-300 mb-1">Teacher Feedback (Approved):</p>
                      <p className="text-white">{selectedRequest.teacher_feedback}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Admin Feedback *
                    </label>
                    <Textarea
                      placeholder="Provide your final feedback on this thesis/project completion..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={processing || !feedback.trim()}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Award className="w-4 h-4 mr-2" />
                      )}
                      Mark as Completed
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedRequest)}
                      disabled={processing || !feedback.trim()}
                      variant="outline"
                      className="flex-1 bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}
