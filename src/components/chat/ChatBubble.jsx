import React from 'react';
import { format } from '@/utils';
import { cn } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, Image, Play, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatBubble({ message, isOwn, groupMembers = [], currentUser }) {
  const initials = message.sender_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Check who has seen this message
  const getSeenStatus = () => {
    if (!isOwn || !groupMembers.length) return null;
    
    const seenByKey = `message_seen_${message.id}`;
    const seenData = JSON.parse(localStorage.getItem(seenByKey) || '{}');
    
    // Count how many members have seen it (excluding sender)
    const seenCount = Object.keys(seenData).length;
    const totalMembers = groupMembers.length - 1; // Exclude sender
    
    return {
      seenCount,
      totalMembers,
      allSeen: seenCount >= totalMembers
    };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4 group",
        isOwn ? "flex-row-reverse" : ""
      )}
    >
      <Avatar className="w-10 h-10 shrink-0 border-2 border-white/30 shadow-lg group-hover:scale-110 transition-transform">
        <AvatarImage src={message.sender_photo} />
        <AvatarFallback className={cn(
          "text-sm font-bold",
          isOwn ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
        <div className={cn(
          "flex items-center gap-2 mb-1.5 px-1",
          isOwn ? "flex-row-reverse" : ""
        )}>
          <span className="text-sm font-semibold text-white drop-shadow">{message.sender_name}</span>
          <span className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur">
            {format(new Date(message.created_date), 'HH:mm')}
          </span>
          
          {/* Seen status for own messages */}
          {isOwn && (
            <div className="flex items-center gap-1">
              {(() => {
                const seenStatus = getSeenStatus();
                if (!seenStatus) return null;
                
                if (seenStatus.allSeen) {
                  return (
                    <div className="flex items-center gap-0.5" title="Seen by all members">
                      <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      <span className="text-[10px] text-blue-300">Seen</span>
                    </div>
                  );
                } else if (seenStatus.seenCount > 0) {
                  return (
                    <div className="flex items-center gap-0.5" title={`Seen by ${seenStatus.seenCount} of ${seenStatus.totalMembers}`}>
                      <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] text-gray-400">{seenStatus.seenCount}/{seenStatus.totalMembers}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-0.5" title="Sent">
                      <Check className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
        
        <div className={cn(
          "rounded-2xl px-5 py-3.5 shadow-xl backdrop-blur-xl border transition-all hover:shadow-2xl",
          isOwn 
            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-md border-white/20" 
            : "bg-white/15 text-white rounded-tl-md border-white/30"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {message.attachments?.length > 0 && (
            <div className="mt-4 space-y-3">
              {message.attachments.map((file, idx) => {
                const isImage = file.type?.startsWith('image/');
                const isVideo = file.type?.startsWith('video/');
                const isPDF = file.type === 'application/pdf';
                
                if (isImage) {
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="overflow-hidden rounded-xl border-2 border-white/30 shadow-lg cursor-pointer group/img"
                    >
                      <div className="relative">
                        <img
                          src={file.content}
                          alt={file.name}
                          className="w-full h-auto max-h-72 object-cover transition-transform group-hover/img:scale-105"
                          onClick={() => window.open(file.content, '_blank')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end">
                          <div className="p-3 w-full">
                            <div className="flex items-center justify-between text-white">
                              <span className="text-xs font-medium truncate flex-1 mr-2">{file.name}</span>
                              <span className="text-xs opacity-80">{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  );
                } else if (isVideo) {
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="overflow-hidden rounded-xl border-2 border-white/30 shadow-lg"
                    >
                      <video
                        src={file.content}
                        controls
                        className="w-full h-auto max-h-72 object-cover rounded-xl"
                      />
                      <div className="p-2.5 bg-white/10 backdrop-blur flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Play className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          <span className="text-xs text-white truncate flex-1">{file.name}</span>
                        </div>
                        <span className="text-xs text-white/70 flex-shrink-0">{formatFileSize(file.size)}</span>
                      </div>
                    </motion.div>
                  );
                } else {
                  // For other file types, show beautiful file card
                  return (
                    <motion.a
                      key={idx}
                      href={file.content}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, x: isOwn ? -4 : 4 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all group/file",
                        isOwn 
                          ? "bg-white/15 border-white/30 hover:bg-white/25" 
                          : "bg-white/10 border-white/20 hover:bg-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border",
                        isPDF 
                          ? "bg-red-500/20 border-red-400/40" 
                          : "bg-blue-500/20 border-blue-400/40"
                      )}>
                        <FileText className={cn(
                          "w-6 h-6",
                          isPDF ? "text-red-300" : "text-blue-300"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-white/60 mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                      <Download className="w-4 h-4 text-white/70 group-hover/file:text-white transition-colors" />
                    </motion.a>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}