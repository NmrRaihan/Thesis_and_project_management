import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SortHeader, useSortState } from '@/components/ui/SortHeader';
import { exportToExcel } from '@/utils/exportUtils';
import { 
  GraduationCap, 
  Mail, 
  Building, 
  IdCard, 
  Users,
  ArrowLeft,
  Eye,
  Trash2,
  Search,
  Download
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminTeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { sortField, sortDirection, handleSort, sortData } = useSortState('full_name', 'asc');

  useEffect(() => {
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
        loadTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleViewTeacher = (teacher) => {
    localStorage.setItem('adminViewingTeacher', JSON.stringify(teacher));
    navigate(`/admin/teacher/${teacher.id}`);
  };

  const filteredTeachers = teachers.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return t.full_name?.toLowerCase().includes(term) ||
           t.teacher_id?.toLowerCase().includes(term) ||
           t.email?.toLowerCase().includes(term) ||
           t.department?.toLowerCase().includes(term);
  });

  const sortedTeachers = sortData(filteredTeachers);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'teacher_id', label: 'Teacher ID' },
      { key: 'full_name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'research_field', label: 'Research Field' },
      { key: 'current_students_count', label: 'Current Students' },
      { key: 'max_students', label: 'Max Students' },
      { key: 'status', label: 'Status' }
    ];
    exportToExcel(sortedTeachers, headers, 'teachers-list');
  };

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/teachers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Teacher Management</h1>
                <p className="text-sm text-blue-200">{teachers.length} teachers registered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                size="sm"
                className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
              >
                <Download className="w-4 h-4 mr-1" />
                Export Excel
              </Button>
              <Button 
                onClick={() => navigate('/admin/dashboard')} 
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </Card>

          {/* Teachers Table */}
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-sm text-blue-200">Loading teachers...</p>
            </div>
          ) : sortedTeachers.length === 0 ? (
            <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">No Teachers Found</h3>
              <p className="text-sm text-blue-200">There are no teachers registered in the system yet.</p>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <SortHeader label="Teacher" field="full_name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="ID" field="teacher_id" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Email" field="email" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Department" field="department" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Students" field="current_students_count" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Max" field="max_students" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-blue-200/70">Status</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-blue-200/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {teacher.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-white text-sm font-medium truncate max-w-[140px]">{teacher.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-purple-200 text-sm flex items-center gap-1">
                            <IdCard className="w-3 h-3" />
                            {teacher.teacher_id}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm truncate block max-w-[160px]">{teacher.email || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm">{teacher.department || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm">{teacher.current_students_count || 0}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10 text-xs">
                            {teacher.max_students || 5}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 text-xs">
                            {teacher.status || 'active'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleViewTeacher(teacher)}
                              className="h-7 w-7 p-0 text-purple-300 hover:text-white hover:bg-purple-500/20"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="h-7 w-7 p-0 text-red-300 hover:text-white hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-white/10 text-xs text-blue-200/60">
                Showing {sortedTeachers.length} of {teachers.length} teachers
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </PageBackground>
  );
}
