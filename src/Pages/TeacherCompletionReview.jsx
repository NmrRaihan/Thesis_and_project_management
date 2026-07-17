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
  File,
  Download
} from 'lucide-react';

export default function TeacherCompletionReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate('/teacher/login');
      return;
    }
    setCurrentUser(user);
    loadRequests(user);
  }, []);

  const loadRequests = async (user) => {
    try {
      const allRequests = await db.entities.ThesisCompletionRequest.list();
      // Filter requests for this teacher that are pending review
      const pendingRequests = allRequests.filter(r => 
        r.teacher_id === user.teacher_id && 
        (r.status === 'pending_teacher' || r.status === 'teacher_approved' || r.status === 'teacher_rejected')
      );
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
    setLoading(false);
  };

  const handleApprove = async (request) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setProcessing(true);
    try {
      await db.entities.ThesisCompletionRequest.update(request.id, {
        status: 'pending_admin',
        teacher_feedback: feedback,
        teacher_reviewed_at: new Date().toISOString()
      });

      toast.success('Request approved and forwarded to admin');
      setSelectedRequest(null);
      setFeedback('');
      loadRequests(currentUser);
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
        status: 'teacher_rejected',
        teacher_feedback: feedback,
        teacher_reviewed_at: new Date().toISOString()
      });

      toast.success('Request rejected');
      setSelectedRequest(null);
      setFeedback('');
      loadRequests(currentUser);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
    setProcessing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_teacher':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Pending Review</Badge>;
      case 'teacher_approved':
      case 'pending_admin':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Forwarded to Admin</Badge>;
      case 'teacher_rejected':
        return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="/teacher/completion-review">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="/teacher/completion-review">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Project/Thesis Completion Requests</h1>
            <p className="text-blue-200 mt-2">Review and approve student project/thesis completion requests</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Pending Review</p>
                  <p className="text-2xl font-bold text-white">
                    {requests.filter(r => r.status === 'pending_teacher').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Send className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Forwarded to Admin</p>
                  <p className="text-2xl font-bold text-white">
                    {requests.filter(r => r.status === 'pending_admin').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Total Reviewed</p>
                  <p className="text-2xl font-bold text-white">
                    {requests.filter(r => r.status !== 'pending_teacher').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Requests Found</h3>
              <p className="text-blue-200">There are no thesis completion requests to review at this time.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{request.proposal_title}</h3>
                          <p className="text-blue-200">{request.group_name}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-blue-200">{request.student_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                          <span className="text-blue-200">{request.group_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-blue-200">
                            {new Date(request.requested_at).toLocaleDateString()}
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
                          <p className="text-sm text-purple-300 mb-1">Your Feedback:</p>
                          <p className="text-white text-sm">{request.teacher_feedback}</p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending_teacher' && (
                      <div className="ml-4">
                        <Button
                          onClick={() => setSelectedRequest(request)}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600"
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Review Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl bg-slate-900 border-white/20 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Review Completion Request</h2>
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
                  <div>
                    <p className="text-sm text-blue-300">Student:</p>
                    <p className="text-white">{selectedRequest.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Group:</p>
                    <p className="text-white">{selectedRequest.group_name}</p>
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
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Feedback *
                    </label>
                    <Textarea
                      placeholder="Provide your feedback on this thesis/project completion..."
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
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve & Forward to Admin
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
