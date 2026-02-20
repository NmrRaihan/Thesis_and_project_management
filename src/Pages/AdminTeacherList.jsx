import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
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

export default function AdminTeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
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
    // Store teacher data in localStorage for the detail view
    localStorage.setItem('adminViewingTeacher', JSON.stringify(teacher));
    navigate(`/admin/teacher/${teacher.id}`);
  };

  return (
    <PageBackground>
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate('/admin/dashboard')} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Teacher Management</h1>
                  <p className="text-blue-200">Manage all teacher accounts</p>
                </div>
              </div>
              <div className="text-sm text-blue-200">
                Total Teachers: {teachers.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading teachers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{teacher.full_name}</h3>
                          <p className="text-sm text-blue-200">{teacher.teacher_id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-200">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{teacher.email}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{teacher.department}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <IdCard className="w-4 h-4 mr-2" />
                          <span>Password: {teacher.password_hash}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          <span>Max Students: {teacher.max_students}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-purple-400/50 text-purple-200 bg-transparent">
                          Current: {teacher.current_students_count || 0}
                        </Badge>
                        <Badge variant="outline" className="border-purple-400/50 text-purple-200 bg-transparent">
                          Status: {teacher.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewTeacher(teacher)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4" />
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
          
          {teachers.length === 0 && !loading && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No teachers found</h3>
              <p className="text-blue-200">There are no teachers in the system yet.</p>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}