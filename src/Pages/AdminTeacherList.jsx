import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Building, 
  IdCard, 
  Users,
  ArrowLeft,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminTeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate(createPageUrl('AdminLogin'));
      return;
    }
    
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await db.entities.Teacher.list();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This cannot be undone.')) {
      try {
        await db.entities.Teacher.delete(teacherId);
        toast.success('Teacher deleted successfully');
        loadTeachers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleViewTeacher = (teacher) => {
    localStorage.setItem('adminViewingTeacher', JSON.stringify(teacher));
    navigate(createPageUrl('AdminTeacherDetail'), { state: { teacherId: teacher.id } });
  };

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
                  Teacher Management
                </h1>
                <p className="text-blue-200 mt-1">View and manage all teacher accounts</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/dashboard')} 
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
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Total Teachers</p>
                  <p className="text-2xl font-bold text-white">{teachers.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <GraduationCap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Teachers Found</h3>
              <p className="text-blue-200">There are no teachers registered in the system yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                  <div className="space-y-4">
                    {/* Header with Avatar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {teacher.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{teacher.full_name}</h3>
                          <p className="text-sm text-purple-300 flex items-center gap-1">
                            <IdCard className="w-3 h-3" />
                            {teacher.teacher_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center text-blue-200">
                        <Mail className="w-4 h-4 mr-3 text-purple-400" />
                        <span className="text-sm">{teacher.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-200">
                        <Building className="w-4 h-4 mr-3 text-purple-400" />
                        <span className="text-sm">{teacher.department || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-200">
                        <Users className="w-4 h-4 mr-3 text-purple-400" />
                        <span className="text-sm">
                          {teacher.current_students_count || 0} / {teacher.max_students || 5} students
                        </span>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">
                        {teacher.status || 'active'}
                      </Badge>
                      <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                        Max: {teacher.max_students || 5}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewTeacher(teacher)}
                        className="flex-1 bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteTeacher(teacher.id)}
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
      </DashboardLayout>
    </PageBackground>
  );
}