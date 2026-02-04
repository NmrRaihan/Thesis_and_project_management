import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { Mail, Users, MessageSquare } from 'lucide-react';

export default function TeacherMessages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
    if (groupId) {
      // Will be set after groups load
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async (user) => {
    setLoading(true);
    
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
    
    // Check URL params or select first group
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('group');
    if (groupId && groupsData.find(g => g.id === groupId)) {
      setSelectedGroup(groupsData.find(g => g.id === groupId));
    } else if (groupsData.length > 0) {
      setSelectedGroup(groupsData[0]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (selectedGroup) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  const loadMessages = async () => {
    if (!selectedGroup) return;
    
    const conversationId = `teacher_${selectedGroup.id}`;
    const msgs = await base44.entities.Message.filter({ 
      conversation_id: conversationId,
      conversation_type: 'teacher_student'
    }, 'created_date');
    setMessages(msgs);
  };

  const sendMessage = async (content, attachments) => {
    if (!selectedGroup) return;
    
    setSending(true);
    
    const conversationId = `teacher_${selectedGroup.id}`;
    await base44.entities.Message.create({
      conversation_id: conversationId,
      conversation_type: 'teacher_student',
      sender_id: currentUser.teacher_id,
      sender_type: 'teacher',
      sender_name: currentUser.full_name,
      content,
      attachments
    });
    
    await loadMessages();
    setSending(false);
  };

  const getGroupStudents = (group) => {
    if (!group?.member_ids) return [];
    return group.member_ids.map(id => students[id]).filter(Boolean);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherMessages">
          <div className="h-[calc(100vh-180px)] flex gap-6">
            <Skeleton className="w-80 rounded-2xl bg-white/20" />
            <Skeleton className="flex-1 rounded-2xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (groups.length === 0) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherMessages">
          <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
            <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
            <p className="text-blue-200">Accept student requests to start messaging.</p>
          </Card>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="TeacherMessages">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[calc(100vh-180px)] flex gap-6"
        >
          {/* Groups List */}
          <Card className="w-80 flex flex-col overflow-hidden shrink-0 bg-white/10 backdrop-blur border border-white/20">
            <div className="p-4 border-b border-white/20">
              <h2 className="font-semibold text-white">Conversations</h2>
            </div>
          <div className="flex-1 overflow-y-auto">
            {groups.map((group) => {
              const groupStudents = getGroupStudents(group);
              const isSelected = selectedGroup?.id === group.id;
              
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-white/10 transition-colors border-b border-white/20",
                    isSelected && "bg-blue-500/20 hover:bg-blue-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {groupStudents.slice(0, 2).map((student, idx) => (
                        <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={student?.profile_photo} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            {student?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {group.group_name || `Group ${group.id.slice(-4)}`}
                      </p>
                      <p className="text-xs text-blue-200 truncate">
                        {groupStudents.map(s => s?.full_name).join(', ')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-white/10 backdrop-blur border border-white/20">
          {selectedGroup ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/20 bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">
                      {selectedGroup.group_name || `Group ${selectedGroup.id.slice(-4)}`}
                    </h2>
                    <p className="text-sm text-blue-200">
                      {getGroupStudents(selectedGroup).length} students
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-white/5">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-blue-200">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_type === 'teacher'}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <ChatInput onSend={sendMessage} disabled={sending} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-200">Select a group to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </DashboardLayout>
  </PageBackground>
);
}