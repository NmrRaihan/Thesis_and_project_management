import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AuthCard from '@/components/ui/AuthCard';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, ArrowRight, User, Plus, X, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [formData, setFormData] = useState({
    teacher_id: '',
    full_name: '',
    email: '',
    department: '',
    research_field: '',
    accepted_topics: [],
    max_students: 10,
    password: '',
    confirm_password: ''
  });

  const addTopic = () => {
    if (newTopic.trim() && !formData.accepted_topics.includes(newTopic.trim())) {
      setFormData({
        ...formData,
        accepted_topics: [...formData.accepted_topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const removeTopic = (topic) => {
    setFormData({
      ...formData,
      accepted_topics: formData.accepted_topics.filter(t => t !== topic)
    });
  };

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
      const existing = await db.entities.Teacher.filter({ teacher_id: formData.teacher_id });
      if (existing.length > 0) {
        toast.error('Teacher ID already registered. Please use a different ID or login.');
        return;
      }

      // Check if email already exists
      if (formData.email) {
        const existingEmail = await db.entities.Teacher.filter({ email: formData.email });
        if (existingEmail.length > 0) {
          toast.error('Email already registered. Please use a different email.');
          return;
        }
      }

      await db.entities.Teacher.create({
        teacher_id: formData.teacher_id,
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        research_field: formData.research_field,
        accepted_topics: formData.accepted_topics,
        max_students: parseInt(formData.max_students),
        password_hash: formData.password,
        profile_photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name)}`,
        publications: [],
        current_students_count: 0,
        status: 'active'
      });

      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate(createPageUrl('TeacherLogin'));
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
          className="w-full max-w-2xl"
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
              Teacher Registration
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200"
            >
              Create your supervisor account
            </motion.p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white font-medium">Full Name</Label>
            <Input
              id="full_name"
              placeholder="Your name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-white font-medium">Department</Label>
            <Input
              id="department"
              placeholder="e.g., CS"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="research_field" className="text-white font-medium">Research Field</Label>
            <Input
              id="research_field"
              placeholder="e.g., AI, ML"
              value={formData.research_field}
              onChange={(e) => setFormData({ ...formData, research_field: e.target.value })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white font-medium">Interested Topics</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
            />
            <Button type="button" onClick={addTopic} className="h-12 px-4 rounded-xl bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.accepted_topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.accepted_topics.map((topic, idx) => (
                <Badge key={idx} className="bg-purple-500/30 text-purple-200 border-purple-400/50 pl-3 pr-1 py-1">
                  {topic}
                  <button onClick={() => removeTopic(topic)} className="ml-1 p-0.5 hover:bg-purple-400/30 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_students" className="text-white font-medium">Max Students</Label>
          <Input
            id="max_students"
            type="number"
            min="1"
            max="50"
            value={formData.max_students}
            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
            className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-white font-medium">Confirm</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Confirm"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400/30"
              required
            />
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
            to={createPageUrl('TeacherLogin')} 
            className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  </motion.div>
</div>
</PageBackground>
);
}