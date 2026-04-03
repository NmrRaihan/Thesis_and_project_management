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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from '@/utils';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin,
  Link as LinkIcon,
  Video,
  Loader2,
  Check,
  X
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function TeacherMeetings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [meetings, setMeetings] = useState([]);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    group_id: '',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    location: '',
    meeting_link: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate(createPageUrl('TeacherLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
    
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('group');
    if (groupId) setSelectedGroup(groupId);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    const groupsData = await base44.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id 
    });
    setGroups(groupsData);
    
    const meetingsData = await base44.entities.Meeting.filter({ 
      teacher_id: user.teacher_id 
    }, '-scheduled_date');
    setMeetings(meetingsData);
    
    setLoading(false);
  };

  const createMeeting = async () => {
    if (!newMeeting.title || !newMeeting.group_id || !newMeeting.scheduled_date) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setSaving(true);
    
    const scheduledDateTime = `${newMeeting.scheduled_date}T${newMeeting.scheduled_time || '09:00'}:00`;
    
    await base44.entities.Meeting.create({
      group_id: newMeeting.group_id,
      teacher_id: currentUser.teacher_id,
      title: newMeeting.title,
      description: newMeeting.description,
      scheduled_date: scheduledDateTime,
      duration_minutes: parseInt(newMeeting.duration_minutes),
      location: newMeeting.location,
      meeting_link: newMeeting.meeting_link,
      status: 'scheduled'
    });
    
    setShowAddMeeting(false);
    setNewMeeting({
      group_id: '',
      title: '',
      description: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      location: '',
      meeting_link: ''
    });
    setSaving(false);
    toast.success('Meeting scheduled!');
    loadData(currentUser);
  };

  const updateMeetingStatus = async (meeting, status) => {
    await base44.entities.Meeting.update(meeting.id, { status });
    toast.success('Meeting updated!');
    loadData(currentUser);
  };

  const filteredMeetings = selectedGroup === 'all' 
    ? meetings 
    : meetings.filter(m => m.group_id === selectedGroup);

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'scheduled');
  const completedMeetings = filteredMeetings.filter(m => m.status === 'completed');

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.group_name || `Group ${groupId?.slice(-4)}`;
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherMeetings">
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
      <DashboardLayout userType="teacher" currentPage="TeacherMeetings">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Meetings</h1>
              <p className="text-blue-200 mt-1">Schedule and manage meetings</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-lg border-white/20 text-white">
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id} className="hover:bg-white/10">
                      {g.group_name || `Group ${g.id.slice(-4)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setShowAddMeeting(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
  
          {groups.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
              <p className="text-blue-200">Accept student requests to start scheduling meetings.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Upcoming */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Upcoming Meetings ({upcomingMeetings.length})
                </h2>
                  
                {upcomingMeetings.length === 0 ? (
                  <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                    <p className="text-blue-200">No upcoming meetings scheduled</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting, idx) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="p-6 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                  {getGroupName(meeting.group_id)}
                                </Badge>
                                <Badge variant="outline" className="border-white/30 text-white">
                                  {meeting.duration_minutes} min
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                              {meeting.description && (
                                <p className="text-blue-200 text-sm mt-1">{meeting.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-3 text-sm text-blue-200">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-blue-300" />
                                  {format(new Date(meeting.scheduled_date), 'EEEE, MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-blue-300" />
                                  {format(new Date(meeting.scheduled_date), 'h:mm a')}
                                </span>
                              </div>
                              {(meeting.location || meeting.meeting_link) && (
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  {meeting.location && (
                                    <span className="flex items-center gap-1 text-blue-200">
                                      <MapPin className="w-4 h-4 text-blue-300" />
                                      {meeting.location}
                                    </span>
                                  )}
                                  {meeting.meeting_link && (
                                    <a 
                                      href={meeting.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-blue-300 hover:text-blue-200"
                                    >
                                      <Video className="w-4 h-4" />
                                      Join Meeting
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateMeetingStatus(meeting, 'completed')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMeetingStatus(meeting, 'cancelled')}
                                className="text-red-400 border-red-400/30 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
  
              {/* Completed */}
              {completedMeetings.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Completed Meetings ({completedMeetings.length})
                  </h2>
                  <div className="space-y-4">
                    {completedMeetings.map((meeting) => (
                      <Card key={meeting.id} className="p-4 bg-green-500/20 border-green-400/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-white">{meeting.title}</h3>
                            <p className="text-sm text-green-200">
                              {format(new Date(meeting.scheduled_date), 'MMM d, yyyy')} • {getGroupName(meeting.group_id)}
                            </p>
                          </div>
                          <Badge className="bg-green-500/30 text-green-200 border border-green-400/50">Completed</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
  
          {/* Add Meeting Dialog */}
          <Dialog open={showAddMeeting} onOpenChange={setShowAddMeeting}>
            <DialogContent className="max-w-md bg-white/10 backdrop-blur border border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Group *</Label>
                  <Select 
                    value={newMeeting.group_id} 
                    onValueChange={(v) => setNewMeeting({ ...newMeeting, group_id: v })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                <div className="space-y-2">
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="Meeting title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    placeholder="Meeting agenda..."
                    rows={2}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Date *</Label>
                    <Input
                      type="date"
                      value={newMeeting.scheduled_date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_date: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Time</Label>
                    <Input
                      type="time"
                      value={newMeeting.scheduled_time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_time: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Duration (min)</Label>
                    <Input
                      type="number"
                      value={newMeeting.duration_minutes}
                      onChange={(e) => setNewMeeting({ ...newMeeting, duration_minutes: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Location</Label>
                    <Input
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                      placeholder="Room 101"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Meeting Link</Label>
                  <Input
                    value={newMeeting.meeting_link}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMeeting(false)} className="border-white/30 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button onClick={createMeeting} disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
      </PageBackground>
    );
}