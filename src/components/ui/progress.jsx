import React from 'react';
import { cn } from '@/utils';

export const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-100",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));

Progress.displayName = 'Progress';
