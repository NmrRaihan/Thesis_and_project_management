import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown
} from 'lucide-react';
import nubLogo from './Group 18.png';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [regSettings, setRegSettings] = useState({
    student_registration_enabled: false,
    registration_start_time: '',
    registration_end_time: '',
    news_ticker_text: ''
  });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  // Load registration settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await base44.entities.RegistrationSettings.list();
        if (settings.length > 0) {
          console.log('Home - Loaded settings:', settings[0]);
          setRegSettings(settings[0]);
        } else {
          console.log('Home - No settings found, using defaults');
        }
      } catch (error) {
        console.error('Error loading registration settings:', error);
      }
      setLoading(false);
    };
    
    loadSettings();
    
    // Poll for settings updates every 3 seconds
    const interval = setInterval(loadSettings, 3000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer logic - only when registration is enabled
  useEffect(() => {
    // Only show countdown if registration is enabled AND times are set
    if (!regSettings.student_registration_enabled) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    if (!regSettings.registration_start_time && !regSettings.registration_end_time) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = regSettings.registration_start_time ? new Date(regSettings.registration_start_time).getTime() : null;
      const endTime = regSettings.registration_end_time ? new Date(regSettings.registration_end_time).getTime() : null;

      let targetTime = null;

      // If start time is in the future, count down to start
      if (startTime && now < startTime) {
        targetTime = startTime;
      } 
      // If we're between start and end, count down to end
      else if (startTime && endTime && now >= startTime && now < endTime) {
        targetTime = endTime;
      }
      // If only end time is set and it's in the future
      else if (!startTime && endTime && now < endTime) {
        targetTime = endTime;
      }

      if (targetTime) {
        const distance = targetTime - now;
        
        // If time has passed, reset
        if (distance < 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [regSettings.student_registration_enabled, regSettings.registration_start_time, regSettings.registration_end_time]);

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* News Ticker - ABOVE Header - Ultra Premium */}
      {regSettings.news_ticker_text && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 border-b border-white/10">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          
          {/* Glow effects */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
          
          {/* Scrolling content */}
          <div className="relative py-3 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
              {/* Multiple copies for seamless loop */}
              {[...Array(10)].map((_, i) => (
                <span key={i} className="inline-flex items-center mx-8 text-white font-medium text-sm tracking-wide">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                  {regSettings.news_ticker_text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/10' : 'bg-gradient-to-r from-blue-900/95 to-indigo-900/95 backdrop-blur-lg'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <img 
                src={nubLogo}
                alt="NUB Logo" 
                className="h-20 object-contain"
              />
              <div className="hidden lg:block">
                <h1 className={`text-xl font-bold transition-colors ${scrolled ? 'text-blue-900' : 'text-white'}`}>
                  Northern University Bangladesh
                </h1>
                <p className={`text-sm transition-colors ${scrolled ? 'text-blue-700' : 'text-blue-200'}`}>
                  Thesis & Project Management Platform
                </p>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${scrolled ? 'text-blue-900 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>
                  Login <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <Link to={createPageUrl('StudentLogin')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                    Student Login
                  </Link>
                  <Link to={createPageUrl('TeacherLogin')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                    Teacher Login
                  </Link>
                  <Link to="/admin/login" className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                    Admin Login
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${scrolled ? 'text-blue-900 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>
                  Register <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  {regSettings.student_registration_enabled && (
                    <Link to={createPageUrl('StudentRegister')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                      Student Register
                    </Link>
                  )}
                  <Link to={createPageUrl('TeacherRegister')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                    Teacher Register
                  </Link>
                </div>
              </div>
              {regSettings.student_registration_enabled && (
                <Link to={createPageUrl('StudentRegister')}>
                  <button className="ml-4 px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    Get Started
                  </button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-blue-900 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                <Link to={createPageUrl('StudentLogin')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                  Student Login
                </Link>
                <Link to={createPageUrl('TeacherLogin')} className="block px-4 py-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                  Teacher Login
                </Link>
                <Link to="/admin/login" className="block px-4 py-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                  Admin Login
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  {regSettings.student_registration_enabled && (
                    <Link to={createPageUrl('StudentRegister')} className="block px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-center">
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl -translate-y-1/3 animate-pulse" />

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
              {regSettings.student_registration_enabled && (
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
              )}
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
            
            {/* Countdown Timer - Ultra Premium */}
            {(countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-12"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl px-8 py-6 rounded-2xl border border-white/20 shadow-2xl shadow-blue-500/20">
                  {/* Pulsing indicator */}
                  <div className="flex items-center gap-2 mr-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Registration Opens In</span>
                  </div>
                  
                  {/* Time blocks */}
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">{countdown.days}</div>
                      </div>
                      <div className="text-xs text-blue-200 uppercase mt-2 tracking-wider font-medium">Days</div>
                    </div>
                    
                    <div className="text-3xl text-blue-300 font-light animate-pulse">:</div>
                    
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">{countdown.hours}</div>
                      </div>
                      <div className="text-xs text-blue-200 uppercase mt-2 tracking-wider font-medium">Hours</div>
                    </div>
                    
                    <div className="text-3xl text-blue-300 font-light animate-pulse">:</div>
                    
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">{countdown.minutes}</div>
                      </div>
                      <div className="text-xs text-blue-200 uppercase mt-2 tracking-wider font-medium">Minutes</div>
                    </div>
                    
                    <div className="text-3xl text-blue-300 font-light animate-pulse">:</div>
                    
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">{countdown.seconds}</div>
                      </div>
                      <div className="text-xs text-blue-200 uppercase mt-2 tracking-wider font-medium">Seconds</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
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
      <footer className="relative z-10">
        {/* Main Footer */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* About Section */}
              <div>
                <div className="mb-6">
                  <img 
                    src={nubLogo}
                    alt="NUB Logo" 
                    className="h-20 object-contain"
                  />
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-6">
                  Northern University Bangladesh's comprehensive thesis and project management platform. 
                  Streamlining academic research from proposal to completion.
                </p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-blue-500 transition-all hover:scale-110">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-blue-400 transition-all hover:scale-110">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110">
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to={createPageUrl('Home')} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('StudentLogin')} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      Student Portal
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('TeacherLogin')} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      Teacher Portal
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/login" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      Admin Panel
                    </Link>
                  </li>
                  {regSettings.student_registration_enabled && (
                    <li>
                      <Link to={createPageUrl('StudentRegister')} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        Get Started
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li className="text-blue-200 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    Research Guidelines
                  </li>
                  <li className="text-blue-200 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Proposal Templates
                  </li>
                  <li className="text-blue-200 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Team Formation Guide
                  </li>
                  <li className="text-blue-200 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Submission Checklist
                  </li>
                  <li className="text-blue-200 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Support & Help
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                  Contact Us
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-200 text-sm">
                      Northern University Bangladesh<br />
                      Dhanmondi, Dhaka-1205<br />
                      Bangladesh
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <a href="tel:+880-1234-567890" className="text-blue-200 hover:text-white transition-colors text-sm">
                      +880-1234-567890
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <a href="mailto:info@nub.ac.bd" className="text-blue-200 hover:text-white transition-colors text-sm">
                      info@nub.ac.bd
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-black/40 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <GraduationCap className="w-4 h-4" />
                <span>© 2024 Northern University Bangladesh (NUB). All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>

        {/* Top glow effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
      </footer>
    </div>
  );
}