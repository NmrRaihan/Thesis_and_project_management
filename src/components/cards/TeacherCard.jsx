import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookOpen, Star, Send } from 'lucide-react';

export default function TeacherCard({ 
  teacher, 
  relevanceScore, 
  onRequestSupervision,
  requestSent,
  delay = 0 
}) {
  const initials = teacher.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'T';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-slate-100 hover:border-blue-200">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-white shadow-md">
            <AvatarImage src={teacher.profile_photo} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{teacher.full_name}</h3>
                <p className="text-sm text-slate-500">{teacher.department}</p>
              </div>
              {relevanceScore && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-full">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">{relevanceScore}%</span>
                </div>
              )}
            </div>
            
            <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
              {teacher.research_field}
            </Badge>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{teacher.publications?.length || 0} Publications</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{teacher.current_students_count}/{teacher.max_students} Students</span>
              </div>
            </div>
            
            {teacher.accepted_topics?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">Interested Topics:</p>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.accepted_topics.slice(0, 4).map((topic, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs bg-slate-50"
                    >
                      {topic}
                    </Badge>
                  ))}
                  {teacher.accepted_topics.length > 4 && (
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      +{teacher.accepted_topics.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button
            onClick={() => onRequestSupervision(teacher)}
            disabled={requestSent || teacher.current_students_count >= teacher.max_students}
            className={`w-full rounded-xl ${
              requestSent 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            {requestSent ? 'Request Sent' : 'Request Supervision'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}