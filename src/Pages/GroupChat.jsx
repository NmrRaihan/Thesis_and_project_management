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
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MessageSquare, Users, Info } from 'lucide-react';

export default function GroupChat() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
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
    
    // Poll for new messages
    const interval = setInterval(() => loadMessages(user.group_id), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async (user) => {
    setLoading(true);
    
    if (!user.group_id) {
      setLoading(false);
      return;
    }
    
    const groups = await base44.entities.StudentGroup.filter({ id: user.group_id });
    if (groups.length > 0) {
      setGroup(groups[0]);
      
      const members = await base44.entities.Student.filter({ group_id: groups[0].id });
      setGroupMembers(members);
      
      await loadMessages(groups[0].id);
    }
    
    setLoading(false);
  };

  const loadMessages = async (groupId) => {
    if (!groupId) return;
    
    const msgs = await base44.entities.Message.filter({ 
      conversation_id: groupId,
      conversation_type: 'group_chat'
    }, 'created_date');
    setMessages(msgs);
  };

  const sendMessage = async (content, attachments) => {
    if (!group) return;
    
    setSending(true);
    
    await base44.entities.Message.create({
      conversation_id: group.id,
      conversation_type: 'group_chat',
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
        <DashboardLayout userType="student" currentPage="GroupChat">
          <div className="max-w-4xl mx-auto h-[calc(100vh-180px)]">
            <Skeleton className="h-full rounded-2xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!group) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="GroupChat">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
              <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Group Yet</h2>
              <p className="text-blue-200 mb-6">
                You need to create or join a group before you can use group chat.
              </p>
              <a 
                href={createPageUrl('SelectPartners')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                Select Partners
              </a>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="GroupChat">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-180px)] flex flex-col"
          >
            <Card className="flex-1 flex flex-col overflow-hidden bg-white/10 backdrop-blur border border-white/20">
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Group Chat</h2>
                    <p className="text-sm text-blue-200">{groupMembers.length} members</p>
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  {groupMembers.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="w-8 h-8 border-2 border-white/30">
                      <AvatarImage src={member.profile_photo} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {member.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="px-4 py-2 bg-blue-500/20 border-b border-blue-400/30 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-300" />
              <p className="text-sm text-blue-200">
                This chat is for group discussions only. Use Messages to communicate with your supervisor.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-200">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender_id === currentUser.student_id}
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