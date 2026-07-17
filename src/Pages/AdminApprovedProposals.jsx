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
  FileText, 
  Users, 
  GraduationCap,
  Calendar,
  Search,
  Loader2,
  Download,
  CheckCircle,
  BookOpen,
  Eye
} from 'lucide-react';

export default function AdminApprovedProposals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [filterType, setFilterType] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { sortField, sortDirection, handleSort, sortData } = useSortState('approved_at', 'desc');

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
      // Load all approved proposals
      const allProposals = await db.entities.Proposal.list();
      const approved = allProposals.filter(p => p.status === 'approved');
      
      // Load groups to get student and teacher info
      const groups = await db.entities.StudentGroup.list();
      const groupMap = {};
      groups.forEach(g => {
        groupMap[g.id] = g;
      });
      
      // Enrich proposals with group info
      const enrichedProposals = approved.map(proposal => ({
        ...proposal,
        group: groupMap[proposal.group_id] || null
      }));
      
      // Sort by approval date (most recent first) - using created_date as fallback
      enrichedProposals.sort((a, b) => {
        const dateA = new Date(a.approved_at || a.created_date || 0);
        const dateB = new Date(b.approved_at || b.created_date || 0);
        return dateB - dateA;
      });
      
      setApprovedProposals(enrichedProposals);
      
      // Extract unique fields for filter
      const uniqueFields = [...new Set(approved.map(p => p.field).filter(Boolean))];
      setFields(uniqueFields);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load approved proposals');
    }
    setLoading(false);
  };

  const filteredProposals = approvedProposals.filter(proposal => {
    const matchesSearch = 
      proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.group?.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.field?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesField = !filterField || proposal.field === filterField;
    const matchesType = !filterType || proposal.project_type === filterType;
    
    return matchesSearch && matchesField && matchesType;
  });

  const sortedProposals = sortData(filteredProposals);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'title', label: 'Title' },
      { key: 'project_type', label: 'Type' },
      { key: 'field', label: 'Field' },
      { key: 'group.group_name', label: 'Group' },
      { key: 'supervisor', label: 'Supervisor' },
      { key: 'approved_at', label: 'Approved Date' }
    ];
    
    // Prepare data with flattened group info
    const exportData = sortedProposals.map(proposal => ({
      ...proposal,
      'group.group_name': proposal.group?.group_name || 'N/A',
      supervisor: proposal.group?.supervisor_name || proposal.preferred_teacher_name || 'N/A',
      approved_at: proposal.approved_at ? new Date(proposal.approved_at).toLocaleDateString() : 'N/A'
    }));
    
    exportToExcel(exportData, headers, 'approved-proposals-list');
  };

  const getTypeBadge = (type) => {
    if (type === 'thesis') {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Thesis</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Project</Badge>;
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="admin" currentPage="AdminApprovedProposals">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="AdminApprovedProposals">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Approved Proposals</h1>
              <p className="text-sm text-blue-200 mt-1">All approved thesis and project proposals</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/20 rounded">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Total</p>
                  <p className="text-lg font-bold text-white">{approvedProposals.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Thesis</p>
                  <p className="text-lg font-bold text-white">
                    {approvedProposals.filter(p => p.project_type === 'thesis').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Projects</p>
                  <p className="text-lg font-bold text-white">
                    {approvedProposals.filter(p => p.project_type === 'project').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 rounded">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Fields</p>
                  <p className="text-lg font-bold text-white">{fields.length}</p>
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
                  placeholder="Search by title, group, or field..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">All Fields</option>
                {fields.map(field => (
                  <option key={field} value={field} className="bg-slate-800">{field}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">All Types</option>
                <option value="thesis" className="bg-slate-800">Thesis</option>
                <option value="project" className="bg-slate-800">Project</option>
              </select>
            </div>
          </Card>

          {/* Approved Proposals List */}
          {sortedProposals.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {approvedProposals.length === 0 ? 'No Approved Proposals Yet' : 'No Results Found'}
              </h3>
              <p className="text-blue-200">
                {approvedProposals.length === 0 
                  ? 'Approved proposals will appear here once they are reviewed.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-blue-200 text-xs">Showing {sortedProposals.length} of {approvedProposals.length} proposals</p>
              
              {/* Minimal Table */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <SortHeader field="title" label="Title" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="project_type" label="Type" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <SortHeader field="field" label="Field" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Group</th>
                        <SortHeader field="approved_at" label="Approved Date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <th className="px-4 py-3 text-right text-xs font-medium text-blue-200 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedProposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-white truncate max-w-xs">
                              {proposal.title}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getTypeBadge(proposal.project_type)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{proposal.field || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">
                              {proposal.group?.group_name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">
                              {proposal.approved_at ? new Date(proposal.approved_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              onClick={() => handleViewDetails(proposal)}
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
        {showDetailsModal && selectedProposal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Proposal Details</h2>
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
                {/* Title & Type */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{selectedProposal.title}</h3>
                    {getTypeBadge(selectedProposal.project_type)}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Field</p>
                    <p className="text-sm text-white">{selectedProposal.field || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Group</p>
                    <p className="text-sm text-white">{selectedProposal.group?.group_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Supervisor</p>
                    <p className="text-sm text-white">{selectedProposal.group?.supervisor_name || selectedProposal.preferred_teacher_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Approved Date</p>
                    <p className="text-sm text-white">{selectedProposal.approved_at ? new Date(selectedProposal.approved_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedProposal.description && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Description</p>
                    <p className="text-sm text-white leading-relaxed">{selectedProposal.description}</p>
                  </div>
                )}

                {/* Keywords */}
                {selectedProposal.keywords && selectedProposal.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProposal.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white/5 border-white/20 text-blue-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectives */}
                {selectedProposal.objectives && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Objectives</p>
                    <p className="text-sm text-white leading-relaxed">{selectedProposal.objectives}</p>
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
