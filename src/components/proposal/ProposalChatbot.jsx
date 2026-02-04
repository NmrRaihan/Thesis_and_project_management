import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProposalChatbot({ onSuggestion, floating = false, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you with your thesis proposal. What would you like assistance with?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = {
    'title': [
      'AI-Driven Predictive Analytics for Healthcare Decision Making',
      'Blockchain-Based Secure Voting System for Democratic Elections',
      'Machine Learning Approaches to Climate Change Prediction',
      'IoT-Based Smart City Infrastructure Management System',
      'Natural Language Processing for Automated Document Summarization'
    ],
    'description': `This research aims to develop and implement an innovative solution that addresses current challenges in the field. The proposed system will leverage cutting-edge technologies to improve efficiency, accuracy, and user experience.

Key objectives include:
1. Comprehensive analysis of existing approaches
2. Design and development of the proposed solution
3. Implementation and testing of the system
4. Evaluation of results and performance metrics
5. Documentation of findings and recommendations

The expected outcomes will contribute significantly to the advancement of knowledge in this domain and provide practical applications for real-world scenarios.`,
    'methodology': `The research will follow a systematic approach:

1. **Literature Review**: Comprehensive analysis of existing research and methodologies

2. **Requirements Analysis**: Identification of system requirements and constraints

3. **System Design**: Development of architectural design and technical specifications

4. **Implementation**: Coding and development of the proposed solution

5. **Testing & Validation**: Rigorous testing to ensure reliability and accuracy

6. **Evaluation**: Performance analysis and comparison with existing solutions

7. **Documentation**: Comprehensive documentation of the entire process`,
    'field': ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'IoT']
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      let suggestionData = null;

      if (userMessage.includes('title') || userMessage.includes('topic')) {
        response = 'Here are some title suggestions based on current trends:\n\n' + 
          suggestions.title.map((t, i) => `${i + 1}. ${t}`).join('\n');
        suggestionData = { type: 'titles', data: suggestions.title };
      } else if (userMessage.includes('description')) {
        response = 'Here\'s a sample description structure for your proposal:\n\n' + suggestions.description;
        suggestionData = { type: 'description', data: suggestions.description };
      } else if (userMessage.includes('methodology') || userMessage.includes('method')) {
        response = 'Here\'s a suggested methodology for your research:\n\n' + suggestions.methodology;
        suggestionData = { type: 'methodology', data: suggestions.methodology };
      } else if (userMessage.includes('field')) {
        response = 'Popular research fields:\n\n' + 
          suggestions.field.map((f, i) => `${i + 1}. ${f}`).join('\n');
        suggestionData = { type: 'fields', data: suggestions.field };
      } else {
        response = 'I can help you with:\n• Title suggestions\n• Description writing\n• Methodology planning\n• Field selection\n\nJust ask!';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (suggestionData && onSuggestion) {
        onSuggestion(suggestionData);
      }
      
      setLoading(false);
    }, 1000);
  };

  if (floating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-white rounded-2xl shadow-xl border w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">AI Assistant</h3>
                <p className="text-xs text-slate-500">Proposal helper</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask for help with your proposal..."
                className="resize-none rounded-xl"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI Proposal Assistant</h3>
            <p className="text-xs text-slate-500">Get instant suggestions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask for title suggestions, description help, methodology..."
            className="resize-none rounded-xl"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
