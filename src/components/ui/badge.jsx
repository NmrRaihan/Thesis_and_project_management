import React from 'react';
import { cn } from '@/utils';

export const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-blue-600 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-300 text-slate-900",
    destructive: "bg-red-600 text-white",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';
