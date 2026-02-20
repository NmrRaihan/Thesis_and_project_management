import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
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
  Trash2
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function AdminStudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
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
    // Store student data in localStorage for the detail view
    localStorage.setItem('adminViewingStudent', JSON.stringify(student));
    navigate(`/admin/student/${student.id}`);
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
                  <h1 className="text-2xl font-bold text-white">Student Management</h1>
                  <p className="text-blue-200">Manage all student accounts</p>
                </div>
              </div>
              <div className="text-sm text-blue-200">
                Total Students: {students.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading students...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{student.full_name}</h3>
                          <p className="text-sm text-blue-200">{student.student_id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-200">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{student.department}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <IdCard className="w-4 h-4 mr-2" />
                          <span>Password: {student.password_hash}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {student.is_group_admin && (
                          <Badge variant="secondary" className="bg-blue-500/30 text-blue-200 border-blue-400/50">
                            Group Admin
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-blue-400/50 text-blue-200 bg-transparent">
                          Status: {student.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewStudent(student)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4" />
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
          
          {students.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
              <p className="text-blue-200">There are no students in the system yet.</p>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}