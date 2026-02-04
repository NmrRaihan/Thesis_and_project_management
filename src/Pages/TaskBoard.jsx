import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ClipboardList, 
  Plus, 
  User, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit3
} from 'lucide-react';

export default function TaskBoard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to_group_id: '',
    due_date: '',
    priority: 'medium'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate(createPageUrl('TeacherLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    try {
      // Load all tasks created by this teacher
      const teacherTasks = await base44.entities.Task.filter({ created_by_teacher_id: user.teacher_id });
      setTasks(teacherTasks);
      
      // Load all groups supervised by this teacher
      const teacherGroups = await base44.entities.StudentGroup.filter({ supervisor_teacher_id: user.teacher_id });
      setGroups(teacherGroups);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
    
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title || !newTask.assigned_to_group_id) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      await base44.entities.Task.create({
        ...newTask,
        created_by_teacher_id: currentUser.teacher_id,
        status: 'todo',
        created_at: new Date().toISOString()
      });
      
      setNewTask({
        title: '',
        description: '',
        assigned_to_group_id: '',
        due_date: '',
        priority: 'medium'
      });
      
      setShowCreateForm(false);
      loadData(currentUser);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await base44.entities.Task.update(taskId, { status });
      loadData(currentUser);
      toast.success('Task status updated!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await base44.entities.Task.delete(taskId);
      loadData(currentUser);
      toast.success('Task deleted!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed')
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TaskBoard">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-32 bg-white/20" />
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-24 rounded-xl bg-white/20" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="TaskBoard">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-blue-300" />
              Task Board
            </h1>
            <p className="text-blue-200 mt-1">Manage and assign tasks to your student groups</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur border border-white/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Task Title *</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Enter task title"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Enter task description"
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to_group_id" className="text-white">Assign To Group *</Label>
                      <Select 
                        value={newTask.assigned_to_group_id} 
                        onValueChange={(value) => setNewTask({...newTask, assigned_to_group_id: value})}
                        required
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.group_name || `Group ${group.id.substring(0, 8)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-white">Priority</Label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value) => setNewTask({...newTask, priority: value})}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-white">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      Create Task
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h2 className="font-semibold text-white">To Do ({groupedTasks.todo.length})</h2>
            </div>
            
            <div className="space-y-3">
              {groupedTasks.todo.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 border-l-4 border-l-gray-400 bg-white/10 backdrop-blur border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {groups.find(g => g.id === task.assigned_to_group_id)?.group_name || 'Group'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="text-xs border-white/30 text-white hover:bg-white/10"
                      >
                        Start
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteTask(task.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {groupedTasks.todo.length === 0 && (
                <Card className="p-8 text-center bg-white/10 backdrop-blur border border-white/20">
                  <ClipboardList className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No tasks to do</p>
                </Card>
              )}
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="font-semibold text-white">In Progress ({groupedTasks.in_progress.length})</h2>
            </div>
            
            <div className="space-y-3">
              {groupedTasks.in_progress.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 border-l-4 border-l-blue-500 bg-white/10 backdrop-blur border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {groups.find(g => g.id === task.assigned_to_group_id)?.group_name || 'Group'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="text-xs border-white/30 text-white hover:bg-white/10"
                      >
                        Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateTaskStatus(task.id, 'todo')}
                        className="text-xs border-white/30 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {groupedTasks.in_progress.length === 0 && (
                <Card className="p-8 text-center bg-white/10 backdrop-blur border border-white/20">
                  <Clock className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No tasks in progress</p>
                </Card>
              )}
            </div>
          </div>
          
          {/* Completed Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="font-semibold text-white">Completed ({groupedTasks.completed.length})</h2>
            </div>
            
            <div className="space-y-3">
              {groupedTasks.completed.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 border-l-4 border-l-green-500 bg-white/10 backdrop-blur border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-white line-through">{task.title}</h3>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {groups.find(g => g.id === task.assigned_to_group_id)?.group_name || 'Group'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateTaskStatus(task.id, 'todo')}
                        className="text-xs border-white/30 text-white hover:bg-white/10"
                      >
                        Reopen
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteTask(task.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {groupedTasks.completed.length === 0 && (
                <Card className="p-8 text-center bg-white/10 backdrop-blur border border-white/20">
                  <CheckCircle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No completed tasks</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  </PageBackground>
);
}