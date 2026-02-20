import React from 'react';
import { format } from '@/utils';
import { cn } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download } from 'lucide-react';

export default function ChatBubble({ message, isOwn }) {
  const initials = message.sender_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn ? "flex-row-reverse" : ""
    )}>
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarImage src={message.sender_photo} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isOwn ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isOwn ? "flex-row-reverse" : ""
        )}>
          <span className="text-sm font-medium text-slate-700">{message.sender_name}</span>
          <span className="text-xs text-slate-400">
            {format(new Date(message.created_date), 'HH:mm')}
          </span>
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isOwn 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-md" 
            : "bg-white border border-slate-100 text-slate-700 rounded-tl-md"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {message.attachments?.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((file, idx) => {
                const isImage = file.type?.startsWith('image/');
                const isVideo = file.type?.startsWith('video/');
                
                if (isImage) {
                  return (
                    <div key={idx} className="overflow-hidden rounded-lg border border-slate-200 max-w-xs">
                      <img
                        src={file.content}
                        alt={file.name}
                        className="w-full h-auto max-h-60 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(file.content, '_blank')}
                      />
                      <div className="p-2 bg-slate-50 text-xs text-slate-600 flex justify-between items-center">
                        <span className="truncate flex-1 mr-2">{file.name}</span>
                        <Download className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  );
                } else if (isVideo) {
                  return (
                    <div key={idx} className="overflow-hidden rounded-lg border border-slate-200 max-w-xs">
                      <video
                        src={file.content}
                        controls
                        className="w-full h-auto max-h-60 object-contain"
                      />
                      <div className="p-2 bg-slate-50 text-xs text-slate-600 flex justify-between items-center">
                        <span className="truncate flex-1 mr-2">{file.name}</span>
                        <Download className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  );
                } else {
                  // For other file types, show as before
                  return (
                    <a
                      key={idx}
                      href={file.content}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-colors",
                        isOwn 
                          ? "bg-white/10 hover:bg-white/20" 
                          : "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-xs flex-1 truncate">{file.name}</span>
                      <Download className="w-3 h-3" />
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}