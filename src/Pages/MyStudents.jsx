import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  ClipboardList,
  Calendar,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function MyStudents() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState({});
  const [proposals, setProposals] = useState({});

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
    
    // Load supervised groups
    const groupsData = await base44.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id 
    });
    setGroups(groupsData);
    
    // Load all students
    const studentsData = await base44.entities.Student.list();
    const studentsMap = {};
    studentsData.forEach(s => {
      studentsMap[s.student_id] = s;
      studentsMap[s.id] = s;
    });
    setStudents(studentsMap);
    
    // Load proposals
    const proposalsData = await base44.entities.Proposal.list();
    const proposalsMap = {};
    proposalsData.forEach(p => proposalsMap[p.group_id] = p);
    setProposals(proposalsMap);
    
    setLoading(false);
  };

  const getGroupStudents = (group) => {
    if (!group?.member_ids) return [];
    return group.member_ids.map(id => students[id]).filter(Boolean);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="MyStudents">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1,2].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-white/20" />)}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="MyStudents">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Students</h1>
            <p className="text-blue-200 mt-1">
              {groups.length} supervised {groups.length === 1 ? 'group' : 'groups'}
            </p>
          </div>

        {groups.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
            <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Students Yet</h2>
            <p className="text-blue-200 mb-6">
              Accept supervision requests to start working with student groups.
            </p>
            <Link to={createPageUrl('TeacherRequests')}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
                View Requests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group, idx) => {
              const groupStudents = getGroupStudents(group);
              const proposal = proposals[group.id];
              
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className={
                          group.project_type === 'thesis' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        }>
                          {group.project_type === 'thesis' ? 'Thesis' : 'Project'}
                        </Badge>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">Active</Badge>
                    </div>

                    {/* Proposal Info */}
                    {proposal && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {proposal.title}
                        </h3>
                        <p className="text-blue-200 text-sm line-clamp-2">
                          {proposal.description}
                        </p>
                        {proposal.field && (
                          <Badge variant="secondary" className="mt-2 bg-white/10 text-white border border-white/20">
                            {proposal.field}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Students */}
                    <div className="mb-4">
                      <p className="text-xs text-blue-300 mb-2">Team Members</p>
                      <div className="space-y-2">
                        {groupStudents.map((student) => (
                          <div key={student.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={student.profile_photo} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {student.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{student.full_name}</p>
                              <p className="text-xs text-blue-200">{student.student_id}</p>
                            </div>
                            {student.is_group_admin && (
                              <Badge className="ml-auto text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30">Admin</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20">
                      <Link to={`${createPageUrl('TeacherMessages')}?group=${group.id}`}>
                        <Button variant="ghost" size="sm" className="w-full flex flex-col gap-1 h-auto py-2 text-white hover:bg-white/10">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Chat</span>
                        </Button>
                      </Link>
                      <Link to={`${createPageUrl('TaskBoard')}?group=${group.id}`}>
                        <Button variant="ghost" size="sm" className="w-full flex flex-col gap-1 h-auto py-2 text-white hover:bg-white/10">
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-xs">Tasks</span>
                        </Button>
                      </Link>
                      <Link to={`${createPageUrl('TeacherMeetings')}?group=${group.id}`}>
                        <Button variant="ghost" size="sm" className="w-full flex flex-col gap-1 h-auto py-2 text-white hover:bg-white/10">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Meet</span>
                        </Button>
                      </Link>
                      <Link to={`${createPageUrl('TeacherFiles')}?group=${group.id}`}>
                        <Button variant="ghost" size="sm" className="w-full flex flex-col gap-1 h-auto py-2 text-white hover:bg-white/10">
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-xs">Files</span>
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}