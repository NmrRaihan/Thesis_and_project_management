import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  User, 
  Mail, 
  Building, 
  IdCard, 
  GraduationCap,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  X,
  EyeOff
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminStudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate(createPageUrl('AdminLogin'));
      return;
    }
    
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await db.entities.Student.list();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This cannot be undone.')) {
      try {
        await db.entities.Student.delete(studentId);
        toast.success('Student deleted successfully');
        loadStudents(); // Refresh the list
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setShowPassword(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setShowPassword(false);
  };

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminStudentList">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  Student Management
                </h1>
                <p className="text-blue-200 mt-1">View and manage all student accounts</p>
              </div>
              <Button 
                onClick={() => navigate(createPageUrl('AdminDashboard'))} 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            {/* Stats */}
            <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Total Students</p>
                  <p className="text-2xl font-bold text-white">{students.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Students Grid */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
              <p className="text-blue-200">There are no students registered in the system yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="space-y-4">
                    {/* Header with Avatar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{student.full_name}</h3>
                          <p className="text-sm text-blue-300 flex items-center gap-1">
                            <IdCard className="w-3 h-3" />
                            {student.student_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center text-blue-200">
                        <Mail className="w-4 h-4 mr-3 text-blue-400" />
                        <span className="text-sm">{student.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-200">
                        <Building className="w-4 h-4 mr-3 text-blue-400" />
                        <span className="text-sm">{student.department || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-200">
                        <GraduationCap className="w-4 h-4 mr-3 text-blue-400" />
                        <span className="text-sm">
                          {student.group_id ? 'In a group' : 'No group'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {student.is_group_admin && (
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          Group Leader
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-green-400/50 text-green-300 bg-green-500/10">
                        {student.status || 'active'}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewStudent(student)}
                        className="flex-1 bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Student Detail Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-400" />
                    Student Details
                  </h2>
                  <p className="text-blue-200 text-sm mt-1">Complete student information</p>
                </div>
                <Button
                  onClick={closeModal}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {selectedStudent.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedStudent.full_name}</h3>
                    <p className="text-blue-300 flex items-center gap-2 mt-1">
                      <IdCard className="w-4 h-4" />
                      {selectedStudent.student_id}
                    </p>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                      <p className="text-white">{selectedStudent.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                      <p className="text-white flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-400" />
                        {selectedStudent.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Department</label>
                      <p className="text-white flex items-center">
                        <Building className="w-4 h-4 mr-2 text-blue-400" />
                        {selectedStudent.department || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Student ID</label>
                      <p className="text-white flex items-center">
                        <IdCard className="w-4 h-4 mr-2 text-blue-400" />
                        {selectedStudent.student_id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Password (Hashed)</label>
                      <div className="flex items-center">
                        <p className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded border border-white/10 flex-1 break-all">
                          {showPassword ? selectedStudent.password_hash : '••••••••••••'}
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
                        {selectedStudent.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Group Status */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    Group Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-blue-200 mb-1">Role</label>
                      <Badge className={selectedStudent.is_group_admin ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-slate-500/20 text-slate-300 border-slate-400/30'}>
                        {selectedStudent.is_group_admin ? 'Group Leader' : 'Member'}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm text-blue-200 mb-1">Group ID</label>
                      <p className="text-white font-mono text-sm">{selectedStudent.group_id || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-blue-200 mb-1">Created</label>
                      <p className="text-white text-sm">
                        {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-blue-200 mb-1">Last Updated</label>
                      <p className="text-white text-sm">
                        {selectedStudent.updated_at ? new Date(selectedStudent.updated_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button 
                    className="flex-1 bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30" 
                    variant="outline"
                    onClick={() => toast.info('Edit functionality coming soon')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    className="flex-1 bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30" 
                    variant="outline"
                    onClick={() => {
                      handleDeleteStudent(selectedStudent.id);
                      closeModal();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageBackground>
  );
}