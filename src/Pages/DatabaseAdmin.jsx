import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Trash2, RefreshCw, Users, GraduationCap, BookOpen } from 'lucide-react';

export default function DatabaseAdmin() {
  const navigate = useNavigate();
  const [databaseData, setDatabaseData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      // Fetch data from localStorage database
      const allData = await db.getAllData();
      setDatabaseData(allData);
    } catch (error) {
      toast.error('Failed to load database data');
      console.error('Error loading database data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await db.clearAllData();
        toast.success('All data cleared successfully');
        loadDatabaseData();
      } catch (error) {
        toast.error('Failed to clear data');
        console.error('Error clearing data:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Map table names to friendly names
  const tableDisplayNames = {
    students: 'Student Accounts',
    teachers: 'Teacher Accounts',
    student_groups: 'Student Groups',
    group_invitations: 'Group Invitations',
    proposals: 'Proposals',
    supervision_requests: 'Supervision Requests',
    messages: 'Messages',
    tasks: 'Tasks',
    weekly_progress: 'Weekly Progress',
    meetings: 'Meetings',
    shared_files: 'Shared Files'
  };

  // Get icon for each table
  const getTableIcon = (tableName) => {
    switch (tableName) {
      case 'students': return <Users className="w-5 h-5 text-blue-600" />;
      case 'teachers': return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case 'student_groups': return <Users className="w-5 h-5 text-green-600" />;
      case 'proposals': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default: return <Database className="w-5 h-5 text-slate-600" />;
    }
  };

  // Render record details
  const renderRecord = (record) => {
    const displayFields = ['id', 'full_name', 'email', 'student_id', 'teacher_id', 'group_name', 'title', 'status'];
    const filteredFields = Object.entries(record).filter(([key]) => displayFields.includes(key));
    
    if (filteredFields.length === 0) {
      return <div className="text-xs text-slate-500">ID: {record.id}</div>;
    }
    
    return (
      <div className="space-y-1">
        {filteredFields.map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">{key}:</span>
            <span className="text-slate-700 truncate ml-2">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Database Administration</h1>
              <p className="text-slate-600">View and manage all system data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadDatabaseData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={handleClearAllData} variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
            <Button onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-slate-600 font-medium">Loading database data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(databaseData).map(([tableName, records]) => {
              const displayName = tableDisplayNames[tableName] || tableName;
              const icon = getTableIcon(tableName);
              
              return (
                <Card key={tableName} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icon}
                        <h2 className="text-lg font-semibold text-slate-900">
                          {displayName}
                        </h2>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        {records ? records.length : 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {Array.isArray(records) && records.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {records.slice(0, 10).map((item, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            {renderRecord(item)}
                          </div>
                        ))}
                        {records.length > 10 && (
                          <div className="text-center py-2 text-sm text-slate-500">
                            + {records.length - 10} more records...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Database className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No records</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}