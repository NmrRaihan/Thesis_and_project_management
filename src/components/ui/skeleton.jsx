import React from 'react';
import { cn } from '@/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      {...props}
    />
  );
}
