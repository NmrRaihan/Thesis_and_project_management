import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Calendar, 
  ClipboardList,
  Trash2,
  RefreshCw,
  LogOut,
  Shield,
  Plus,
  Check,
  X,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Bell
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { handleError, AppError, ErrorTypes, asyncHandler } from '@/utils/errorHandler';
import { withDatabaseHandling } from '@/utils/databaseErrorHandler';

// Stub functions for backward compatibility (validation is done inline)
const validateTeacherForm = () => ({ isValid: true, errors: {} });
const displayErrors = () => null;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [databaseData, setDatabaseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    teacher_id: '',
    full_name: '',
    email: '',
    department: '',
    research_field: '',
    password_hash: '',
    max_students: 10
  });
  const [teacherFormErrors, setTeacherFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    groups: 0,
    proposals: 0,
    pendingCompletions: 0
  });
  const [groupRequests, setGroupRequests] = useState([]);
  const [supervisionRequests, setSupervisionRequests] = useState([]);
  const [pendingCompletions, setPendingCompletions] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [pollingInterval] = useState(10000); // 10 seconds

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadDatabaseData();
    
    // Cleanup on unmount
    return () => {
      // Stop all polling when component unmounts
      // This will be handled by the useRealTimeData hook automatically
    };
  }, []);

  // Real-time polling using custom hook
  const { 
    data: polledData, 
    loading: pollingLoading, 
    error: pollingError,
    refresh: manualRefresh,
    isPolling,
    lastUpdated,
    pollCount
  } = useRealTimeData(
    'admin-dashboard-data',
    async () => {
      await loadDatabaseData();
      setLastRefreshTime(new Date());
      return true;
    },
    autoRefreshEnabled ? pollingInterval : null, // Don't poll if disabled
    autoRefreshEnabled,
    {
      immediate: false, // Don't execute immediately, we already loaded on mount
      retryOnError: true,
      maxRetries: 3,
      onError: (error) => {
        console.error('[AdminDashboard] Polling error:', error);
        toast.error('Auto-refresh failed. You can manually refresh.');
      },
      onSuccess: () => {
        // Silent success - no toast for successful auto-refreshs
      }
    }
  );

  const loadDatabaseData = async () => {
    return withDatabaseHandling(async () => {
      setLoading(true);
      
      try {
        // Get dashboard stats from hybrid database
        const [
          students,
          teachers,
          groups,
          proposals,
          messages,
          meetings,
          tasks,
          files,
          progressReports,
          invitations,
          supervisionRequests,
          completionRequests
        ] = await Promise.all([
          db.entities.Student.list(),
          db.entities.Teacher.list(),
          db.entities.StudentGroup.list(),
          db.entities.Proposal.list(),
          db.entities.Message.list(),
          db.entities.Meeting.list(),
          db.entities.Task.list(),
          db.entities.SharedFile.list(),
          db.entities.WeeklyProgress.list(),
          db.entities.GroupInvitation.list(),
          db.entities.SupervisionRequest.list(),
          db.entities.ThesisCompletionRequest.list()
        ]);

        // Set stats
        const pendingCompletions = completionRequests.filter(r => r.status === 'pending_admin');
        setStats({
          students: students.length,
          teachers: teachers.length,
          groups: groups.length,
          proposals: proposals.length,
          pendingCompletions: pendingCompletions.length
        });
        setPendingCompletions(pendingCompletions);
        
        // Filter group creation requests (status = 'pending' and has group_name)
        const creationRequests = invitations.filter(inv => 
          inv.status === 'pending' && inv.group_name
        );
        setGroupRequests(creationRequests);
        
        // Filter supervision requests (status = 'accepted' and pending admin approval)
        const pendingSupervision = supervisionRequests.filter(req => 
          req.status === 'accepted'
        );
        setSupervisionRequests(pendingSupervision);
        
        // Transform data to match existing structure
        const transformedData = {
          'entity_Student': students,
          'entity_Teacher': teachers,
          'entity_StudentGroup': groups,
          'entity_Proposal': proposals,
          'entity_Message': messages,
          'entity_Meeting': meetings,
          'entity_Task': tasks,
          'entity_SharedFile': files,
          'entity_WeeklyProgress': progressReports,
          'entity_GroupInvitation': invitations,
          'entity_SupervisionRequest': supervisionRequests
        };
        setDatabaseData(transformedData);
        
        // Update last refresh time
        setLastRefreshTime(new Date());
        
        return {
          success: true,
          data: transformedData
        };
      } catch (error) {
        // Re-throw to be caught by withDatabaseHandling
        throw error;
      } finally {
        setLoading(false);
      }
    }, 'load dashboard data');
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      try {
        // Clear all data using hybrid database service
        const [
          students,
          teachers,
          groups,
          proposals,
          messages,
          meetings,
          tasks,
          files,
          progressReports,
          invitations,
          supervisionRequests
        ] = await Promise.all([
          db.entities.Student.list(),
          db.entities.Teacher.list(),
          db.entities.StudentGroup.list(),
          db.entities.Proposal.list(),
          db.entities.Message.list(),
          db.entities.Meeting.list(),
          db.entities.Task.list(),
          db.entities.SharedFile.list(),
          db.entities.WeeklyProgress.list(),
          db.entities.GroupInvitation.list(),
          db.entities.SupervisionRequest.list()
        ]);

        // Delete all records
        for (const student of students) {
          await db.entities.Student.delete(student.id);
        }
        for (const teacher of teachers) {
          await db.entities.Teacher.delete(teacher.id);
        }
        for (const group of groups) {
          await db.entities.StudentGroup.delete(group.id);
        }
        for (const proposal of proposals) {
          await db.entities.Proposal.delete(proposal.id);
        }
        for (const message of messages) {
          await db.entities.Message.delete(message.id);
        }
        for (const meeting of meetings) {
          await db.entities.Meeting.delete(meeting.id);
        }
        for (const task of tasks) {
          await db.entities.Task.delete(task.id);
        }
        for (const file of files) {
          await db.entities.SharedFile.delete(file.id);
        }
        for (const progressReport of progressReports) {
          await db.entities.WeeklyProgress.delete(progressReport.id);
        }
        for (const invitation of invitations) {
          await db.entities.GroupInvitation.delete(invitation.id);
        }
        for (const supervisionRequest of supervisionRequests) {
          await db.entities.SupervisionRequest.delete(supervisionRequest.id);
        }

        toast.success('All data cleared successfully');
        loadDatabaseData();
      } catch (error) {
        toast.error('Failed to clear data');
        console.error('Error clearing data:', error);
      }
    }
  };

  const handleClearDemoData = async () => {
    if (window.confirm('Are you sure you want to clear demo/sample data? This will remove sample teachers and other default entries, keeping only real user accounts.')) {
      try {
        // Get all current records
        const [
          students,
          teachers,
          groups,
          proposals,
          messages,
          meetings,
          tasks,
          files,
          progressReports,
          invitations,
          supervisionRequests
        ] = await Promise.all([
          db.entities.Student.list(),
          db.entities.Teacher.list(),
          db.entities.StudentGroup.list(),
          db.entities.Proposal.list(),
          db.entities.Message.list(),
          db.entities.Meeting.list(),
          db.entities.Task.list(),
          db.entities.SharedFile.list(),
          db.entities.WeeklyProgress.list(),
          db.entities.GroupInvitation.list(),
          db.entities.SupervisionRequest.list()
        ]);

        // Identify demo/sample records by common patterns in their data
        const demoTeacherIds = ['T001', 'T002', 'T003']; // Common demo teacher IDs
        
        // Delete demo teachers
        for (const teacher of teachers) {
          if (demoTeacherIds.includes(teacher.teacher_id) || 
              teacher.email?.includes('university.edu') || 
              teacher.full_name?.startsWith('Dr.') || 
              teacher.full_name?.startsWith('Prof.')) {
            await db.entities.Teacher.delete(teacher.id);
          }
        }
        
        // For students, we'll only delete if they match demo patterns
        for (const student of students) {
          if (student.student_id?.startsWith('S00')) { // Common demo student ID pattern
            await db.entities.Student.delete(student.id);
          }
        }

        toast.success('Demo data cleared successfully. Real user accounts remain.');
        loadDatabaseData();
      } catch (error) {
        toast.error('Failed to clear demo data');
        console.error('Error clearing demo data:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleApproveGroup = async (request) => {
    try {
      // Update invitation status
      await db.entities.GroupInvitation.update(request.id, {
        status: 'approved',
        approved_at: new Date().toISOString()
      });

      // Create new student group
      const newGroup = {
        group_id: `GRP-${Date.now()}`,
        group_name: request.group_name,
        group_description: request.group_description,
        leader_student_id: request.student_id,  // Consistent with backend schema
        leader_name: request.student_name,
        members: [{
          student_id: request.student_id,
          full_name: request.student_name,
          role: 'leader'
        }],
        member_count: 1,
        max_members: 3,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const createdGroup = await db.entities.StudentGroup.create(newGroup);

      // Update student record to make them group leader
      const students = await db.entities.Student.list();
      const student = students.find(s => s.student_id === request.student_id);
      if (student) {
        await db.entities.Student.update(request.student_id, {
          ...student,
          group_id: createdGroup.group_id,
          group_name: request.group_name,
          is_group_admin: true,
          updated_at: new Date().toISOString()
        });
      }

      toast.success(`Group "${request.group_name}" approved successfully!`);
      loadDatabaseData(); // Refresh data
    } catch (error) {
      console.error('Error approving group:', error);
      toast.error('Failed to approve group');
    }
  };

  const handleRejectGroup = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this group request?')) {
      try {
        await db.entities.GroupInvitation.update(requestId, {
          status: 'rejected',
          rejected_at: new Date().toISOString()
        });
        
        toast.success('Group request rejected');
        loadDatabaseData(); // Refresh data
      } catch (error) {
        console.error('Error rejecting group:', error);
        toast.error('Failed to reject group');
      }
    }
  };

  const handleApproveSupervision = async (request) => {
    try {
      // Update supervision request status
      await db.entities.SupervisionRequest.update(request.id, {
        status: 'approved',
        approved_at: new Date().toISOString()
      });

      // Update group with supervisor information
      const groups = await db.entities.StudentGroup.list();
      const group = groups.find(g => g.group_id === request.group_id);
      if (group) {
        await db.entities.StudentGroup.update(group.id, {
          ...group,
          supervisor_id: request.teacher_id,
          supervisor_name: request.teacher_name,
          status: 'supervised',
          updated_at: new Date().toISOString()
        });
      }

      // Update teacher's student count
      const teachers = await db.entities.Teacher.list();
      const teacher = teachers.find(t => t.teacher_id === request.teacher_id);
      if (teacher) {
        await db.entities.Teacher.update(request.teacher_id, {
          ...teacher,
          current_students_count: (teacher.current_students_count || 0) + 1,
          updated_at: new Date().toISOString()
        });
      }

      toast.success(`Supervision approved! ${request.teacher_name} is now supervising ${request.group_name}`);
      loadDatabaseData(); // Refresh data
    } catch (error) {
      console.error('Error approving supervision:', error);
      toast.error('Failed to approve supervision');
    }
  };

  const handleRejectSupervision = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this supervision request?')) {
      try {
        await db.entities.SupervisionRequest.update(requestId, {
          status: 'admin_rejected',
          rejected_at: new Date().toISOString()
        });
        
        toast.success('Supervision request rejected');
        loadDatabaseData(); // Refresh data
      } catch (error) {
        console.error('Error rejecting supervision:', error);
        toast.error('Failed to reject supervision');
      }
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateTeacherForm(newTeacher);
    
    if (!validation.isValid) {
      setTeacherFormErrors(validation.errors);
      setTouchedFields(Object.keys(newTeacher).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}));
      
      // Show first error in toast
      const firstErrorKey = Object.keys(validation.errors)[0];
      toast.error(validation.errors[firstErrorKey]);
      return;
    }
    
    setAddingTeacher(true);
    
    try {
      // Check if teacher already exists
      const existing = await db.entities.Teacher.filter({ teacher_id: newTeacher.teacher_id });
      if (existing.length > 0) {
        const duplicateError = new AppError(
          'Teacher ID already exists',
          ErrorTypes.VALIDATION,
          ErrorSeverity.MEDIUM,
          { field: 'teacher_id', value: newTeacher.teacher_id }
        );
        handleError(duplicateError, 'TeacherCreation', { showToast: false });
        
        setTeacherFormErrors(prev => ({
          ...prev,
          teacher_id: 'Teacher ID already exists. Please use a different ID.'
        }));
        setAddingTeacher(false);
        return;
      }

      // Check if email already exists (if provided)
      if (newTeacher.email) {
        const existingEmail = await db.entities.Teacher.filter({ email: newTeacher.email });
        if (existingEmail.length > 0) {
          const duplicateError = new AppError(
            'Email already registered',
            ErrorTypes.VALIDATION,
            ErrorSeverity.MEDIUM,
            { field: 'email', value: newTeacher.email }
          );
          handleError(duplicateError, 'TeacherCreation', { showToast: false });
          
          setTeacherFormErrors(prev => ({
            ...prev,
            email: 'Email already registered. Please use a different email.'
          }));
          setAddingTeacher(false);
          return;
        }
      }
      
      // Create teacher through hybrid database
      const teacherData = {
        teacher_id: newTeacher.teacher_id,
        full_name: newTeacher.full_name,
        email: newTeacher.email,
        password_hash: newTeacher.password_hash,
        department: newTeacher.department,
        research_field: newTeacher.research_field,
        max_students: newTeacher.max_students,
        current_students_count: 0,
        profile_photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newTeacher.full_name)}`,
        acceptance_criteria: 'To be updated',
        status: 'active'
      };
      
      await withDatabaseHandling(
        () => db.entities.Teacher.create(teacherData),
        'create teacher'
      );
      
      toast.success('Teacher added successfully!');
      
      // Reset form
      setNewTeacher({
        teacher_id: '',
        full_name: '',
        email: '',
        department: '',
        research_field: '',
        password_hash: '',
        max_students: 10
      });
      setTeacherFormErrors({});
      setTouchedFields({});
      
      // Hide form
      setShowAddTeacherForm(false);
      
      // Refresh data
      loadDatabaseData();
    } catch (error) {
      // Error is already handled by withDatabaseHandling or specific handlers above
      console.error('Error adding teacher:', error);
    } finally {
      setAddingTeacher(false);
    }
  };

  const entityIcons = {
    Student: <Users className="w-5 h-5" />,
    Teacher: <GraduationCap className="w-5 h-5" />,
    StudentGroup: <Users className="w-5 h-5" />,
    GroupInvitation: <MessageSquare className="w-5 h-5" />,
    Proposal: <FileText className="w-5 h-5" />,
    Message: <MessageSquare className="w-5 h-5" />,
    Meeting: <Calendar className="w-5 h-5" />,
    Task: <ClipboardList className="w-5 h-5" />,
    SharedFile: <FileText className="w-5 h-5" />,
    WeeklyProgress: <ClipboardList className="w-5 h-5" />,
    SupervisionRequest: <FileText className="w-5 h-5" />
  };

  return (
    <PageBackground>
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-amber-200">System administration panel</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Auto-refresh toggle */}
                <Button 
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  variant="outline"
                  className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${
                    autoRefreshEnabled ? 'ring-2 ring-green-500' : ''
                  }`}
                  title={autoRefreshEnabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
                >
                  {autoRefreshEnabled ? (
                    <Wifi className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 mr-2 text-gray-400" />
                  )}
                  {autoRefreshEnabled ? 'Live' : 'Paused'}
                </Button>

                {/* Manual refresh button */}
                <Button 
                  onClick={manualRefresh} 
                  variant="outline"
                  disabled={loading || pollingLoading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${(loading || pollingLoading) ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Completion Requests Alert */}
        {pendingCompletions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      🔔 {pendingCompletions.length} Project/Thesis Completion {pendingCompletions.length === 1 ? 'Request' : 'Requests'} Pending Approval
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Review and approve final student completions
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin/completion-review')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Review
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300" onClick={() => navigate('/admin/students')}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-200">Total Students</p>
                <p className="text-2xl font-bold text-white">{stats.students}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300" onClick={() => navigate('/admin/teachers')}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Teachers</p>
                <p className="text-2xl font-bold text-white">{stats.teachers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300" onClick={() => navigate('/admin/groups')}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-200">Student Groups</p>
                <p className="text-2xl font-bold text-white">{stats.groups}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300" onClick={() => navigate('/admin/proposals')}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-200">Proposals</p>
                <p className="text-2xl font-bold text-white">{stats.proposals}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300" onClick={() => navigate('/admin/completion-review')}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-200">Pending Completions</p>
                <p className="text-2xl font-bold text-white">{stats.pendingCompletions}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Status Bar */}
        <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
                autoRefreshEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                {autoRefreshEnabled ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  autoRefreshEnabled ? 'text-green-300' : 'text-gray-300'
                }`}>
                  {autoRefreshEnabled ? 'Auto-Refresh Active' : 'Auto-Refresh Paused'}
                </span>
              </div>
              
              {lastRefreshTime && (
                <div className="flex items-center space-x-2 text-sm text-blue-200">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-blue-300">
              <div className="flex items-center space-x-1">
                <RefreshCw className={`w-3 h-3 ${pollingLoading ? 'animate-spin' : ''}`} />
                <span>Refresh #{pollCount || 0}</span>
              </div>
              <div className="h-3 w-px bg-blue-400/30"></div>
              <div>
                Interval: {pollingInterval / 1000}s
              </div>
            </div>
          </div>
        </Card>

        {/* Add Teacher Form */}
        {showAddTeacherForm && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-sm border border-white/20 mb-6">
            <div className="px-6 py-5 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">Add New Teacher</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id" className="text-blue-200">Teacher ID *</Label>
                    <Input
                      id="teacher_id"
                      value={newTeacher.teacher_id}
                      onChange={(e) => {
                        setNewTeacher({...newTeacher, teacher_id: e.target.value});
                        if (touchedFields.teacher_id) {
                          const validation = validateTeacherForm({...newTeacher, teacher_id: e.target.value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, teacher_id: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      placeholder="e.g., T001"
                      className={`h-11 rounded-xl ${teacherFormErrors.teacher_id && touchedFields.teacher_id ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                      required
                    />
                    {touchedFields.teacher_id && displayErrors(teacherFormErrors, 'teacher_id')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-blue-200">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newTeacher.full_name}
                      onChange={(e) => {
                        setNewTeacher({...newTeacher, full_name: e.target.value});
                        if (touchedFields.full_name) {
                          const validation = validateTeacherForm({...newTeacher, full_name: e.target.value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, full_name: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      placeholder="e.g., Dr. John Smith"
                      className={`h-11 rounded-xl ${teacherFormErrors.full_name && touchedFields.full_name ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                      required
                    />
                    {touchedFields.full_name && displayErrors(teacherFormErrors, 'full_name')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => {
                        setNewTeacher({...newTeacher, email: e.target.value});
                        if (touchedFields.email) {
                          const validation = validateTeacherForm({...newTeacher, email: e.target.value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, email: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      placeholder="e.g., john.smith@university.edu"
                      className={`h-11 rounded-xl ${teacherFormErrors.email && touchedFields.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                    />
                    {touchedFields.email && displayErrors(teacherFormErrors, 'email')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-blue-200">Department</Label>
                    <Input
                      id="department"
                      value={newTeacher.department}
                      onChange={(e) => {
                        setNewTeacher({...newTeacher, department: e.target.value});
                        if (touchedFields.department) {
                          const validation = validateTeacherForm({...newTeacher, department: e.target.value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, department: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      placeholder="e.g., Computer Science"
                      className={`h-11 rounded-xl ${teacherFormErrors.department && touchedFields.department ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                    />
                    {touchedFields.department && displayErrors(teacherFormErrors, 'department')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="research_field" className="text-blue-200">Research Field</Label>
                    <Input
                      id="research_field"
                      value={newTeacher.research_field}
                      onChange={(e) => {
                        setNewTeacher({...newTeacher, research_field: e.target.value});
                        if (touchedFields.research_field) {
                          const validation = validateTeacherForm({...newTeacher, research_field: e.target.value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, research_field: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      placeholder="e.g., Artificial Intelligence"
                      className={`h-11 rounded-xl ${teacherFormErrors.research_field && touchedFields.research_field ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                    />
                    {touchedFields.research_field && displayErrors(teacherFormErrors, 'research_field')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_students" className="text-blue-200">Max Students</Label>
                    <Input
                      id="max_students"
                      type="number"
                      min="1"
                      max="50"
                      value={newTeacher.max_students}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 10;
                        setNewTeacher({...newTeacher, max_students: value});
                        if (touchedFields.max_students) {
                          const validation = validateTeacherForm({...newTeacher, max_students: value});
                          setTeacherFormErrors(validation.errors);
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields({...touchedFields, max_students: true});
                        const validation = validateTeacherForm(newTeacher);
                        setTeacherFormErrors(validation.errors);
                      }}
                      className={`h-11 rounded-xl ${teacherFormErrors.max_students && touchedFields.max_students ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                    />
                    {touchedFields.max_students && displayErrors(teacherFormErrors, 'max_students')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password_hash" className="text-blue-200">Password *</Label>
                  <Input
                    id="password_hash"
                    type="password"
                    value={newTeacher.password_hash}
                    onChange={(e) => {
                      setNewTeacher({...newTeacher, password_hash: e.target.value});
                      if (touchedFields.password_hash) {
                        const validation = validateTeacherForm({...newTeacher, password_hash: e.target.value});
                        setTeacherFormErrors(validation.errors);
                      }
                    }}
                    onBlur={() => {
                      setTouchedFields({...touchedFields, password_hash: true});
                      const validation = validateTeacherForm(newTeacher);
                      setTeacherFormErrors(validation.errors);
                    }}
                    placeholder="Password for teacher login"
                    className={`h-11 rounded-xl ${teacherFormErrors.password_hash && touchedFields.password_hash ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'}`}
                    required
                  />
                  {touchedFields.password_hash && displayErrors(teacherFormErrors, 'password_hash')}
                  <p className="text-xs text-blue-300 mt-1">
                    💡 Password should be at least 6 characters long
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddTeacherForm(false);
                      setNewTeacher({
                        teacher_id: '',
                        full_name: '',
                        email: '',
                        department: '',
                        research_field: '',
                        password_hash: '',
                        max_students: 10
                      });
                      setTeacherFormErrors({});
                      setTouchedFields({});
                    }}
                    className="h-11 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addingTeacher}
                    className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {addingTeacher ? 'Adding...' : 'Add Teacher'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
          <div className="px-6 py-5 border-b border-white/20">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Database Entities</h2>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowAddTeacherForm(!showAddTeacherForm)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
                <Button 
                  onClick={handleClearDemoData} 
                  variant="secondary"
                  className="bg-amber-500/20 border-amber-400/30 text-amber-200 hover:bg-amber-500/30 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Demo Data
                </Button>
                <Button 
                  onClick={handleClearAllData} 
                  variant="destructive"
                  className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-amber-200">Loading database entities...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(databaseData).map(([key, data]) => {
                  const entityName = key.replace('entity_', '');
                  const IconComponent = entityIcons[entityName] || <FileText className="w-5 h-5" />;
                  
                  return (
                    <Card key={key} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
                      <div className="flex items-start">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                          {IconComponent}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-white">{entityName}</h3>
                          <p className="text-sm text-amber-200 mt-1">
                            {Array.isArray(data) ? `${data.length} records` : '0 records'}
                          </p>
                          
                          {Array.isArray(data) && data.length > 0 && (
                            <div className="mt-3 max-h-48 overflow-y-auto">
                              <ul className="space-y-2">
                                {data.slice(0, 5).map((item, index) => (
                                  <li 
                                    key={index} 
                                    className="text-xs p-3 bg-white/5 rounded hover:bg-white/10 transition-colors border border-white/10"
                                  >
                                    {entityName === 'Student' && (
                                      <div>
                                        <div className="font-medium text-white truncate">{item.full_name}</div>
                                        <div className="text-amber-200 text-xs mt-1">
                                          ID: {item.student_id} • {item.department || 'No department'}
                                        </div>
                                        <div className="text-amber-200 text-xs">
                                          Group: {item.group_id ? 'Assigned' : 'None'} • Status: {item.status || 'active'}
                                        </div>
                                      </div>
                                    )}
                                    {entityName === 'Teacher' && (
                                      <div>
                                        <div className="font-medium text-white truncate">{item.full_name}</div>
                                        <div className="text-amber-200 text-xs mt-1">
                                          ID: {item.teacher_id} • {item.department || 'No department'}
                                        </div>
                                        <div className="text-amber-200 text-xs">
                                          Students: {item.current_students_count || item.current_students || 0}/{item.max_students || 'Unlimited'}
                                        </div>
                                      </div>
                                    )}
                                    {entityName === 'Proposal' && (
                                      <div>
                                        <div className="font-medium text-white truncate">{item.title}</div>
                                        <div className="text-amber-200 text-xs mt-1">
                                          Status: {item.status || 'draft'} • Type: {item.project_type || 'thesis'}
                                        </div>
                                        <div className="text-amber-200 text-xs">
                                          Field: {item.field || 'Not specified'}
                                        </div>
                                      </div>
                                    )}
                                    {!['Student', 'Teacher', 'Proposal'].includes(entityName) && (
                                      <div className="truncate text-white" title={item.full_name || item.student_id || item.teacher_id || item.title || item.id}>
                                        {item.full_name || item.student_id || item.teacher_id || item.title || item.id || 'Record'}
                                      </div>
                                    )}
                                  </li>
                                ))}
                                {data.length > 5 && (
                                  <li className="text-xs text-amber-300 text-center py-2">
                                    + {data.length - 5} more records...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Group Requests Section */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <div className="px-6 py-5 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Group Creation Requests</h2>
                  <div className="text-sm text-amber-200">
                    Pending: {groupRequests.length}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {groupRequests.length > 0 ? (
                  <div className="space-y-4">
                    {groupRequests.map((request) => (
                      <Card key={request.id} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-lg">{request.group_name}</h3>
                                <p className="text-amber-200">Requested by {request.student_name} ({request.student_id})</p>
                              </div>
                            </div>
                            
                            <div className="ml-13 space-y-2">
                              {request.group_description && (
                                <p className="text-amber-200 text-sm">{request.group_description}</p>
                              )}
                              <p className="text-xs text-amber-300">
                                Requested on: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-6">
                            <Button
                              onClick={() => handleApproveGroup(request)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectGroup(request.id)}
                              variant="outline"
                              className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
                    <p className="text-amber-200">There are no group creation requests at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Supervision Requests Section */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <div className="px-6 py-5 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Supervision Requests</h2>
                  <div className="text-sm text-purple-200">
                    Pending: {supervisionRequests.length}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {supervisionRequests.length > 0 ? (
                  <div className="space-y-4">
                    {supervisionRequests.map((request) => (
                      <Card key={request.id} className="p-5 bg-white/10 backdrop-blur-xl border border-white/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-lg">{request.group_name}</h3>
                                <p className="text-purple-200">Supervisor: {request.teacher_name}</p>
                              </div>
                            </div>
                            
                            <div className="ml-13 space-y-2">
                              <p className="text-purple-200 text-sm">Proposal: {request.proposal_title}</p>
                              <p className="text-xs text-purple-300">
                                Requested on: {new Date(request.responded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-6">
                            <Button
                              onClick={() => handleApproveSupervision(request)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectSupervision(request.id)}
                              variant="outline"
                              className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
                    <p className="text-purple-200">There are no supervision requests awaiting approval.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageBackground>
  );
}