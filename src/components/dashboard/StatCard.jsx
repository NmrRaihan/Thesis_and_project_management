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
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "bg-white/10 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl hover:border-white/30 hover:scale-105 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-lg shadow-md", iconBg)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-white tracking-tight truncate">{value}</p>
          <p className="text-blue-200 text-xs font-medium mt-0.5 truncate">{label}</p>
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-md",
            trendUp ? "bg-green-500/20 text-green-300 border border-green-400/30" : "bg-red-500/20 text-red-300 border border-red-400/30"
          )}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}