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
  BookOpen,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminTeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [editingMaxStudents, setEditingMaxStudents] = useState(false);
  const [newMaxStudents, setNewMaxStudents] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadTeacher();
  }, [id]);

  const loadTeacher = async () => {
    try {
      let data = null;
      
      // First, try to get from URL parameter
      if (id) {
        console.log('Loading teacher by ID:', id);
        data = await db.entities.Teacher.findById(id);
        
        // If not found by ID, try localStorage
        if (!data) {
          console.log('Teacher not found by ID, trying localStorage');
          const storedTeacher = localStorage.getItem('adminViewingTeacher');
          if (storedTeacher) {
            data = JSON.parse(storedTeacher);
          }
        }
      } else {
        // If no ID in URL, try to get from localStorage (set by the list page)
        console.log('No ID in URL, trying localStorage');
        const storedTeacher = localStorage.getItem('adminViewingTeacher');
        if (storedTeacher) {
          data = JSON.parse(storedTeacher);
        }
      }
      
      if (data) {
        setTeacher(data);
      } else {
        console.error('No teacher data found');
        toast.error('Teacher not found');
      }
    } catch (error) {
      console.error('Error loading teacher:', error);
      toast.error('Failed to load teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (window.confirm('Are you sure you want to delete this teacher? This cannot be undone.')) {
      try {
        await db.entities.Teacher.delete(teacher.id);
        toast.success('Teacher deleted successfully');
        navigate('/admin/teachers'); // Return to the teachers list
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleUpdateTeacher = async () => {
    // For now, just redirect to an edit form if we had one
    toast.info('Teacher editing functionality would be implemented here');
  };

  const handleUpdateMaxStudents = async () => {
    if (newMaxStudents < (teacher.current_students_count || 0)) {
      toast.error(`Max students cannot be less than current students (${teacher.current_students_count || 0})`);
      return;
    }

    setSaving(true);
    try {
      await db.entities.Teacher.update(teacher.id, {
        max_students: parseInt(newMaxStudents)
      });
      
      setTeacher({
        ...teacher,
        max_students: parseInt(newMaxStudents)
      });
      
      setEditingMaxStudents(false);
      toast.success('Max students updated successfully');
    } catch (error) {
      console.error('Error updating max students:', error);
      toast.error('Failed to update max students');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-purple-200">Loading teacher details...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  if (!teacher) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">Teacher not found</h3>
            <p className="text-purple-200 mb-4">The requested teacher could not be found.</p>
            <Button 
              onClick={() => navigate('/admin/teachers')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers
            </Button>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/teachers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-purple-400" />
                  Teacher Details
                </h1>
                <p className="text-blue-200 mt-1">View and manage teacher account information</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/teachers')} 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teachers
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Teacher Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {teacher.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{teacher.full_name}</h3>
                      <p className="text-purple-300 flex items-center gap-2 mt-1">
                        <IdCard className="w-4 h-4" />
                        {teacher.teacher_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                        <p className="text-white">{teacher.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                        <p className="text-white flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-purple-400" />
                          {teacher.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Department</label>
                        <p className="text-white flex items-center">
                          <Building className="w-4 h-4 mr-2 text-purple-400" />
                          {teacher.department || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Research Field</label>
                        <p className="text-white flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-purple-400" />
                          {teacher.research_field || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Teacher ID</label>
                        <p className="text-white flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-purple-400" />
                          {teacher.teacher_id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded border border-white/10 flex-1">
                            {showPassword ? teacher.password_hash : '••••••••••••'}
                          </p>
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 p-2 text-purple-300 hover:text-purple-100 hover:bg-white/10 rounded transition-colors"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-xs text-purple-300 mt-1">
                          ⚠️ This is the hashed password. The actual password is not recoverable.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Status</label>
                        <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">
                          {teacher.status || 'active'}
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
                  <Users className="w-5 h-5 text-purple-400" />
                  Teaching Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Current Students</span>
                    <span className="text-white font-semibold">{teacher.current_students_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Max Capacity</span>
                    {editingMaxStudents ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={teacher.current_students_count || 0}
                          max={50}
                          value={newMaxStudents}
                          onChange={(e) => setNewMaxStudents(e.target.value)}
                          className="w-20 h-8 bg-white/10 border-white/20 text-white text-center"
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateMaxStudents}
                          disabled={saving}
                          className="h-8 px-2 bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingMaxStudents(false);
                            setNewMaxStudents(teacher.max_students || 10);
                          }}
                          className="h-8 px-2 bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{teacher.max_students || 5}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNewMaxStudents(teacher.max_students || 10);
                            setEditingMaxStudents(true);
                          }}
                          className="h-6 px-2 text-purple-300 hover:text-purple-100 hover:bg-white/10"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Available Slots</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {(teacher.max_students || 5) - (teacher.current_students_count || 0)}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-purple-300 mt-4">
                  Admin can edit the maximum student capacity for this teacher.
                </p>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Created</span>
                    <span className="text-white text-sm">
                      {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Last Updated</span>
                    <span className="text-white text-sm">
                      {teacher.updated_at ? new Date(teacher.updated_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-purple-500/20 border border-purple-400/30 text-purple-200 hover:bg-purple-500/30" 
                    variant="outline"
                    onClick={() => toast.info('Edit functionality coming soon')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30" 
                    variant="outline"
                    onClick={handleDeleteTeacher}
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