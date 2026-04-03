import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthCard from '@/components/ui/AuthCard';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, ArrowRight, User, Lock, Shield } from 'lucide-react';
import { databaseService as db } from '@/services/databaseService';
import logger from '@/utils/logger';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (!formData.username || !formData.password) {
        toast.error('Please enter both username and password');
        setLoading(false);
        return;
      }

      // Check if admin exists in localStorage entities
      const storedAdmins = localStorage.getItem('entity_Admin');
      if (!storedAdmins) {
        toast.error('No admin accounts found. Please create an admin account first.');
        setLoading(false);
        return;
      }

      const admins = JSON.parse(storedAdmins);
      
      // Find admin by username
      const matchedAdmin = admins.find(
        admin => admin.username === formData.username
      );

      if (!matchedAdmin) {
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }

      // Verify password with bcrypt comparison
      let passwordMatch = false;
      
      if (matchedAdmin.password_hash) {
        // If it's a bcrypt hash (starts with $2)
        if (matchedAdmin.password_hash.startsWith('$2')) {
          try {
            passwordMatch = await bcrypt.compare(formData.password, matchedAdmin.password_hash);
          } catch (error) {
            logger.error('AdminLogin', 'Bcrypt compare error', error);
            // Fallback to plain text check
            passwordMatch = formData.password === matchedAdmin.password_plain || 
                           formData.password === matchedAdmin.password_hash;
          }
        } else {
          // Plain text password or direct match
          passwordMatch = formData.password === matchedAdmin.password_hash || 
                         formData.password === matchedAdmin.password_plain;
        }
      }

      if (!passwordMatch) {
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }

      // Create session for authenticated admin
      const adminUser = {
        id: matchedAdmin.id || matchedAdmin._id || `admin_${Date.now()}`,
        username: matchedAdmin.username,
        email: matchedAdmin.email || 'admin@thesisHub.com',
        role: matchedAdmin.role || 'admin',
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      
      toast.success('Welcome back, Administrator!');
      navigate('/admin/dashboard');
    } catch (error) {
      logger.error('AdminLogin', 'Login failed', error);
      toast.error('Login failed. Please try again.');
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
              className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Administrator Login
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200"
            >
              Access the administration panel
            </motion.p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-medium">Username</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="username"
                    placeholder="Enter admin username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-amber-200 focus:border-amber-400 focus:ring-amber-400/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-amber-200 focus:border-amber-400 focus:ring-amber-400/30 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-200"
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
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl text-base font-medium shadow-lg shadow-amber-500/30 transition-all duration-300 relative overflow-hidden group"
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

              <div className="text-center text-sm text-blue-200">
                <p>Contact your system administrator for credentials</p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </PageBackground>
  );
}