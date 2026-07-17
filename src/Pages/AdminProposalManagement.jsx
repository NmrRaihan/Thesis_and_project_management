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
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Users
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminProposalManagement() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const { sortField, sortDirection, handleSort, sortData } = useSortState('created_at', 'desc');

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate(createPageUrl('AdminLogin'));
      return;
    }

    loadProposals();
    loadTeachers();
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const allStudents = await db.entities.Student.list();
      const studentsMap = {};
      allStudents.forEach(s => {
        studentsMap[s.student_id] = s;
        studentsMap[s.id] = s;
      });
      setStudents(studentsMap);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadProposals = async () => {
    try {
      setLoading(true);
      const allProposals = await db.entities.Proposal.list();
      
      // Sort by creation date (newest first)
      const sortedProposals = allProposals.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setProposals(sortedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const allTeachers = await db.entities.Teacher.filter({ status: 'active' });
      setTeachers(allTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'submitted':
      case 'pending_admin_approval':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
      case 'submitted':
      case 'pending_admin_approval':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || proposal.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sortedProposals = sortData(filteredProposals);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'title', label: 'Title' },
      { key: 'student_name', label: 'Student' },
      { key: 'student_id', label: 'Student ID' },
      { key: 'project_type', label: 'Type' },
      { key: 'field', label: 'Field' },
      { key: 'status', label: 'Status' },
      { key: 'preferred_teacher_name', label: 'Preferred Teacher' },
      { key: 'created_at', label: 'Created Date' }
    ];
    exportToExcel(sortedProposals, headers, 'proposals-list');
  };

  // Pagination
  const totalPages = Math.ceil(sortedProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = sortedProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleViewProposal = async (proposal) => {
    setSelectedProposal(proposal);
    
    // Pre-select the preferred teacher if student suggested one
    if (proposal.preferred_teacher_id) {
      setSelectedTeacherId(proposal.preferred_teacher_id);
    } else {
      setSelectedTeacherId('');
    }
    
    // Load group members if proposal has group_id
    if (proposal.group_id) {
      try {
        const groups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
        if (groups.length > 0) {
          const group = groups[0];
          // Get members from the members array
          const members = [];
          if (group.members && Array.isArray(group.members)) {
            group.members.forEach(member => {
              const studentData = students[member.student_id];
              if (studentData) {
                members.push({
                  ...studentData,
                  role: member.role || 'member'
                });
              }
            });
          }
          setGroupMembers(members);
        }
      } catch (error) {
        console.error('Error loading group members:', error);
        setGroupMembers([]);
      }
    } else {
      setGroupMembers([]);
    }
    
    setShowProposalModal(true);
  };

  const closeProposalModal = () => {
    setShowProposalModal(false);
    setSelectedProposal(null);
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      // Get the proposal details
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        toast.error('Proposal not found');
        return;
      }

      // Check if a teacher has been selected
      if (!selectedTeacherId) {
        toast.error('Please select a teacher to assign to this group');
        return;
      }

      // Update proposal status to approved
      await db.entities.Proposal.update(proposalId, {
        status: 'approved',
        approved_at: new Date().toISOString()
      });
      
      // Find the group associated with this proposal and assign the teacher
      const groups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
      if (groups.length > 0) {
        const group = groups[0];
        
        // Get teacher details
        const teacher = teachers.find(t => t.teacher_id === selectedTeacherId);
        
        console.log('Assigning teacher to group:', {
          groupId: group.id,
          teacherId: selectedTeacherId,
          teacherName: teacher?.full_name,
          currentStatus: group.status
        });
        
        // Update group with assigned teacher - DON'T use spread operator, update specific fields
        await db.entities.StudentGroup.update(group.id, {
          assigned_teacher_id: selectedTeacherId,
          supervisor_name: teacher?.full_name || 'Unknown',
          status: 'supervised',
          updated_at: new Date().toISOString()
        });
        
        console.log('Group updated successfully');
        
        // Verify the update
        const verifyGroups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
        if (verifyGroups.length > 0) {
          console.log('Verified group after update:', {
            assigned_teacher_id: verifyGroups[0].assigned_teacher_id,
            status: verifyGroups[0].status,
            supervisor_name: verifyGroups[0].supervisor_name
          });
        }
        
        toast.success(`Proposal approved! ${teacher?.full_name} has been assigned as supervisor.`);
      } else {
        toast.error('Group not found for this proposal');
      }
      
      // Close the modal and refresh the proposals list
      closeProposalModal();
      setSelectedTeacherId(''); // Reset teacher selection
      loadProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error('Failed to approve proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to reject this proposal? This will remove the assigned teacher and allow students to reform their group.')) {
      try {
        // Get the proposal details
        const proposal = proposals.find(p => p.id === proposalId);
        if (!proposal) {
          toast.error('Proposal not found');
          return;
        }

        // If proposal was approved, remove teacher assignment from group
        if (proposal.status === 'approved' && proposal.group_id) {
          const groups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
          if (groups.length > 0) {
            const group = groups[0];
            
            // Remove teacher assignment and revert status
            await db.entities.StudentGroup.update(group.id, {
              ...group,
              assigned_teacher_id: null,
              supervisor_name: null,
              status: 'active',  // Revert to active (not supervised)
              updated_at: new Date().toISOString()
            });
            
            toast.info('Teacher assignment removed from group');
          }
        }
        
        // Update proposal status to rejected
        await db.entities.Proposal.update(proposalId, {
          status: 'rejected',
          rejected_at: new Date().toISOString()
        });
        
        // Clear group_id from all students in this group so they can select partners again
        if (proposal.group_id) {
          try {
            const studentsInGroup = await db.entities.Student.filter({ group_id: proposal.group_id });
            for (const student of studentsInGroup) {
              await db.entities.Student.update(student.id, {
                group_id: null,
                is_group_admin: false
              });
            }
            toast.info('Students can now select new partners');
          } catch (error) {
            console.error('Error clearing student group assignments:', error);
          }
        }
        
        toast.success('Proposal rejected, teacher assignment removed, and students freed to select new partners');
        
        // Close the modal and refresh the proposals list
        closeProposalModal();
        setSelectedTeacherId('');
        loadProposals();
      } catch (error) {
        console.error('Error rejecting proposal:', error);
        toast.error('Failed to reject proposal');
      }
    }
  };

  const handleDeleteProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal? This will also remove the teacher assignment and free students to select new partners. This action cannot be undone.')) {
      try {
        // Get the proposal details before deleting
        const proposal = proposals.find(p => p.id === proposalId);
        
        // If proposal was approved, remove teacher assignment from group
        if (proposal && proposal.status === 'approved' && proposal.group_id) {
          const groups = await db.entities.StudentGroup.filter({ id: proposal.group_id });
          if (groups.length > 0) {
            const group = groups[0];
            
            // Remove teacher assignment and revert status
            await db.entities.StudentGroup.update(group.id, {
              ...group,
              assigned_teacher_id: null,
              supervisor_name: null,
              status: 'active',  // Revert to active (not supervised)
              updated_at: new Date().toISOString()
            });
            
            toast.info('Teacher assignment removed from group');
          }
        }
        
        // Clear group_id from all students in this group so they can select partners again
        if (proposal && proposal.group_id) {
          try {
            const studentsInGroup = await db.entities.Student.filter({ group_id: proposal.group_id });
            for (const student of studentsInGroup) {
              await db.entities.Student.update(student.id, {
                group_id: null,
                is_group_admin: false
              });
            }
            toast.info('Students can now select new partners');
          } catch (error) {
            console.error('Error clearing student group assignments:', error);
          }
        }
        
        // Delete the proposal
        await db.entities.Proposal.delete(proposalId);
        toast.success('Proposal deleted, teacher assignment removed, and students freed');
        loadProposals(); // Refresh the list
      } catch (error) {
        console.error('Error deleting proposal:', error);
        toast.error('Failed to delete proposal');
      }
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: proposals.length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      pending: proposals.filter(p => p.status === 'pending').length,
      submitted: proposals.filter(p => p.status === 'submitted').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/proposals">
        <div className="min-h-screen relative z-10">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Proposal Management</h1>
                    <p className="text-sm text-orange-200">Manage student thesis/project proposals</p>
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
                    Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-200">Total</p>
                  <p className="text-lg font-bold text-white">{statusCounts.total}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-200">Approved</p>
                  <p className="text-lg font-bold text-white">{statusCounts.approved}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-yellow-200">Pending</p>
                  <p className="text-lg font-bold text-white">{statusCounts.pending + statusCounts.submitted}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-200">Rejected</p>
                  <p className="text-lg font-bold text-white">{statusCounts.rejected}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search - Compact */}
          <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 mb-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, student, or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-300" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Proposals Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : paginatedProposals.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Proposals Found</h3>
              <p className="text-orange-200">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No proposals match your current search and filter criteria.'
                  : 'No proposals have been submitted yet.'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {paginatedProposals.map((proposal) => (
                <Card key={proposal.id} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">{proposal.title}</h3>
                        <Badge className={`${getStatusBadgeVariant(proposal.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-orange-200">
                        <span><span className="text-orange-300">Student:</span> {proposal.student_name} ({proposal.student_id})</span>
                        <span><span className="text-orange-300">Field:</span> {proposal.field}</span>
                        <span><span className="text-orange-300">Type:</span> {proposal.project_type}</span>
                        <span><span className="text-orange-300">Submitted:</span> {new Date(proposal.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        onClick={() => handleViewProposal(proposal)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-orange-200 hover:text-white hover:bg-orange-500/20"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-300 hover:text-white hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                Previous
              </Button>
              
              <span className="text-white px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Detail Modal */}
      {showProposalModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedProposal.title}</h2>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusBadgeVariant(selectedProposal.status)} flex items-center gap-1`}>
                      {getStatusIcon(selectedProposal.status)}
                      {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                    </Badge>
                    <span className="text-orange-200">Type: {selectedProposal.project_type}</span>
                  </div>
                </div>
                <Button
                  onClick={closeProposalModal}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-400" />
                    Student Information
                  </h3>
                  <div className="space-y-2 text-sm text-orange-200">
                    <p><span className="text-orange-300">Name:</span> {selectedProposal.student_name}</p>
                    <p><span className="text-orange-300">ID:</span> {selectedProposal.student_id}</p>
                    <p><span className="text-orange-300">Department:</span> {selectedProposal.department || 'N/A'}</p>
                    <p><span className="text-orange-300">Email:</span> {selectedProposal.student_email || 'N/A'}</p>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-400" />
                    Proposal Details
                  </h3>
                  <div className="space-y-2 text-sm text-orange-200">
                    <p><span className="text-orange-300">Field:</span> {selectedProposal.field}</p>
                    <p><span className="text-orange-300">Type:</span> {selectedProposal.project_type}</p>
                    <p><span className="text-orange-300">Status:</span> {selectedProposal.status}</p>
                    <p><span className="text-orange-300">Submitted:</span> {new Date(selectedProposal.created_at).toLocaleString()}</p>
                  </div>
                </Card>
              </div>
              
              {/* Group Members Section */}
              {groupMembers.length > 0 && (
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    Group Members ({groupMembers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupMembers.map((member, index) => (
                      <div key={member.id || index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{member.full_name}</p>
                            <p className="text-xs text-orange-300 mt-1">ID: {member.student_id}</p>
                          </div>
                          {member.role === 'leader' && (
                            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs">
                              Leader
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-orange-200">
                          <p><span className="text-orange-300">Dept:</span> {member.department || 'N/A'}</p>
                          <p><span className="text-orange-300">Email:</span> {member.email || 'N/A'}</p>
                          <p><span className="text-orange-300">Status:</span> {member.status || 'active'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {selectedProposal.description && (
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-400" />
                    Description
                  </h3>
                  <p className="text-orange-200 whitespace-pre-wrap">{selectedProposal.description}</p>
                </Card>
              )}
              
              {selectedProposal.objectives && (
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                    Objectives
                  </h3>
                  <p className="text-orange-200 whitespace-pre-wrap">{selectedProposal.objectives}</p>
                </Card>
              )}
              
              {selectedProposal.methodology && (
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Edit className="w-5 h-5 mr-2 text-indigo-400" />
                    Methodology
                  </h3>
                  <p className="text-orange-200 whitespace-pre-wrap">{selectedProposal.methodology}</p>
                </Card>
              )}
              
              {selectedProposal.timeline && (
                <Card className="p-4 bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-amber-400" />
                    Timeline
                  </h3>
                  <p className="text-orange-200 whitespace-pre-wrap">{selectedProposal.timeline}</p>
                </Card>
              )}
              
              {/* Teacher Assignment Section */}
              {selectedProposal.status === 'pending_admin_approval' && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    Assign Supervisor
                  </h4>
                  
                  {/* Show student's preferred teacher if they suggested one */}
                  {selectedProposal.preferred_teacher_name && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                      <p className="text-green-300 text-sm font-medium mb-1">
                        💡 Student's Preferred Supervisor:
                      </p>
                      <p className="text-white">
                        {selectedProposal.preferred_teacher_name}
                      </p>
                      <p className="text-green-200 text-xs mt-1">
                        The admin can choose to assign this teacher or select a different one based on suitability.
                      </p>
                    </div>
                  )}
                  
                  <p className="text-blue-200 text-sm mb-3">
                    Select a teacher to supervise this group. This will be required for approval.
                  </p>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-slate-800">-- Select a Teacher --</option>
                    {teachers.map((teacher) => {
                      const isPreferred = teacher.teacher_id === selectedProposal.preferred_teacher_id;
                      return (
                        <option 
                          key={teacher.teacher_id} 
                          value={teacher.teacher_id} 
                          className="bg-slate-800"
                        >
                          {teacher.full_name} - {teacher.department}
                          {isPreferred ? ' ⭐ (Student\'s Choice)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {teachers.length === 0 && (
                    <p className="text-yellow-300 text-xs mt-2">
                      ⚠️ No active teachers found. Please add teachers first.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => {
                    // Here you could implement an edit function
                    toast.info('Edit functionality would go here');
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {selectedProposal.status === 'pending_admin_approval' && (
                  <>
                    <Button
                      onClick={() => handleApproveProposal(selectedProposal.id)}
                      className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectProposal(selectedProposal.id)}
                      variant="destructive"
                      className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleDeleteProposal(selectedProposal.id)}
                  variant="destructive"
                  className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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