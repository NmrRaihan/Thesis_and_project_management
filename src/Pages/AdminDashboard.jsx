import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Calendar, 
  ClipboardList,
  Trash2,
  RefreshCw,
  LogOut,
  Shield,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [databaseData, setDatabaseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    teacher_id: '',
    full_name: '',
    email: '',
    department: '',
    research_field: '',
    password_hash: '',
    max_students: 10
  });
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    groups: 0,
    proposals: 0
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      
      // Get dashboard stats from hybrid database
      const [
        students,
        teachers,
        groups,
        proposals,
        messages,
        meetings,
        tasks,
        files,
        progressReports,
        invitations,
        supervisionRequests
      ] = await Promise.all([
        db.entities.Student.list(),
        db.entities.Teacher.list(),
        db.entities.StudentGroup.list(),
        db.entities.Proposal.list(),
        db.entities.Message.list(),
        db.entities.Meeting.list(),
        db.entities.Task.list(),
        db.entities.SharedFile.list(),
        db.entities.WeeklyProgress.list(),
        db.entities.GroupInvitation.list(),
        db.entities.SupervisionRequest.list()
      ]);

      // Set stats
      setStats({
        students: students.length,
        teachers: teachers.length,
        groups: groups.length,
        proposals: proposals.length
      });
      
      // Transform data to match existing structure
      const transformedData = {
        'entity_Student': students,
        'entity_Teacher': teachers,
        'entity_StudentGroup': groups,
        'entity_Proposal': proposals,
        'entity_Message': messages,
        'entity_Meeting': meetings,
        'entity_Task': tasks,
        'entity_SharedFile': files,
        'entity_WeeklyProgress': progressReports,
        'entity_GroupInvitation': invitations,
        'entity_SupervisionRequest': supervisionRequests
      };
      setDatabaseData(transformedData);
    } catch (error) {
      toast.error('Failed to load database data');
      console.error('Error loading database data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      try {
        // Clear all data using hybrid database service
        const [
          students,
          teachers,
          groups,
          proposals,
          messages,
          meetings,
          tasks,
          files,
          progressReports,
          invitations,
          supervisionRequests
        ] = await Promise.all([
          db.entities.Student.list(),
          db.entities.Teacher.list(),
          db.entities.StudentGroup.list(),
          db.entities.Proposal.list(),
          db.entities.Message.list(),
          db.entities.Meeting.list(),
          db.entities.Task.list(),
          db.entities.SharedFile.list(),
          db.entities.WeeklyProgress.list(),
          db.entities.GroupInvitation.list(),
          db.entities.SupervisionRequest.list()
        ]);

        // Delete all records
        for (const student of students) {
          await db.entities.Student.delete(student.id);
        }
        for (const teacher of teachers) {
          await db.entities.Teacher.delete(teacher.id);
        }
        for (const group of groups) {
          await db.entities.StudentGroup.delete(group.id);
        }
        for (const proposal of proposals) {
          await db.entities.Proposal.delete(proposal.id);
        }
        for (const message of messages) {
          await db.entities.Message.delete(message.id);
        }
        for (const meeting of meetings) {
          await db.entities.Meeting.delete(meeting.id);
        }
        for (const task of tasks) {
          await db.entities.Task.delete(task.id);
        }
        for (const file of files) {
          await db.entities.SharedFile.delete(file.id);
        }
        for (const progressReport of progressReports) {
          await db.entities.WeeklyProgress.delete(progressReport.id);
        }
        for (const invitation of invitations) {
          await db.entities.GroupInvitation.delete(invitation.id);
        }
        for (const supervisionRequest of supervisionRequests) {
          await db.entities.SupervisionRequest.delete(supervisionRequest.id);
        }

        toast.success('All data cleared successfully');
        loadDatabaseData();
      } catch (error) {
        toast.error('Failed to clear data');
        console.error('Error clearing data:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setAddingTeacher(true);
    
    try {
      // Validate required fields
      if (!newTeacher.teacher_id || !newTeacher.full_name || !newTeacher.password_hash) {
        toast.error('Please fill in all required fields (ID, Name, Password)');
        setAddingTeacher(false);
        return;
      }
      
      // Create teacher through API
      const teacherData = {
        teacher_id: newTeacher.teacher_id,
        full_name: newTeacher.full_name,
        email: newTeacher.email,
        password_hash: newTeacher.password_hash,
        department: newTeacher.department,
        research_field: newTeacher.research_field,
        max_students: newTeacher.max_students
      };
      
      await backendAPI.addTeacher(teacherData);
      
      toast.success('Teacher added successfully!');
      
      // Reset form
      setNewTeacher({
        teacher_id: '',
        full_name: '',
        email: '',
        department: '',
        research_field: '',
        password_hash: '',
        max_students: 10
      });
      
      // Hide form
      setShowAddTeacherForm(false);
      
      // Refresh data
      loadDatabaseData();
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error('Failed to add teacher. Please try again.');
    } finally {
      setAddingTeacher(false);
    }
  };

  const entityIcons = {
    Student: <Users className="w-5 h-5" />,
    Teacher: <GraduationCap className="w-5 h-5" />,
    StudentGroup: <Users className="w-5 h-5" />,
    GroupInvitation: <MessageSquare className="w-5 h-5" />,
    Proposal: <FileText className="w-5 h-5" />,
    Message: <MessageSquare className="w-5 h-5" />,
    Meeting: <Calendar className="w-5 h-5" />,
    Task: <ClipboardList className="w-5 h-5" />,
    SharedFile: <FileText className="w-5 h-5" />,
    WeeklyProgress: <ClipboardList className="w-5 h-5" />,
    SupervisionRequest: <FileText className="w-5 h-5" />
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500">System administration panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={loadDatabaseData} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{stats.students}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Teachers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.teachers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Student Groups</p>
                <p className="text-2xl font-bold text-slate-900">{stats.groups}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Proposals</p>
                <p className="text-2xl font-bold text-slate-900">{stats.proposals}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Teacher Form */}
        {showAddTeacherForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Teacher</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id" className="text-slate-700">Teacher ID *</Label>
                    <Input
                      id="teacher_id"
                      value={newTeacher.teacher_id}
                      onChange={(e) => setNewTeacher({...newTeacher, teacher_id: e.target.value})}
                      placeholder="e.g., T001"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-slate-700">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newTeacher.full_name}
                      onChange={(e) => setNewTeacher({...newTeacher, full_name: e.target.value})}
                      placeholder="e.g., Dr. John Smith"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                      placeholder="e.g., john.smith@university.edu"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-slate-700">Department</Label>
                    <Input
                      id="department"
                      value={newTeacher.department}
                      onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                      placeholder="e.g., Computer Science"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="research_field" className="text-slate-700">Research Field</Label>
                    <Input
                      id="research_field"
                      value={newTeacher.research_field}
                      onChange={(e) => setNewTeacher({...newTeacher, research_field: e.target.value})}
                      placeholder="e.g., Artificial Intelligence"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_students" className="text-slate-700">Max Students</Label>
                    <Input
                      id="max_students"
                      type="number"
                      min="1"
                      max="50"
                      value={newTeacher.max_students}
                      onChange={(e) => setNewTeacher({...newTeacher, max_students: parseInt(e.target.value) || 10})}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password_hash" className="text-slate-700">Password *</Label>
                  <Input
                    id="password_hash"
                    type="password"
                    value={newTeacher.password_hash}
                    onChange={(e) => setNewTeacher({...newTeacher, password_hash: e.target.value})}
                    placeholder="Password for teacher login"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddTeacherForm(false)}
                    className="h-11 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addingTeacher}
                    className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {addingTeacher ? 'Adding...' : 'Add Teacher'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Database Entities</h2>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowAddTeacherForm(!showAddTeacherForm)}
                  variant="outline"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
                <Button 
                  onClick={handleClearAllData} 
                  variant="destructive"
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading database entities...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(databaseData).map(([key, data]) => {
                  const entityName = key.replace('entity_', '');
                  const IconComponent = entityIcons[entityName] || <FileText className="w-5 h-5" />;
                  
                  return (
                    <Card key={key} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {IconComponent}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-slate-900">{entityName}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {Array.isArray(data) ? `${data.length} records` : '0 records'}
                          </p>
                          
                          {Array.isArray(data) && data.length > 0 && (
                            <div className="mt-3 max-h-48 overflow-y-auto">
                              <ul className="space-y-2">
                                {data.slice(0, 5).map((item, index) => (
                                  <li 
                                    key={index} 
                                    className="text-xs p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                                  >
                                    {entityName === 'Student' && (
                                      <div>
                                        <div className="font-medium text-slate-900 truncate">{item.full_name}</div>
                                        <div className="text-slate-500 text-xs mt-1">
                                          ID: {item.student_id} • {item.department || 'No department'}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                          Group: {item.group_id ? 'Assigned' : 'None'} • Status: {item.status || 'active'}
                                        </div>
                                      </div>
                                    )}
                                    {entityName === 'Teacher' && (
                                      <div>
                                        <div className="font-medium text-slate-900 truncate">{item.full_name}</div>
                                        <div className="text-slate-500 text-xs mt-1">
                                          ID: {item.teacher_id} • {item.department || 'No department'}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                          Students: {item.current_students_count || item.current_students || 0}/{item.max_students || 'Unlimited'}
                                        </div>
                                      </div>
                                    )}
                                    {entityName === 'Proposal' && (
                                      <div>
                                        <div className="font-medium text-slate-900 truncate">{item.title}</div>
                                        <div className="text-slate-500 text-xs mt-1">
                                          Status: {item.status || 'draft'} • Type: {item.project_type || 'thesis'}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                          Field: {item.field || 'Not specified'}
                                        </div>
                                      </div>
                                    )}
                                    {!['Student', 'Teacher', 'Proposal'].includes(entityName) && (
                                      <div className="truncate" title={item.full_name || item.student_id || item.teacher_id || item.title || item.id}>
                                        {item.full_name || item.student_id || item.teacher_id || item.title || item.id || 'Record'}
                                      </div>
                                    )}
                                  </li>
                                ))}
                                {data.length > 5 && (
                                  <li className="text-xs text-slate-400 text-center py-2">
                                    + {data.length - 5} more records...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}