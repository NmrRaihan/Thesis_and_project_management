import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SortHeader, useSortState } from '@/components/ui/SortHeader';
import { exportToExcel } from '@/utils/exportUtils';
import { 
  Award,
  FileText, 
  Users, 
  GraduationCap,
  Calendar,
  Search,
  Loader2,
  Download,
  Eye
} from 'lucide-react';

export default function AdminThesisCompleteList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { sortField, sortDirection, handleSort, sortData } = useSortState('completed_at', 'desc');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all completed thesis requests
      const allRequests = await db.entities.ThesisCompletionRequest.list();
      const completed = allRequests.filter(r => 
        r.status === 'completed' || r.status === 'admin_approved'
      );
      
      // Sort by completion date (most recent first)
      completed.sort((a, b) => {
        const dateA = new Date(a.completed_at || a.admin_reviewed_at || 0);
        const dateB = new Date(b.completed_at || b.admin_reviewed_at || 0);
        return dateB - dateA;
      });
      
      setCompletedRequests(completed);
      
      // Extract unique teachers for filter
      const uniqueTeachers = [...new Set(completed.map(r => r.teacher_name).filter(Boolean))];
      setTeachers(uniqueTeachers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load completed thesis list');
    }
    setLoading(false);
  };

  const filteredRequests = completedRequests.filter(request => {
    const matchesSearch = 
      request.proposal_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.group_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeacher = !filterTeacher || request.teacher_name === filterTeacher;
    
    return matchesSearch && matchesTeacher;
  });

  const sortedRequests = sortData(filteredRequests);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'proposal_title', label: 'Title' },
      { key: 'student_name', label: 'Student' },
      { key: 'group_name', label: 'Group' },
      { key: 'teacher_name', label: 'Teacher' },
      { key: 'completed_at', label: 'Completed Date' },
      { key: 'status', label: 'Status' }
    ];
    exportToExcel(sortedRequests, headers, 'thesis-completed-list');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="admin" currentPage="AdminThesisCompleteList">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminThesisCompleteList">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Completed Thesis/Projects</h1>
              <p className="text-sm text-blue-200 mt-1">All successfully completed thesis and projects</p>
            </div>
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Stats - Compact */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/20 rounded">
                  <Award className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Total</p>
                  <p className="text-lg font-bold text-white">{completedRequests.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Teachers</p>
                  <p className="text-lg font-bold text-white">{teachers.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">This Month</p>
                  <p className="text-lg font-bold text-white">
                    {completedRequests.filter(r => {
                      const completedDate = new Date(r.completed_at || r.admin_reviewed_at);
                      const now = new Date();
                      return completedDate.getMonth() === now.getMonth() && 
                             completedDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters - Compact */}
          <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search by title, student, or group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher} value={teacher} className="bg-slate-800">{teacher}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Completed List */}
          {sortedRequests.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Award className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {completedRequests.length === 0 ? 'No Completed Thesis Yet' : 'No Results Found'}
              </h3>
              <p className="text-blue-200">
                {completedRequests.length === 0 
                  ? 'Thesis and projects will appear here once they are completed.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-blue-200 text-xs">Showing {sortedRequests.length} of {completedRequests.length} completed</p>
              
              {/* Minimal Table */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <SortHeader field="proposal_title" label="Title" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="student_name" label="Student" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="group_name" label="Group" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="teacher_name" label="Supervisor" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="completed_at" label="Completed Date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <th className="px-4 py-3 text-right text-xs font-medium text-blue-200 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-white truncate max-w-xs">
                              {request.proposal_title}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{request.student_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{request.group_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{request.teacher_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">
                              {new Date(request.completed_at || request.admin_reviewed_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              onClick={() => handleViewDetails(request)}
                              size="sm"
                              variant="ghost"
                              className="text-blue-300 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Completion Details</h2>
                  <Button
                    onClick={() => setShowDetailsModal(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{selectedRequest.proposal_title}</h3>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    <Award className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Student</p>
                    <p className="text-sm text-white">{selectedRequest.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Group</p>
                    <p className="text-sm text-white">{selectedRequest.group_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Supervisor</p>
                    <p className="text-sm text-white">{selectedRequest.teacher_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Completed Date</p>
                    <p className="text-sm text-white">{new Date(selectedRequest.completed_at || selectedRequest.admin_reviewed_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Student Notes */}
                {selectedRequest.student_notes && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Student Notes</p>
                    <p className="text-sm text-white leading-relaxed">{selectedRequest.student_notes}</p>
                  </div>
                )}

                {/* Attachments */}
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Attachments ({selectedRequest.attachments.length})</p>
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{file.name}</p>
                              <p className="text-blue-300 text-xs">{file.type}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.data;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast.success(`Downloading ${file.name}`);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher Feedback */}
                {selectedRequest.teacher_feedback && (
                  <div>
                    <p className="text-xs text-purple-300 mb-2">Teacher Feedback</p>
                    <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-400/30">
                      <p className="text-sm text-white leading-relaxed">{selectedRequest.teacher_feedback}</p>
                    </div>
                  </div>
                )}

                {/* Admin Feedback */}
                {selectedRequest.admin_feedback && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Admin Feedback</p>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-400/30">
                      <p className="text-sm text-white leading-relaxed">{selectedRequest.admin_feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageBackground>
  );
}
