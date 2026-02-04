import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp,
  className,
  iconBg = "bg-blue-500",
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={cn(
            "text-sm font-medium px-2.5 py-1 rounded-full",
            trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-slate-500 text-sm mt-1">{label}</p>
      </div>
    </motion.div>
  );
}