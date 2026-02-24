import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function AdminGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
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

    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const allGroups = await db.entities.StudentGroup.list();
      
      // Sort by creation date (newest first)
      const sortedGroups = allGroups.sort((a, b) => 
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'supervised':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'supervised':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.group_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || group.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + itemsPerPage);

  const handleViewGroup = (group) => {
    navigate(`/admin/groups/${group.group_id}`);
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This will remove all members from the group and cannot be undone.')) {
      try {
        // Find the group to delete
        const allGroups = await db.entities.StudentGroup.list();
        const groupToDelete = allGroups.find(g => g.group_id === groupId);
        
        if (groupToDelete) {
          // Remove all students from this group
          const allStudents = await db.entities.Student.list();
          for (const student of allStudents) {
            if (student.group_id === groupId) {
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
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Student Groups</h1>
                  <p className="text-blue-200">Manage student project groups</p>
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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">Total Groups</p>
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
                  <p className="text-sm font-medium text-green-200">Active</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.active}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">Supervised</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.supervised}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Inactive</p>
                  <p className="text-2xl font-bold text-white">{statusCounts.inactive}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search groups by name, ID, or leader..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-300" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="space-y-4">
              {paginatedGroups.map((group) => (
                <Card key={group.id} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{group.group_name}</h3>
                            <Badge className={`${getStatusBadgeVariant(group.status)} flex items-center gap-1`}>
                              {getStatusIcon(group.status)}
                              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-200">
                            <div>
                              <span className="text-blue-300">Group ID:</span> {group.group_id}
                            </div>
                            <div>
                              <span className="text-blue-300">Leader:</span> {group.leader_name}
                            </div>
                            <div>
                              <span className="text-blue-300">Members:</span> {group.member_count || 0} / {group.max_members || 3}
                            </div>
                            <div>
                              <span className="text-blue-300">Created:</span> {new Date(group.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {group.group_description && (
                            <p className="mt-2 text-blue-200 line-clamp-2">
                              {group.group_description.substring(0, 150)}...
                            </p>
                          )}
                          
                          {group.supervisor_name && (
                            <div className="mt-2 flex items-center text-sm text-purple-200">
                              <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                              Supervised by: {group.supervisor_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewGroup(group)}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDeleteGroup(group.group_id)}
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
    </PageBackground>
  );
}