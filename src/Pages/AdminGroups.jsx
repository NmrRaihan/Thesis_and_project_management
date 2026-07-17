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
  Eye, 
  Trash2, 
  Search, 
  Filter,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { sortField, sortDirection, handleSort, sortData } = useSortState('created_at', 'desc');

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate(createPageUrl('AdminLogin'));
      return;
    }

    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const allGroups = await db.entities.StudentGroup.list();
      
      // Calculate member count for each group by querying students
      const groupsWithMemberCount = await Promise.all(allGroups.map(async (group) => {
        // Try to get members from group.members array first
        let memberCount = group.members ? group.members.length : 0;
        
        // If empty or unreliable, query students directly
        if (memberCount === 0) {
          const studentsInGroup = await db.entities.Student.filter({ group_id: group.id });
          memberCount = studentsInGroup.length;
        }
        
        return {
          ...group,
          member_count: memberCount,
          max_members: 3
        };
      }));
      
      // Sort by creation date (newest first)
      const sortedGroups = groupsWithMemberCount.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'supervised':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'supervised':
        return <GraduationCap className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.group_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || group.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const sortedFilteredGroups = sortData(filteredGroups);

  const handleExportToExcel = () => {
    const headers = [
      { key: 'group_id', label: 'Group ID' },
      { key: 'group_name', label: 'Group Name' },
      { key: 'leader_name', label: 'Leader' },
      { key: 'member_count', label: 'Members' },
      { key: 'supervisor_name', label: 'Supervisor' },
      { key: 'status', label: 'Status' },
      { key: 'project_title', label: 'Project Title' },
      { key: 'created_at', label: 'Created Date' }
    ];
    exportToExcel(sortedFilteredGroups, headers, 'groups-list');
  };

  // Pagination
  const totalPages = Math.ceil(sortedFilteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = sortedFilteredGroups.slice(startIndex, startIndex + itemsPerPage);

  const handleViewGroup = (group) => {
    navigate(`/admin/groups/${group.id}`);
  };

  const handleDeleteGroup = async (groupDbId) => {
    if (window.confirm('Are you sure you want to delete this group? This will remove all members from the group and cannot be undone.')) {
      try {
        // Get the group by database ID
        const groupToDelete = await db.entities.StudentGroup.findById(groupDbId);
        
        if (groupToDelete) {
          // Remove all students from this group
          const allStudents = await db.entities.Student.list();
          for (const student of allStudents) {
            if (student.group_id === groupDbId) {
              await db.entities.Student.update(student.id, {
                ...student,
                group_id: null,
                group_name: null,
                is_group_admin: false,
                updated_at: new Date().toISOString()
              });
            }
          }
          
          // Delete the group
          await db.entities.StudentGroup.delete(groupToDelete.id);
          toast.success('Group deleted successfully');
          loadGroups(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: groups.length,
      active: groups.filter(g => g.status === 'active').length,
      inactive: groups.filter(g => g.status === 'inactive').length,
      supervised: groups.filter(g => g.status === 'supervised').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <PageBackground>
      <DashboardLayout userType="admin" currentPage="/admin/groups">
        <div className="min-h-screen relative z-10">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Student Groups</h1>
                    <p className="text-sm text-blue-200">Manage student project groups</p>
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
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Total</p>
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
                  <p className="text-xs text-green-200">Active</p>
                  <p className="text-lg font-bold text-white">{statusCounts.active}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Supervised</p>
                  <p className="text-lg font-bold text-white">{statusCounts.supervised}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-200">Inactive</p>
                  <p className="text-lg font-bold text-white">{statusCounts.inactive}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search - Compact */}
          <Card className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 mb-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or leader..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-300" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="supervised">Supervised</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Groups Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedGroups.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Groups Found</h3>
              <p className="text-blue-200">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No groups match your current search and filter criteria.'
                  : 'No student groups have been created yet.'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {paginatedGroups.map((group) => (
                <Card key={group.id} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">{group.group_name}</h3>
                        <Badge className={`${getStatusBadgeVariant(group.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(group.status)}
                          {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-blue-200">
                        <span><span className="text-blue-300">ID:</span> {group.group_id}</span>
                        <span><span className="text-blue-300">Leader:</span> {group.leader_name}</span>
                        <span><span className="text-blue-300">Members:</span> {group.member_count || 0}/{group.max_members || 3}</span>
                        <span><span className="text-blue-300">Created:</span> {new Date(group.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {group.supervisor_name && (
                        <div className="flex items-center text-xs text-purple-200 mt-0.5">
                          <GraduationCap className="w-3 h-3 mr-1 text-purple-400" />
                          {group.supervisor_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        onClick={() => handleViewGroup(group)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-200 hover:text-white hover:bg-blue-500/20"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDeleteGroup(group.id)}
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
    </DashboardLayout>
  </PageBackground>
);
}