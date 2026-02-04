import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { format } from '@/utils';
import { 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Target
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function ProgressTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [progressData, setProgressData] = useState([]);

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
    
    const groupsData = await base44.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id 
    });
    setGroups(groupsData);
    
    if (groupsData.length > 0) {
      setSelectedGroup(groupsData[0].id);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (selectedGroup) {
      loadProgress();
    }
  }, [selectedGroup]);

  const loadProgress = async () => {
    const progress = await base44.entities.WeeklyProgress.filter({ 
      group_id: selectedGroup 
    }, '-week_number');
    setProgressData(progress);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="ProgressTracker">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <Skeleton className="h-64 rounded-xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="ProgressTracker">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Progress Tracker</h1>
              <p className="text-blue-200 mt-1">Monitor student weekly progress</p>
            </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white placeholder:text-blue-200">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/90 backdrop-blur-lg border-white/20 text-white">
              {groups.map(g => (
                <SelectItem key={g.id} value={g.id} className="hover:bg-white/10">
                  {g.group_name || `Group ${g.id.slice(-4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {groups.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
            <p className="text-blue-200">Accept student requests to track progress.</p>
          </Card>
        ) : progressData.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-white mb-2">No Progress Reports</h2>
            <p className="text-blue-200">Students haven't submitted any weekly reports yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Progress */}
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

            {/* Weekly Reports */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Weekly Reports</h3>
              {progressData.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="bg-blue-500/20 text-blue-300 mb-2 border border-blue-400/30">
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
                      <div className="mb-4">
                        <p className="text-blue-100">{report.summary}</p>
                      </div>
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
                        <h4 className="text-sm font-medium text-white mb-2">Your Feedback</h4>
                        <p className="text-sm text-blue-100 bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                          {report.teacher_feedback}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}