import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Loader2, Image, FileText, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploaded = [];

    try {
      for (const file of files) {
        // Check file size (max 5MB for localStorage)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
          continue;
        }
        
        // Convert file to base64 for storage in localStorage
        const fileContent = await readFileAsBase64(file);
        uploaded.push({
          name: file.name,
          content: fileContent,
          type: file.type,
          size: file.size
        });
      }

      if (uploaded.length > 0) {
        setAttachments(prev => [...prev, ...uploaded]);
      }
    } catch (error) {
      console.error('Error reading files:', error);
      alert('Failed to read files. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    console.log('Sending message with attachments:', {
      message: message.trim(),
      attachmentCount: attachments.length,
      attachments: attachments.map(a => ({ name: a.name, type: a.type }))
    });
    
    onSend(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type?.startsWith('video/')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileTypeColor = (type) => {
    if (type?.startsWith('image/')) return 'from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200';
    if (type?.startsWith('video/')) return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200';
    if (type?.startsWith('application/pdf')) return 'from-red-500/20 to-orange-500/20 border-red-400/30 text-red-200';
    return 'from-slate-500/20 to-gray-500/20 border-slate-400/30 text-slate-200';
  };

  return (
    <div className="border-t border-white/20 bg-gradient-to-t from-white/10 to-white/5 backdrop-blur-xl p-4">
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-300 font-medium">
                📎 {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
              </span>
              <button
                onClick={() => setAttachments([])}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              <AnimatePresence>
                {attachments.map((file, idx) => {
                  const isImage = file.type?.startsWith('image/');
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`flex items-center gap-2 bg-gradient-to-r ${getFileTypeColor(file.type)} border px-3 py-2 rounded-lg text-sm backdrop-blur`}
                    >
                      {isImage ? (
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-white/20">
                          <img 
                            src={file.content} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 max-w-[120px]">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] opacity-70">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="hover:bg-white/20 rounded-full p-1 transition-all hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-end gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          className="hidden"
        />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || disabled}
            className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 transition-all"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>
        </motion.div>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none bg-white/10 border-white/20 text-white placeholder:text-blue-300/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all pr-12"
            rows={1}
          />
          {message.length > 0 && (
            <div className="absolute right-3 bottom-2 text-[10px] text-blue-300/50">
              {message.length} chars
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || disabled}
            className="shrink-0 h-11 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}