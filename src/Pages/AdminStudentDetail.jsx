import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Building, 
  IdCard, 
  GraduationCap,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      let data = null;
      
      // First, try to get from URL parameter
      if (id) {
        data = await db.entities.Student.findById(id);
      } else {
        // If no ID in URL, try to get from localStorage (set by the list page)
        const storedStudent = localStorage.getItem('adminViewingStudent');
        if (storedStudent) {
          data = JSON.parse(storedStudent);
        }
      }
      
      setStudent(data);
    } catch (error) {
      console.error('Error loading student:', error);
      toast.error('Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (window.confirm('Are you sure you want to delete this student? This cannot be undone.')) {
      try {
        await db.entities.Student.delete(student.id);
        toast.success('Student deleted successfully');
        navigate('/admin/students'); // Return to the students list
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleUpdateStudent = async () => {
    // For now, just redirect to an edit form if we had one
    toast.info('Student editing functionality would be implemented here');
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-200">Loading student details...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  if (!student) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">Student not found</h3>
            <p className="text-blue-200 mb-4">The requested student could not be found.</p>
            <Button 
              onClick={() => navigate('/admin/students')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminStudentDetail">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-400" />
                  Student Details
                </h1>
                <p className="text-blue-200 mt-1">View and manage student account information</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/students')} 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Student Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{student.full_name}</h3>
                      <p className="text-blue-300 flex items-center gap-2 mt-1">
                        <IdCard className="w-4 h-4" />
                        {student.student_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                        <p className="text-white">{student.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                        <p className="text-white flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          {student.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Department</label>
                        <p className="text-white flex items-center">
                          <Building className="w-4 h-4 mr-2 text-blue-400" />
                          {student.department || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Student ID</label>
                        <p className="text-white flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-blue-400" />
                          {student.student_id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded border border-white/10 flex-1">
                            {showPassword ? student.password_hash : '••••••••••••'}
                          </p>
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 p-2 text-blue-300 hover:text-blue-100 hover:bg-white/10 rounded transition-colors"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-xs text-blue-300 mt-1">
                          ⚠️ This is the hashed password. The actual password is not recoverable.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Status</label>
                        <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">
                          {student.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar with additional info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  Group Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Role</span>
                    <Badge className={student.is_group_admin ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-slate-500/20 text-slate-300 border-slate-400/30'}>
                      {student.is_group_admin ? 'Group Leader' : 'Member'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Group ID</span>
                    <span className="text-white font-mono text-sm">{student.group_id || 'None'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Created</span>
                    <span className="text-white text-sm">
                      {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Last Updated</span>
                    <span className="text-white text-sm">
                      {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30" 
                    variant="outline"
                    onClick={() => toast.info('Edit functionality coming soon')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30" 
                    variant="outline"
                    onClick={handleDeleteStudent}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}