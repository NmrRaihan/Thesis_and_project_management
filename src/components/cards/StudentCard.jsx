import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserMinus, Check, Clock } from 'lucide-react';

export default function StudentCard({ 
  student, 
  onInvite, 
  onRemove,
  isInvited,
  isPending,
  isMember,
  showRemove,
  delay = 0 
}) {
  const initials = student.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'S';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-5 hover:shadow-md transition-all duration-300 border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-white shadow">
            <AvatarImage src={student.profile_photo} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900">{student.full_name}</h3>
            <p className="text-sm text-slate-500">ID: {student.student_id}</p>
            {student.department && (
              <Badge variant="secondary" className="mt-1 text-xs bg-slate-100">
                {student.department}
              </Badge>
            )}
          </div>
          
          {showRemove && onRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(student)}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <UserMinus className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
          
          {!isMember && !showRemove && (
            <>
              {isPending ? (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              ) : isInvited ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Check className="w-3 h-3 mr-1" />
                  Invited
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onInvite(student)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}