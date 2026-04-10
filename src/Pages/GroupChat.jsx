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
    
    console.log('🚀 GroupChat - Component mounted for user:', user.student_id);
    console.log('🚀 GroupChat - User group_id:', user.group_id);
    
    setCurrentUser(user);
    loadData(user);
    
    // Don't mark as read immediately - wait for messages to load first
    // Then mark them as seen after a short delay
    const markReadTimeout = setTimeout(() => {
      if (user.group_id && messages.length > 0) {
        const lastReadKey = `groupChat_lastRead_${user.group_id}`;
        const now = new Date().toISOString();
        
        console.log('✅ GroupChat - Marking messages as read');
        console.log('  - Group ID:', user.group_id);
        console.log('  - Messages count:', messages.length);
        console.log('  - Setting lastReadTime to:', now);
        console.log('  - User ID:', user.student_id);
        
        localStorage.setItem(lastReadKey, now);
        
        // Also mark all current messages as seen by this user
        markMessagesAsSeen(user.group_id, user.student_id);
      } else {
        console.log('⏸️ GroupChat - Not marking as read yet:', {
          hasGroupId: !!user.group_id,
          messagesLength: messages.length
        });
      }
    }, 1000); // Wait 1 second for messages to load
    
    // Poll for new messages
    const interval = setInterval(() => {
      loadMessages(user.group_id);
      // Update seen status while chat is open
      if (messages.length > 0) {
        markMessagesAsSeen(user.group_id, user.student_id);
      }
    }, 5000);
    
    return () => {
      clearTimeout(markReadTimeout);
      clearInterval(interval);
    };
  }, [messages.length]); // Re-run when messages change

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
    
    // Load group by group_id instead of id for consistency
    const groups = await base44.entities.StudentGroup.filter({ group_id: user.group_id });
    if (groups.length === 0) {
      // Try fallback to id
      const groupsById = await base44.entities.StudentGroup.filter({ id: user.group_id });
      if (groupsById.length > 0) {
        setGroup(groupsById[0]);
        
        // Load all students in this group
        const members = await base44.entities.Student.filter({ group_id: groupsById[0].id });
        setGroupMembers(members);
        
        await loadMessages(groupsById[0].id);
      }
    } else {
      setGroup(groups[0]);
      
      // Load all students in this group using group_id
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
    
    // Sort by date manually since filter doesn't support it
    msgs.sort((a, b) => new Date(a.created_date || a.created_at) - new Date(b.created_date || b.created_at));
    
    console.log('📨 GroupChat - Loaded messages:', msgs.length);
    
    setMessages(msgs);
  };

  const markMessagesAsSeen = async (groupId, userId) => {
    try {
      // Mark all messages in this group as seen by this user
      for (const msg of messages) {
        // Don't mark own messages
        if (msg.sender_id === userId) continue;
        
        const seenByKey = `message_seen_${msg.id}`;
        const seenData = JSON.parse(localStorage.getItem(seenByKey) || '{}');
        
        // Add this user to seen list if not already there
        if (!seenData[userId]) {
          seenData[userId] = {
            seenAt: new Date().toISOString(),
            userId: userId
          };
          localStorage.setItem(seenByKey, JSON.stringify(seenData));
        }
      }
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };

  // Get sender's profile photo from group members
  const getSenderPhoto = (senderId) => {
    const member = groupMembers.find(m => m.student_id === senderId);
    return member?.profile_photo || null;
  };

  const sendMessage = async (content, attachments) => {
    if (!group) return;
    
    console.log('📤 Sending message:', {
      content,
      attachmentCount: attachments?.length || 0,
      attachments: attachments?.map(a => ({
        name: a.name,
        type: a.type,
        size: a.size,
        hasContent: !!a.content
      }))
    });
    
    setSending(true);
    
    try {
      const messageData = {
        conversation_id: group.id,
        conversation_type: 'group_chat',
        sender_id: currentUser.student_id,
        sender_type: 'student',
        sender_name: currentUser.full_name,
        content,
        attachments: attachments || []
      };
      
      console.log('💾 Creating message in database:', messageData);
      
      await base44.entities.Message.create(messageData);
      
      console.log('✅ Message created successfully');
      
      // Notify other components that a message was sent
      window.dispatchEvent(new CustomEvent('messageSent'));
      console.log('📢 Dispatched messageSent event');
      
      await loadMessages(group.id);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message. File might be too large.');
    } finally {
      setSending(false);
    }
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
              <button
                onClick={() => navigate(createPageUrl('StudentDashboard'))}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                Go to Dashboard
              </button>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="GroupChat">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-180px)] flex flex-col"
          >
            <Card className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-white/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{group.group_name || 'Group Chat'}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-sm text-blue-200">{groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''} online</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex -space-x-3">
                  {groupMembers.slice(0, 5).map((member, idx) => {
                    const initials = member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                    return (
                      <Avatar 
                        key={member.id} 
                        className="w-10 h-10 border-2 border-white/40 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title={member.full_name}
                      >
                        <AvatarImage src={member.profile_photo} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {groupMembers.length > 5 && (
                    <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center text-xs text-white font-bold">
                      +{groupMembers.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="px-5 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-400/20 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-blue-300" />
              </div>
              <p className="text-sm text-blue-200">
                This chat is for <strong>group discussions</strong> only. Use Messages to communicate with your supervisor.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 relative" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)'
            }}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-white/20 backdrop-blur-xl shadow-2xl">
                      <MessageSquare className="w-14 h-14 text-blue-300" />
                    </div>
                    <p className="text-white text-xl font-bold mb-2">Welcome to Group Chat! 👋</p>
                    <p className="text-blue-200/80 text-sm">Start the conversation with your group members</p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-blue-300/60">
                      <span>💬 Send messages</span>
                      <span>•</span>
                      <span>🖼️ Share images</span>
                      <span>•</span>
                      <span>📎 Upload files</span>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <ChatBubble
                          message={{
                            ...msg,
                            sender_photo: getSenderPhoto(msg.sender_id)
                          }}
                          isOwn={msg.sender_id === currentUser.student_id}
                          groupMembers={groupMembers}
                          currentUser={currentUser}
                        />
                      </motion.div>
                    ))}
                  </div>
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