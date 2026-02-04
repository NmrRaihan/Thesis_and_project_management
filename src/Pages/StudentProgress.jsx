import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, addDays } from '@/utils';
import { 
  TrendingUp, 
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Target,
  Loader2
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({
    summary: '',
    accomplishments: '',
    challenges: '',
    next_week_goals: '',
    progress_percentage: 0
  });

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
      const progress = await base44.entities.WeeklyProgress.filter({ 
        group_id: user.group_id 
      }, '-week_number');
      setProgressData(progress);
    }
    
    setLoading(false);
  };

  const submitProgress = async () => {
    if (!newProgress.summary) {
      toast.error('Please enter a summary');
      return;
    }
    
    setSaving(true);
    
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekNumber = progressData.length + 1;
    
    await base44.entities.WeeklyProgress.create({
      group_id: currentUser.group_id,
      week_number: weekNumber,
      start_date: format(weekStart, 'yyyy-MM-dd'),
      end_date: format(weekEnd, 'yyyy-MM-dd'),
      summary: newProgress.summary,
      accomplishments: newProgress.accomplishments.split('\n').filter(a => a.trim()),
      challenges: newProgress.challenges,
      next_week_goals: newProgress.next_week_goals,
      progress_percentage: parseInt(newProgress.progress_percentage)
    });
    
    setShowAddProgress(false);
    setNewProgress({
      summary: '',
      accomplishments: '',
      challenges: '',
      next_week_goals: '',
      progress_percentage: 0
    });
    setSaving(false);
    toast.success('Progress report submitted!');
    loadData(currentUser);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentProgress">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <Skeleton className="h-64 rounded-xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!currentUser?.group_id) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentProgress">
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Group Yet</h2>
            <p className="text-blue-200">Join a supervised group to track progress.</p>
          </Card>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="StudentProgress">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Weekly Progress</h1>
              <p className="text-blue-200 mt-1">Track and report your weekly progress</p>
            </div>
            <Button 
              onClick={() => setShowAddProgress(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </div>

        {/* Overall Progress */}
        {progressData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <h3 className="font-semibold text-white mb-4">Overall Progress</h3>
              <div className="flex items-center gap-4">
                <Progress 
                  value={progressData[0]?.progress_percentage || 0} 
                  className="flex-1 h-3"
                />
                <span className="text-2xl font-bold text-white">
                  {progressData[0]?.progress_percentage || 0}%
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {progressData.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-white mb-2">No Progress Reports</h2>
            <p className="text-blue-200 mb-4">Submit your first weekly progress report.</p>
            <Button onClick={() => setShowAddProgress(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
              <Plus className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {progressData.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                        Week {report.week_number}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-blue-200">
                        <Calendar className="w-4 h-4 text-blue-300" />
                        {report.start_date && format(new Date(report.start_date), 'MMM d')} - 
                        {report.end_date && format(new Date(report.end_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={report.progress_percentage || 0} className="w-24 h-2" />
                      <span className="text-sm font-medium text-white">{report.progress_percentage || 0}%</span>
                    </div>
                  </div>

                  {report.summary && (
                    <p className="text-blue-100 mb-4">{report.summary}</p>
                  )}

                  {report.accomplishments?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Accomplishments
                      </h4>
                      <ul className="space-y-1">
                        {report.accomplishments.map((item, i) => (
                          <li key={i} className="text-sm text-blue-100 flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.challenges && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Challenges
                      </h4>
                      <p className="text-sm text-blue-100">{report.challenges}</p>
                    </div>
                  )}

                  {report.next_week_goals && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        Next Week Goals
                      </h4>
                      <p className="text-sm text-blue-100">{report.next_week_goals}</p>
                    </div>
                  )}

                  {report.teacher_feedback && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <h4 className="text-sm font-medium text-white mb-2">Supervisor Feedback</h4>
                      <p className="text-sm text-blue-100 bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        {report.teacher_feedback}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Progress Dialog */}
        <Dialog open={showAddProgress} onOpenChange={setShowAddProgress}>
          <DialogContent className="max-w-lg bg-white/10 backdrop-blur border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Submit Weekly Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Summary *</Label>
                <Textarea
                  value={newProgress.summary}
                  onChange={(e) => setNewProgress({ ...newProgress, summary: e.target.value })}
                  placeholder="Brief summary of this week's progress..."
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Accomplishments (one per line)</Label>
                <Textarea
                  value={newProgress.accomplishments}
                  onChange={(e) => setNewProgress({ ...newProgress, accomplishments: e.target.value })}
                  placeholder="Completed literature review&#10;Implemented feature X&#10;Fixed bugs..."
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Challenges</Label>
                <Textarea
                  value={newProgress.challenges}
                  onChange={(e) => setNewProgress({ ...newProgress, challenges: e.target.value })}
                  placeholder="Any difficulties or blockers..."
                  rows={2}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Next Week Goals</Label>
                <Textarea
                  value={newProgress.next_week_goals}
                  onChange={(e) => setNewProgress({ ...newProgress, next_week_goals: e.target.value })}
                  placeholder="What you plan to accomplish next week..."
                  rows={2}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Overall Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress.progress_percentage}
                  onChange={(e) => setNewProgress({ ...newProgress, progress_percentage: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProgress(false)} className="border-white/30 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={submitProgress} disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}