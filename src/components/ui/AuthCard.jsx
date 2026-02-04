import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function AuthCard({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-blue-100 mt-2 text-sm">{subtitle}</p>
            )}
          </div>
          <div className="p-8">
            {children}
          </div>
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          Thesis & Project Management Platform
        </p>
      </motion.div>
    </div>
  );
}