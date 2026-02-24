import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
  Calendar
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function AdminProposalManagement() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    loadProposals();
  }, []);

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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || proposal.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setShowProposalModal(true);
  };

  const closeProposalModal = () => {
    setShowProposalModal(false);
    setSelectedProposal(null);
  };

  const handleDeleteProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      try {
        await db.entities.Proposal.delete(proposalId);
        toast.success('Proposal deleted successfully');
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
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Proposal Management</h1>
                  <p className="text-orange-200">Manage student thesis/project proposals</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-200">Total Proposals</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.total}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-200">Approved</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.approved}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-200">Pending</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.pending + statusCounts.submitted}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Rejected</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.rejected}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search proposals by title, student name, or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-orange-300" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <div className="space-y-4">
              {paginatedProposals.map((proposal) => (
                <Card key={proposal.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                            <Badge className={`${getStatusBadgeVariant(proposal.status)} flex items-center gap-1`}>
                              {getStatusIcon(proposal.status)}
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-200">
                            <div>
                              <span className="text-orange-300">Student:</span> {proposal.student_name} ({proposal.student_id})
                            </div>
                            <div>
                              <span className="text-orange-300">Field:</span> {proposal.field}
                            </div>
                            <div>
                              <span className="text-orange-300">Type:</span> {proposal.project_type}
                            </div>
                            <div>
                              <span className="text-orange-300">Submitted:</span> {new Date(proposal.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {proposal.description && (
                            <p className="mt-3 text-orange-200 line-clamp-2">
                              {proposal.description.substring(0, 200)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewProposal(proposal)}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
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
    </PageBackground>
  );
}