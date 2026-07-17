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
  Users, 
  User, 
  Mail, 
  Building, 
  IdCard, 
  GraduationCap,
  ArrowLeft,
  Eye,
  Trash2,
  X,
  EyeOff,
  Search,
  Download
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
  const [searchTerm, setSearchTerm] = useState('');
  const { sortField, sortDirection, handleSort, sortData } = useSortState('full_name', 'asc');

  useEffect(() => {
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
        loadStudents();
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

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.full_name?.toLowerCase().includes(term) ||
           s.student_id?.toLowerCase().includes(term) ||
           s.email?.toLowerCase().includes(term) ||
           s.department?.toLowerCase().includes(term);
  });

  const sortedStudents = sortData(filteredStudents);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'student_id', label: 'Student ID' },
      { key: 'full_name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'password_hash', label: 'Password' },
      { key: 'group_id', label: 'Group ID' }
    ];
    exportToExcel(sortedStudents, headers, 'students-list');
  };

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminStudentList">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Student Management</h1>
                <p className="text-sm text-blue-200">{students.length} students registered</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Card>

          {/* Students Table */}
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-blue-200">Loading students...</p>
            </div>
          ) : sortedStudents.length === 0 ? (
            <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">No Students Found</h3>
              <p className="text-sm text-blue-200">There are no students registered in the system yet.</p>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <SortHeader label="Student" field="full_name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="ID" field="student_id" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Email" field="email" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Department" field="department" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Semester" field="semester" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <SortHeader label="Year" field="year" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-blue-200/70">Group</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-blue-200/70">Status</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-blue-200/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-white text-sm font-medium truncate max-w-[140px]">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm flex items-center gap-1">
                            <IdCard className="w-3 h-3" />
                            {student.student_id}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm truncate block max-w-[160px]">{student.email || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-blue-200 text-sm">{student.department || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className={`${
                            student.semester === 'Spring' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                            student.semester === 'Summer' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                            student.semester === 'Fall' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-400/30'
                          } border text-xs`}>
                            {student.semester || '—'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 border text-xs">
                            {student.year || '—'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className={`${student.group_id ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-gray-500/20 text-gray-300 border-gray-400/30'} border text-xs`}>
                            {student.group_id ? (student.is_group_admin ? 'Leader' : 'Member') : 'None'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className="bg-green-500/20 text-green-300 border-green-400/30 border text-xs">
                            {student.status || 'active'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleViewStudent(student)}
                              className="h-7 w-7 p-0 text-blue-300 hover:text-white hover:bg-blue-500/20"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteStudent(student.id)}
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
                Showing {sortedStudents.length} of {students.length} students
              </div>
            </Card>
          )}
        </div>

        {/* Student Detail Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white">Student Details</h2>
                </div>
                <Button onClick={closeModal} variant="ghost" size="sm" className="text-white hover:bg-white/10 h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {selectedStudent.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedStudent.full_name}</h3>
                    <p className="text-blue-300 text-sm flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      {selectedStudent.student_id}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-blue-200/60">Email</label>
                    <p className="text-white text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-400" />{selectedStudent.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/60">Department</label>
                    <p className="text-white text-sm flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-400" />{selectedStudent.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/60">Semester / Year</label>
                    <p className="text-white text-sm flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-blue-400" />{selectedStudent.semester || 'N/A'} {selectedStudent.year ? `• ${selectedStudent.year}` : ''}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/60">Status</label>
                    <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 text-xs">{selectedStudent.status || 'active'}</Badge>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/60">Group</label>
                    <p className="text-white text-sm">{selectedStudent.group_id ? (selectedStudent.is_group_admin ? 'Group Leader' : 'Group Member') : 'No Group'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-200/60">Password</label>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-mono text-xs bg-white/5 px-2 py-1 rounded border border-white/10 flex-1 break-all">
                        {showPassword ? selectedStudent.password_hash : '••••••••'}
                      </p>
                      <button onClick={() => setShowPassword(!showPassword)} className="p-1 text-blue-300 hover:text-blue-100 hover:bg-white/10 rounded">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <Button 
                    className="flex-1 bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30 text-sm h-9" 
                    variant="outline"
                    onClick={() => toast.info('Edit functionality coming soon')}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    className="flex-1 bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 text-sm h-9" 
                    variant="outline"
                    onClick={() => { handleDeleteStudent(selectedStudent.id); closeModal(); }}
                  >
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
