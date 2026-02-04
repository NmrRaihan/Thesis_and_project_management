import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { format } from '@/utils';
import { 
  Calendar, 
  Clock, 
  MapPin,
  Video,
  Check
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentMeetings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [meetings, setMeetings] = useState([]);

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
      const meetingsData = await base44.entities.Meeting.filter({ 
        group_id: user.group_id 
      }, '-scheduled_date');
      setMeetings(meetingsData);
    }
    
    setLoading(false);
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'completed');

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentMeetings">
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
        <DashboardLayout userType="student" currentPage="StudentMeetings">
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Group Yet</h2>
            <p className="text-blue-200">Join a supervised group to see meetings.</p>
          </Card>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="StudentMeetings">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Meetings</h1>
            <p className="text-blue-200 mt-1">Scheduled meetings with your supervisor</p>
          </div>

        {/* Upcoming */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Upcoming ({upcomingMeetings.length})
          </h2>
          
          {upcomingMeetings.length === 0 ? (
            <Card className="p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <p className="text-blue-200">No upcoming meetings</p>
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
                  <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                          {meeting.duration_minutes} min
                        </Badge>
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
                                className="flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        )}
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
              Past Meetings ({completedMeetings.length})
            </h2>
            <div className="space-y-4">
              {completedMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-4 bg-white/10 backdrop-blur-lg border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{meeting.title}</h3>
                      <p className="text-sm text-blue-200">
                        {format(new Date(meeting.scheduled_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">Completed</Badge>
                  </div>
                  {meeting.notes && (
                    <p className="mt-2 text-sm text-blue-100 bg-white/10 p-3 rounded-lg border border-white/20">
                      {meeting.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}