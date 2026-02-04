import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from '@/utils';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentTasks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    if (user.group_id) {
      const tasksData = await base44.entities.Task.filter({ 
        group_id: user.group_id 
      }, '-created_date');
      setTasks(tasksData);
    }
    
    setLoading(false);
  };

  const markComplete = async (task) => {
    await base44.entities.Task.update(task.id, { status: 'completed' });
    toast.success('Task marked as complete!');
    loadData(currentUser);
  };

  const markInProgress = async (task) => {
    await base44.entities.Task.update(task.id, { status: 'in_progress' });
    toast.success('Task started!');
    loadData(currentUser);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentTasks">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-white/20" />)}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!currentUser?.group_id) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentTasks">
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <ClipboardList className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Group Yet</h2>
            <p className="text-blue-200">Join a supervised group to see your tasks.</p>
          </Card>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="StudentTasks">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Tasks</h1>
            <p className="text-blue-200 mt-1">Tasks assigned by your supervisor. Complete them to track your progress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                <Clock className="w-5 h-5 text-blue-300" />
                <h3 className="font-semibold text-white">To Do</h3>
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white border border-white/30">{pendingTasks.length}</Badge>
              </div>
              {pendingTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                        'bg-green-500/20 text-green-300 border border-green-400/30'
                      }>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-blue-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-300" />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-white mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-blue-200 line-clamp-2">{task.description}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markInProgress(task)}
                      className="w-full mt-3 border-white/30 text-white hover:bg-white/10"
                    >
                      Start Task
                    </Button>
                  </Card>
                </motion.div>
              ))}
              {pendingTasks.length === 0 && (
                <Card className="p-6 text-center bg-white/10 backdrop-blur border-white/20">
                  <p className="text-blue-200">No pending tasks</p>
                </Card>
              )}
            </div>

            {/* In Progress */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-500/20 backdrop-blur rounded-xl border border-blue-400/30">
                <AlertCircle className="w-5 h-5 text-blue-300" />
                <h3 className="font-semibold text-white">In Progress</h3>
                <Badge className="ml-auto bg-blue-500/30 text-blue-200 border border-blue-400/50">{inProgressTasks.length}</Badge>
              </div>
              {inProgressTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 bg-white/10 backdrop-blur border-blue-400/30 hover:bg-white/15 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                        'bg-green-500/20 text-green-300 border border-green-400/30'
                      }>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-blue-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-300" />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-white mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-blue-200 line-clamp-2">{task.description}</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => markComplete(task)}
                      className="w-full mt-3 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  </Card>
                </motion.div>
              ))}
              {inProgressTasks.length === 0 && (
                <Card className="p-6 text-center bg-white/10 backdrop-blur border-white/20">
                  <p className="text-blue-200">No tasks in progress</p>
                </Card>
              )}
            </div>

            {/* Completed */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-500/20 backdrop-blur rounded-xl border border-green-400/30">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <h3 className="font-semibold text-white">Completed</h3>
                <Badge className="ml-auto bg-green-500/30 text-green-200 border border-green-400/50">{completedTasks.length}</Badge>
              </div>
              {completedTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 bg-green-500/20 border-green-400/30">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-green-500/30 text-green-200 border border-green-400/50">Done</Badge>
                    </div>
                    <h4 className="font-medium text-white mb-1 line-through opacity-70">{task.title}</h4>
                  </Card>
                </motion.div>
              ))}
              {completedTasks.length === 0 && (
                <Card className="p-6 text-center bg-white/10 backdrop-blur border-white/20">
                  <p className="text-blue-200">No completed tasks</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
      </PageBackground>
    );
}