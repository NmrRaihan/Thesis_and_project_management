import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSortState, SortHeader } from '@/components/ui/SortHeader';
import { exportToExcel } from '@/utils/exportUtils';
import { 
  CheckCircle,
  Users,
  GraduationCap,
  ArrowLeft,
  Calendar,
  Filter,
  X,
  Search,
  BookOpen,
  FileText,
  Award,
  Eye,
  Download
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminCompletedWork() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { sortField, sortDirection, handleSort, sortData } = useSortState('title', 'asc');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadCompletedWork();
  }, []);

  const loadCompletedWork = async () => {
    try {
      // Load completed proposals
      const allProposals = await db.entities.Proposal.list();
      const completedProposals = allProposals.filter(p => p.status === 'completed');
      
      // Load admin-approved completion requests
      const completionRequests = await db.entities.ThesisCompletionRequest.list();
      const approvedCompletions = completionRequests.filter(r => 
        r.status === 'admin_approved' || r.status === 'completed'
      );
      
      // Enrich proposals with group information
      const groups = await db.entities.StudentGroup.list();
      const groupMap = {};
      groups.forEach(g => {
        groupMap[g.id] = g;
      });
      
      const enrichedProposals = completedProposals.map(item => ({
        ...item,
        group: groupMap[item.group_id] || null,
        completionType: 'proposal'
      }));
      
      const enrichedCompletions = approvedCompletions.map(item => ({
        ...item,
        completionType: 'completion_request',
        title: item.proposal_title,
        status: 'completed'
      }));
      
      // Combine both sources
      setCompletedItems([...enrichedProposals, ...enrichedCompletions]);
    } catch (error) {
      console.error('Error loading completed work:', error);
      toast.error('Failed to load completed work');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Extract semesters and years from completed items
  const semesterStats = {
    Spring: completedItems.filter(p => p.semester === 'Spring').length,
    Summer: completedItems.filter(p => p.semester === 'Summer').length,
    Fall: completedItems.filter(p => p.semester === 'Fall').length,
    Unspecified: completedItems.filter(p => !p.semester).length,
  };

  const uniqueYears = [...new Set(completedItems.filter(p => p.year).map(p => p.year))].sort((a, b) => b - a);
  const yearStats = {};
  uniqueYears.forEach(year => {
    yearStats[year] = completedItems.filter(p => p.year === year).length;
  });
  yearStats['Unspecified'] = completedItems.filter(p => !p.year).length;

  const typeStats = {
    Project: completedItems.filter(p => p.project_type === 'project').length,
    Thesis: completedItems.filter(p => p.project_type === 'thesis').length,
  };

  const filteredItems = completedItems.filter(p => {
    const matchesSemester = selectedSemester === 'all' 
      ? true 
      : selectedSemester === 'unspecified' 
        ? !p.semester 
        : p.semester === selectedSemester;
    
    const matchesYear = selectedYear === 'all'
      ? true
      : selectedYear === 'unspecified'
        ? !p.year
        : p.year === selectedYear;
    
    const matchesType = selectedType === 'all' || p.project_type === selectedType;
    
    const matchesSearch = searchTerm === '' ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.group?.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.group?.supervisor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSemester && matchesYear && matchesType && matchesSearch;
  });

  const sortedItems = sortData(filteredItems);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'title', label: 'Title' },
      { key: 'project_type', label: 'Type' },
      { key: 'field', label: 'Field' },
      { key: 'semester', label: 'Semester' },
      { key: 'year', label: 'Year' },
      { key: 'status', label: 'Status' },
      { key: 'completionType', label: 'Completion Type' },
      { key: 'group.group_name', label: 'Group' },
      { key: 'group.supervisor_name', label: 'Supervisor' },
      { key: 'completed_at', label: 'Completed Date' }
    ];
    
    // Flatten nested objects for export
    const exportData = sortedItems.map(item => ({
      ...item,
      'group.group_name': item.group?.group_name || 'N/A',
      'group.supervisor_name': item.group?.supervisor_name || 'N/A',
      project_type: item.project_type || (item.completionType === 'thesis' ? 'thesis' : 'project')
    }));
    
    exportToExcel(exportData, headers, 'completed-work-list');
  };

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/completed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Award className="w-8 h-8 text-emerald-400" />
                  Completed Projects & Theses
                </h1>
                <p className="text-blue-200 mt-1">Browse all successfully completed projects and theses</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button 
                  onClick={() => navigate('/admin/dashboard')} 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Modern Filter Control Panel */}
          <Card className="mb-6 p-5 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="space-y-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Filter className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  {(selectedSemester !== 'all' || selectedYear !== 'all' || selectedType !== 'all' || searchTerm) && (
                    <Badge className="bg-blue-500/30 text-blue-200 border border-blue-400/30 ml-2">
                      Active
                    </Badge>
                  )}
                </div>
                {(selectedSemester !== 'all' || selectedYear !== 'all' || selectedType !== 'all' || searchTerm) && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {setSelectedSemester('all'); setSelectedYear('all'); setSelectedType('all'); setSearchTerm('');}}
                    className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search by title, field, group, or supervisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'project', label: 'Projects', color: 'blue', count: typeStats.Project },
                    { value: 'thesis', label: 'Theses', color: 'purple', count: typeStats.Thesis }
                  ].map(({ value, label, color, count }) => {
                    const isActive = selectedType === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setSelectedType(isActive ? 'all' : value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30 scale-105`
                            : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          isActive ? 'bg-white/20' : `bg-${color}-500/20 text-${color}-300`
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Semester & Year Filter Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Semester Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Semester</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'Spring', label: 'Spring', color: 'green', count: semesterStats.Spring },
                      { value: 'Summer', label: 'Summer', color: 'amber', count: semesterStats.Summer },
                      { value: 'Fall', label: 'Fall', color: 'orange', count: semesterStats.Fall },
                      { value: 'unspecified', label: 'Unspecified', color: 'gray', count: semesterStats.Unspecified }
                    ].map(({ value, label, color, count }) => {
                      const isActive = selectedSemester === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setSelectedSemester(isActive ? 'all' : value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30 scale-105`
                              : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <span>{label}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            isActive ? 'bg-white/20' : `bg-${color}-500/20 text-${color}-300`
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Year Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all" className="bg-slate-800">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year} className="bg-slate-800">
                        {year} ({yearStats[year]})
                      </option>
                    ))}
                    {yearStats.Unspecified > 0 && (
                      <option value="unspecified" className="bg-slate-800">
                        Unspecified ({yearStats.Unspecified})
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(selectedSemester !== 'all' || selectedYear !== 'all' || selectedType !== 'all') && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-blue-200">Showing:</span>
                    {selectedType !== 'all' && (
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {selectedType === 'project' ? 'Projects' : 'Theses'}
                      </Badge>
                    )}
                    {selectedSemester !== 'all' && (
                      <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">
                        {selectedSemester === 'unspecified' ? 'No Semester' : `${selectedSemester} Semester`}
                      </Badge>
                    )}
                    {selectedYear !== 'all' && (
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {selectedYear === 'unspecified' ? 'No Year' : `Year ${selectedYear}`}
                      </Badge>
                    )}
                    <span className="text-white font-semibold ml-2">
                      → {filteredItems.length} completed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Modern Sort Control Bar */}
          <Card className="mb-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Filter className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-white">Sort by:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { field: 'title', label: 'Title', icon: BookOpen },
                  { field: 'project_type', label: 'Type', icon: FileText },
                  { field: 'field', label: 'Field', icon: BookOpen },
                  { field: 'semester', label: 'Semester', icon: Calendar },
                  { field: 'year', label: 'Year', icon: GraduationCap }
                ].map(({ field, label, icon: Icon }) => {
                  const isActive = sortField === field;
                  return (
                    <button
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                      {isActive && (
                        <div className="flex items-center">
                          {sortDirection === 'asc' ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Completed Work Grid */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading completed work...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Award className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Completed Work Found</h3>
              <p className="text-blue-200">
                {!searchTerm && selectedSemester === 'all' && selectedYear === 'all' && selectedType === 'all'
                  ? 'There are no completed projects or theses in the system yet.' 
                  : 'No completed work found matching your filters. Try adjusting your search criteria.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-blue-200 text-xs">Showing {sortedItems.length} completed items</p>
              
              {/* Minimal Table */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <SortHeader field="title" label="Title" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Type</th>
                        <SortHeader field="field" label="Field" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Group</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">Supervisor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-blue-200 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-white truncate max-w-xs">
                              {item.title}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${item.project_type === 'thesis' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-blue-500/20 text-blue-300 border-blue-400/30'} border text-xs`}>
                              {item.project_type === 'thesis' ? 'Thesis' : 'Project'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{item.field || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{item.group?.group_name || item.group_name || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-200">{item.group?.supervisor_name || item.teacher_name || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              onClick={() => handleViewDetails(item)}
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
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Completed Work Details</h2>
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
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedItem.title}</h3>
                  <Badge className={`${selectedItem.project_type === 'thesis' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-blue-500/20 text-blue-300 border-blue-400/30'} border`}>
                    {selectedItem.project_type === 'thesis' ? 'Thesis' : 'Project'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Field</p>
                    <p className="text-sm text-white">{selectedItem.field || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Group</p>
                    <p className="text-sm text-white">{selectedItem.group?.group_name || selectedItem.group_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Supervisor</p>
                    <p className="text-sm text-white">{selectedItem.group?.supervisor_name || selectedItem.teacher_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Status</p>
                    <p className="text-sm text-white">Completed</p>
                  </div>
                </div>

                {selectedItem.description && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Description</p>
                    <p className="text-sm text-white leading-relaxed">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.student_notes && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Student Notes</p>
                    <p className="text-sm text-white leading-relaxed">{selectedItem.student_notes}</p>
                  </div>
                )}

                {selectedItem.teacher_feedback && (
                  <div>
                    <p className="text-xs text-purple-300 mb-2">Teacher Feedback</p>
                    <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-400/30">
                      <p className="text-sm text-white leading-relaxed">{selectedItem.teacher_feedback}</p>
                    </div>
                  </div>
                )}

                {selectedItem.admin_feedback && (
                  <div>
                    <p className="text-xs text-blue-300 mb-2">Admin Feedback</p>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-400/30">
                      <p className="text-sm text-white leading-relaxed">{selectedItem.admin_feedback}</p>
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
