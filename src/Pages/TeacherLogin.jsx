import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthCard from '@/components/ui/AuthCard';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, ArrowRight, User, Lock, GraduationCap } from 'lucide-react';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const teachers = await db.entities.Teacher.filter({ 
        teacher_id: formData.teacher_id 
      });
      
      if (teachers.length === 0) {
        toast.error('Teacher ID not found. Please check your ID or register first.');
        setLoading(false);
        return;
      }

      const teacher = teachers[0];
      
      if (teacher.password_hash !== formData.password) {
        toast.error('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(teacher));
      localStorage.setItem('userType', 'teacher');
      
      toast.success('Welcome back!');
      setTimeout(() => {
        navigate(createPageUrl('TeacherDashboard'));
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Teacher Login
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200"
            >
              Welcome back! Sign in to continue
            </motion.p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teacher_id" className="text-white font-medium">Teacher ID</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="teacher_id"
                    placeholder="Enter your teacher ID"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-base font-medium shadow-lg shadow-purple-500/30 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </Button>
              </motion.div>

              <p className="text-center text-sm text-blue-200">
                Don't have an account?{' '}
                <Link 
                  to={createPageUrl('TeacherRegister')} 
                  className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </PageBackground>
  );
}