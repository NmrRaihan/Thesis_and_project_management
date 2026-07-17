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
  Send, 
  FileText, 
  Users, 
  GraduationCap,
  AlertCircle,
  Loader2,
  Paperclip,
  X,
  File,
  Shield
} from 'lucide-react';

export default function ThesisCompletionRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [defenseEnabled, setDefenseEnabled] = useState(false);
  const [defenseMessage, setDefenseMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate('/student/login');
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    try {
      if (!user.group_id) {
        setLoading(false);
        return;
      }

      // Load group
      const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
      if (groups.length > 0) {
        const groupData = groups[0];
        setGroup(groupData);

        // Check if group is supervised
        if (groupData.status !== 'supervised') {
          setLoading(false);
          return;
        }

        // Load proposal
        const proposals = await db.entities.Proposal.filter({ group_id: groupData.id });
        if (proposals.length > 0) {
          setProposal(proposals[0]);
        }

        // Check for existing completion request
        const requests = await db.entities.ThesisCompletionRequest.filter({ 
          group_id: groupData.id 
        });
        if (requests.length > 0) {
          setExistingRequest(requests[0]);
        }
      }

      // Load defense registration settings (outside group check)
      try {
        const defenseSettingsList = await db.entities.DefenseRegistration.list();
        console.log('=== DEFENSE SETTINGS LOADED ===');
        console.log('Settings list:', defenseSettingsList);
        if (defenseSettingsList.length > 0) {
          const settings = defenseSettingsList[0];
          console.log('Defense enabled value:', settings.defense_registration_enabled);
          console.log('Type:', typeof settings.defense_registration_enabled);
          setDefenseEnabled(settings.defense_registration_enabled);
          setDefenseMessage(settings.defense_message || '');
        } else {
          console.log('No settings found, defaulting to true');
          setDefenseEnabled(true);
        }
      } catch (error) {
        console.error('Error loading defense settings:', error);
        // Default to enabled if can't load settings
        setDefenseEnabled(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      return true;
    });
    
    // Convert files to base64 for storage
    const newAttachments = await Promise.all(
      validFiles.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result,
              uploadedAt: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    
    setAttachedFiles(prev => [...prev, ...newAttachments]);
    setFileInputKey(Date.now()); // Reset file input
    toast.success(`${newAttachments.length} file(s) attached`);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!group || !proposal || !group.assigned_teacher_id) {
      toast.error('Missing required information for completion request');
      return;
    }

    setSubmitting(true);
    try {
      const requestId = `TCR-${Date.now()}`;
      
      await db.entities.ThesisCompletionRequest.create({
        request_id: requestId,
        student_id: currentUser.student_id,
        student_name: currentUser.full_name,
        group_id: group.id,
        group_name: group.group_name,
        proposal_id: proposal.id,
        proposal_title: proposal.title,
        teacher_id: group.assigned_teacher_id,
        teacher_name: group.supervisor_name,
        student_notes: notes,
        attachments: attachedFiles,
        status: 'pending_teacher',
        requested_at: new Date().toISOString()
      });

      toast.success('Thesis completion request submitted successfully!');
      loadData(currentUser);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
    setSubmitting(false);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending_teacher':
        return { label: 'Pending Teacher Review', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', icon: Clock };
      case 'teacher_approved':
        return { label: 'Teacher Approved - Pending Admin', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: CheckCircle };
      case 'teacher_rejected':
        return { label: 'Teacher Rejected', color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: AlertCircle };
      case 'pending_admin':
        return { label: 'Pending Admin Review', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', icon: Clock };
      case 'admin_approved':
      case 'completed':
        return { label: 'Approved & Completed', color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle };
      case 'admin_rejected':
        return { label: 'Admin Rejected', color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="/student/thesis-completion">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check defense registration - if OFF, show message
  if (!defenseEnabled) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="/student/thesis-completion">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl border border-orange-400/30">
              <Shield className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Defense Registration Closed</h2>
              {defenseMessage ? (
                <div className="bg-orange-500/20 border border-orange-400/40 rounded-xl p-6 mb-6">
                  <p className="text-lg text-white font-semibold">{defenseMessage}</p>
                </div>
              ) : (
                <p className="text-blue-200 mb-6">Defense registration is currently closed.</p>
              )}
              <p className="text-orange-200">
                Please contact your supervisor or administrator for more information.
              </p>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  // Check if user is the group leader
  if (group && group.leader_student_id !== currentUser.student_id) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="/student/thesis-completion">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
              <CheckCircle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Leader Only</h2>
              <p className="text-blue-200 mb-6">
                Only the group leader can submit the thesis completion request. Please contact your leader.
              </p>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!group || group.status !== 'supervised') {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="/student/thesis-completion">
          <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20 max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Not Eligible</h2>
            <p className="text-blue-200 mb-6">
              You need to have a supervised group with an assigned teacher before you can submit a project/thesis completion request.
            </p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="/student/thesis-completion">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Project/Thesis Completion Request</h1>
            <p className="text-blue-200 mt-2">Submit your project or thesis for final approval</p>
          </div>

          {/* Group Info */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{group.group_name}</h2>
                <p className="text-blue-200">Group Status: {group.status}</p>
              </div>
            </div>
          </Card>

          {/* Proposal Info */}
          {proposal && (
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                  <p className="text-blue-200">Type: {proposal.project_type}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Supervisor Info */}
          {group.assigned_teacher_id && (
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Supervisor</h3>
                  <p className="text-blue-200">{group.supervisor_name || 'Assigned Teacher'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Existing Request Status */}
          {existingRequest ? (
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Completion Request Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusInfo = getStatusInfo(existingRequest.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <Badge className={`${statusInfo.color} border px-4 py-2`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.label}
                      </Badge>
                    );
                  })()}
                </div>
                
                {existingRequest.student_notes && (
                  <div>
                    <p className="text-sm text-blue-300">Your Notes:</p>
                    <p className="text-white">{existingRequest.student_notes}</p>
                  </div>
                )}

                {existingRequest.attachments && existingRequest.attachments.length > 0 && (
                  <div>
                    <p className="text-sm text-blue-300 mb-2">Attached Files ({existingRequest.attachments.length}):</p>
                    <div className="space-y-2">
                      {existingRequest.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                          <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{file.name}</p>
                            <p className="text-blue-300 text-xs">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {existingRequest.teacher_feedback && (
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-400/30">
                    <p className="text-sm text-blue-300 mb-1">Teacher Feedback:</p>
                    <p className="text-white">{existingRequest.teacher_feedback}</p>
                  </div>
                )}
                
                {existingRequest.admin_feedback && (
                  <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-400/30">
                    <p className="text-sm text-purple-300 mb-1">Admin Feedback:</p>
                    <p className="text-white">{existingRequest.admin_feedback}</p>
                  </div>
                )}
                
                <p className="text-sm text-blue-300">
                  Requested on: {new Date(existingRequest.requested_at).toLocaleString()}
                </p>
                
                {/* Resubmit button for rejected requests */}
                {(existingRequest.status === 'teacher_rejected' || existingRequest.status === 'admin_rejected') && (
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      onClick={() => {
                        setExistingRequest(null);
                        setNotes('');
                        setAttachedFiles([]);
                        toast.info('You can now submit a new request');
                      }}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      Resubmit Request
                    </Button>
                    <p className="text-xs text-blue-200 mt-2">
                      You can submit a new request with corrections
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* New Request Form */
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Submit Completion Request</h3>
              <p className="text-blue-200 mb-6">
                Submit your project/thesis for completion. Your supervisor will review it first, 
                then it will be forwarded to the admin for final approval.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes or comments about your thesis/project completion..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="space-y-3">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-blue-400/50 transition-colors">
                      <input
                        key={fileInputKey}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Paperclip className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white font-medium mb-1">Click to upload files</p>
                        <p className="text-blue-300 text-sm">PDF, DOC, DOCX, TXT, ZIP, PPT, XLS (Max 10MB each)</p>
                      </label>
                    </div>

                    {/* Attached Files List */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-300 font-medium">Attached Files ({attachedFiles.length}):</p>
                        {attachedFiles.map((file, index) => (
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
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Completion Request
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Workflow Info */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Completion Request Workflow</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-300 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Submit Request</p>
                  <p className="text-blue-200 text-sm">You submit the project/thesis completion request</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-300 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Teacher Review</p>
                  <p className="text-blue-200 text-sm">Your supervisor reviews and approves/rejects</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-300 font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Admin Approval</p>
                  <p className="text-blue-200 text-sm">Admin gives final approval</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <p className="text-white font-medium">Completed</p>
                  <p className="text-blue-200 text-sm">Your project/thesis is marked as completed</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}
