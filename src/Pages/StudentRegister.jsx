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
import { Loader2, Eye, EyeOff, ArrowRight, User, Mail, Lock, Building, IdCard, GraduationCap } from 'lucide-react';

export default function StudentRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    department: '',
    password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Check if student ID already exists
      const existing = await db.entities.Student.filter({ student_id: formData.student_id });
      if (existing.length > 0) {
        toast.error('Student ID already registered. Please use a different ID or login.');
        return;
      }

      // Check if email already exists
      const existingEmail = await db.entities.Student.filter({ email: formData.email });
      if (existingEmail.length > 0) {
        toast.error('Email already registered. Please use a different email.');
        return;
      }

      // Create student
      await db.entities.Student.create({
        student_id: formData.student_id,
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        password_hash: formData.password,
        profile_photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name)}`,
        status: 'active',
        is_group_admin: false
      });

      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate(createPageUrl('StudentLogin'));
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
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
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Student Registration
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200"
            >
              Create your account to get started
            </motion.p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-white font-medium">Student ID</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <Input
                    id="student_id"
                    placeholder="Enter your student ID"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white font-medium">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white font-medium">Department</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <Building className="w-5 h-5" />
                  </div>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-white font-medium">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/30 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-base font-medium shadow-lg shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </Button>
              </motion.div>

              <p className="text-center text-sm text-blue-200">
                Already have an account?{' '}
                <Link 
                  to={createPageUrl('StudentLogin')} 
                  className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </PageBackground>
  );
}