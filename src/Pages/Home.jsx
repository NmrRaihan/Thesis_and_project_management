import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Lightbulb,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Team Formation',
    description: 'Form groups with up to 3 members for collaborative thesis or project work',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Communication',
    description: 'Built-in chat for team discussions and teacher-student communication',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FileText,
    title: 'AI-Powered Proposals',
    description: 'Generate and refine research proposals with AI assistance',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: BookOpen,
    title: 'Smart Matching',
    description: 'Get matched with supervisors based on your research interests',
    color: 'from-emerald-500 to-teal-500'
  },
];

const steps = [
  { 
    step: '01', 
    title: 'Register', 
    desc: 'Create your student or teacher account',
    icon: GraduationCap,
    color: 'text-blue-500'
  },
  { 
    step: '02', 
    title: 'Form Team', 
    desc: 'Invite partners to join your research group',
    icon: Users,
    color: 'text-purple-500'
  },
  { 
    step: '03', 
    title: 'Create Proposal', 
    desc: 'Generate AI-powered research proposals',
    icon: FileText,
    color: 'text-amber-500'
  },
  { 
    step: '04', 
    title: 'Get Supervised', 
    desc: 'Connect with matching supervisors',
    icon: BookOpen,
    color: 'text-emerald-500'
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/3 animate-pulse" />
        
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                <GraduationCap className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">ThesisHub</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link to={createPageUrl('StudentLogin')}>
                <button className="px-5 py-2 rounded-lg font-medium transition-all bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/20">
                  Student Login
                </button>
              </Link>
              <Link to={createPageUrl('TeacherLogin')}>
                <button className="px-5 py-2 rounded-lg font-medium transition-all bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/20">
                  Teacher Login
                </button>
              </Link>
            </motion.div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg px-6 py-3 rounded-full text-sm font-medium mb-10 border border-white/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-blue-300" />
              </motion.div>
              <span className="text-blue-200">AI-Powered Academic Management</span>
              <Zap className="w-4 h-4 text-yellow-300" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8"
            >
              <span className="text-white">Your Thesis Journey,</span>{' '}
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent inline-block">
                Simplified
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Streamline your academic projects from team formation to final submission. 
              Connect with supervisors, collaborate with peers, and achieve more together.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to={createPageUrl('StudentRegister')}>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4 rounded-xl shadow-2xl shadow-blue-500/30 text-white border border-white/20 backdrop-blur-lg relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started as Student
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </motion.button>
              </Link>
              <Link to={createPageUrl('TeacherRegister')}>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-medium transition-all text-lg px-8 py-4 rounded-xl border border-white/30 hover:border-white/50 bg-white/10 backdrop-blur-lg text-white hover:bg-white/20 shadow-lg shadow-white/10 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Register as Teacher
                    <Globe className="w-5 h-5 ml-2 transition-transform group-hover:rotate-12" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Everything you need to succeed in your academic journey
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 h-full transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/20 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-3 group-hover:text-blue-200 transition-colors">{feature.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{feature.description}</p>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10 blur-xl`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-300" />
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
          </div>
          <p className="text-blue-200 max-w-2xl mx-auto text-lg">
            From registration to graduation, we guide you through every step
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              whileHover={{ y: -15 }}
              className="text-center relative group"
            >
              <div className="relative z-10">
                <motion.div 
                  className="text-6xl font-bold mb-6 bg-gradient-to-br from-blue-300 to-purple-300 bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 30px rgba(147, 51, 234, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {item.step}
                </motion.div>
                
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color.replace('text', 'from').replace('-500', '-500/20')} backdrop-blur-lg border border-white/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                
                <h3 className="font-bold text-white text-xl mb-3 group-hover:text-blue-200 transition-colors">{item.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
              
              {/* Connection lines for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-500"></div>
              )}
              
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color.replace('text', 'from').replace('-500', '-500/10')} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl`}></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">ThesisHub</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              <Link to="/admin/login" className="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1">
                <Star className="w-4 h-4" />
                Admin Panel
              </Link>
              <p className="text-sm text-blue-200">
                © 2024 Thesis & Project Management Platform. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50"></div>
      </footer>
    </div>
  );
}