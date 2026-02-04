import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Mail, UserCheck, Info } from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function StudentMessages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
    
    const interval = setInterval(() => {
      if (user.group_id) loadMessages(user.group_id);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async (user) => {
    setLoading(true);
    
    if (!user.group_id) {
      setLoading(false);
      return;
    }
    
    const groups = await base44.entities.StudentGroup.filter({ id: user.group_id });
    if (groups.length > 0) {
      setGroup(groups[0]);
      
      // Check if group has an assigned teacher
      if (groups[0].assigned_teacher_id) {
        const teachers = await base44.entities.Teacher.filter({ 
          teacher_id: groups[0].assigned_teacher_id 
        });
        if (teachers.length > 0) {
          setTeacher(teachers[0]);
        }
      }
      
      await loadMessages(groups[0].id);
    }
    
    setLoading(false);
  };

  const loadMessages = async (groupId) => {
    const conversationId = `teacher_${groupId}`;
    const msgs = await base44.entities.Message.filter({ 
      conversation_id: conversationId,
      conversation_type: 'teacher_student'
    }, 'created_date');
    setMessages(msgs);
  };

  const sendMessage = async (content, attachments) => {
    if (!group || !teacher) return;
    
    setSending(true);
    
    const conversationId = `teacher_${group.id}`;
    await base44.entities.Message.create({
      conversation_id: conversationId,
      conversation_type: 'teacher_student',
      sender_id: currentUser.student_id,
      sender_type: 'student',
      sender_name: currentUser.full_name,
      content,
      attachments
    });
    
    await loadMessages(group.id);
    setSending(false);
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentMessages">
          <div className="max-w-4xl mx-auto h-[calc(100vh-180px)]">
            <Skeleton className="h-full rounded-2xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!teacher) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="StudentMessages">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <UserCheck className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Supervisor Yet</h2>
              <p className="text-blue-200 mb-6">
                You can message your supervisor once they accept your request.
              </p>
              <a 
                href={createPageUrl('SuggestedTeachers')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-500 hover:to-indigo-500 transition-colors"
              >
                Find Supervisors
              </a>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="StudentMessages">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-180px)] flex flex-col"
          >
            <Card className="flex-1 flex flex-col overflow-hidden bg-white/10 backdrop-blur-lg border-white/20">
              {/* Header */}
              <div className="p-4 border-b border-white/20 bg-white/10">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-white/30 shadow">
                    <AvatarImage src={teacher.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg">
                      {teacher.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-white">{teacher.full_name}</h2>
                    <p className="text-sm text-blue-200">Your Supervisor • {teacher.research_field}</p>
                  </div>
                </div>
              </div>

            {/* Info Banner */}
            <div className="px-4 py-2 bg-green-500/20 border-b border-green-400/30 flex items-center gap-2">
              <Info className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-200">
                This is your direct communication channel with your supervisor.
              </p>
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
                      isOwn={msg.sender_type === 'student'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <ChatInput onSend={sendMessage} disabled={sending} />
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
    </PageBackground>
  );
}