import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, FileText, Users, Clock, Eye } from 'lucide-react';
import { format } from '@/utils';

export default function RequestCard({ 
  request,
  students,
  proposal,
  onAccept,
  onReject,
  onViewProposal,
  isTeacher = false,
  delay = 0 
}) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[request.status]}>
              {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {request.status === 'accepted' && <Check className="w-3 h-3 mr-1" />}
              {request.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">
            {format(new Date(request.created_date), 'MMM d, yyyy')}
          </span>
        </div>

        {proposal && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 text-lg mb-1">{proposal.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{proposal.description}</p>
            <Badge variant="outline" className="mt-2">
              {proposal.project_type === 'thesis' ? 'Thesis' : 'Project'}
            </Badge>
          </div>
        )}

        {isTeacher && students && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> Group Members
            </p>
            <div className="flex -space-x-2">
              {students.map((student, idx) => (
                <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={student.profile_photo} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {student.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {students.map(s => s.full_name).join(', ')}
            </p>
          </div>
        )}

        {request.message && (
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-600 italic">"{request.message}"</p>
          </div>
        )}

        {request.teacher_response && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-blue-500 mb-1">Teacher Response:</p>
            <p className="text-sm text-slate-600">{request.teacher_response}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          {onViewProposal && (
            <Button
              variant="outline"
              onClick={() => onViewProposal(proposal)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Proposal
            </Button>
          )}
          
          {isTeacher && request.status === 'pending' && (
            <>
              <Button
                onClick={() => onAccept(request)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => onReject(request)}
                className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}