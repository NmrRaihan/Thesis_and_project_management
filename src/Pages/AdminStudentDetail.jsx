import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  EyeOff,
  Calendar,
  Save,
  X,
  Loader2
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    department: '',
    semester: '',
    year: '',
    status: 'active'
  });

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
      // Initialize edit form with student data
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
          email: data.email || '',
          department: data.department || '',
          semester: data.semester || '',
          year: data.year || '',
          status: data.status || 'active'
        });
      }
    } catch (error) {
      console.error('Error loading student:', error);
      toast.error('Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    setSaving(true);
    try {
      await db.entities.Student.update(student.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        department: editForm.department,
        semester: editForm.semester,
        year: editForm.year,
        status: editForm.status,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setStudent({
        ...student,
        full_name: editForm.full_name,
        email: editForm.email,
        department: editForm.department,
        semester: editForm.semester,
        year: editForm.year,
        status: editForm.status
      });
      
      setIsEditing(false);
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditForm({
      full_name: student.full_name || '',
      email: student.email || '',
      department: student.department || '',
      semester: student.semester || '',
      year: student.year || '',
      status: student.status || 'active'
    });
    setIsEditing(false);
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Student Information</h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  /* Edit Form */
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">
                          {editForm.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                          className="text-xl font-bold text-white bg-white/10 border-white/20"
                          placeholder="Full Name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-blue-200 mb-1">Email</Label>
                          <Input
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Email"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-200 mb-1">Department</Label>
                          <Input
                            value={editForm.department}
                            onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Department"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-blue-200 mb-1">Semester</Label>
                          <select
                            value={editForm.semester}
                            onChange={(e) => setEditForm({...editForm, semester: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="" className="bg-slate-800">Select Semester</option>
                            <option value="Spring" className="bg-slate-800">Spring</option>
                            <option value="Summer" className="bg-slate-800">Summer</option>
                            <option value="Fall" className="bg-slate-800">Fall</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-200 mb-1">Academic Year</Label>
                          <Input
                            type="number"
                            value={editForm.year}
                            onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="e.g., 2025"
                            min="2000"
                            max="2100"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-200 mb-1">Status</Label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="active" className="bg-slate-800">Active</option>
                            <option value="graduated" className="bg-slate-800">Graduated</option>
                            <option value="inactive" className="bg-slate-800">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
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
                          <label className="block text-sm font-medium text-blue-200 mb-1">Semester</label>
                          <p className="text-white flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            {student.semester || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-1">Academic Year</label>
                          <p className="text-white flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-400" />
                            {student.year || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-1">Status</label>
                          <Badge className={`${
                            student.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                            student.status === 'graduated' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                            'bg-red-500/20 text-red-300 border-red-400/30'
                          } border`}>
                            {student.status || 'active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar with additional info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Academic Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Semester</span>
                    <Badge className={`${
                      student.semester === 'Spring' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                      student.semester === 'Summer' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                      student.semester === 'Fall' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-400/30'
                    } border`}>
                      {student.semester || 'Unspecified'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Year</span>
                    <span className="text-white font-medium">{student.year || 'Unspecified'}</span>
                  </div>
                </div>
              </Card>

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
                <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
                <Button 
                  className="w-full bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30" 
                  variant="outline"
                  onClick={handleDeleteStudent}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}