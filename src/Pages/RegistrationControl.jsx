import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Shield, 
  CheckCircle, 
  X,
  Save
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';

export default function RegistrationControl() {
  const navigate = useNavigate();
  const [regSettings, setRegSettings] = useState({
    student_registration_enabled: false,
    registration_start_time: '',
    registration_end_time: '',
    news_ticker_text: ''
  });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [savingRegSettings, setSavingRegSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadRegistrationSettings();
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
      let isRegistrationOpen = false;

      // If start time is in the future, count down to start
      if (startTime && now < startTime) {
        targetTime = startTime;
      } 
      // If we're between start and end, registration is OPEN
      else if (startTime && endTime && now >= startTime && now < endTime) {
        isRegistrationOpen = true;
        targetTime = endTime;
      }
      // If only end time is set and it's in the future
      else if (!startTime && endTime && now < endTime) {
        isRegistrationOpen = true;
        targetTime = endTime;
      }

      if (targetTime) {
        const distance = targetTime - now;
        
        // If time has passed, reset
        if (distance < 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isRegistrationOpen: false });
          return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds, isRegistrationOpen });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isRegistrationOpen: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [regSettings.student_registration_enabled, regSettings.registration_start_time, regSettings.registration_end_time]);

  // Load registration settings
  const loadRegistrationSettings = async () => {
    try {
      console.log('Loading registration settings...');
      const settings = await base44.entities.RegistrationSettings.list();
      console.log('Settings found:', settings.length);
      
      if (settings.length > 0) {
        console.log('Setting state from database:', settings[0]);
        setRegSettings(settings[0]);
      } else {
        // Create default settings if none exist
        console.log('No settings found, creating defaults...');
        const defaultSettings = {
          student_registration_enabled: false,
          registration_start_time: '',
          registration_end_time: '',
          news_ticker_text: '',
          updated_at: new Date().toISOString(),
          updated_by: 'admin'
        };
        const created = await base44.entities.RegistrationSettings.create(defaultSettings);
        console.log('Created default settings:', created);
        setRegSettings(created);
      }
    } catch (error) {
      console.error('Error loading registration settings:', error);
      toast.error('Failed to load registration settings: ' + error.message);
    }
    setLoading(false);
  };

  // Save registration settings
  const handleSaveRegSettings = async () => {
    setSavingRegSettings(true);
    try {
      console.log('Starting save...');
      console.log('Current regSettings:', regSettings);
      
      const settings = await base44.entities.RegistrationSettings.list();
      console.log('Existing settings count:', settings.length);
      
      const settingsData = {
        student_registration_enabled: regSettings.student_registration_enabled,
        registration_start_time: regSettings.registration_start_time || '',
        registration_end_time: regSettings.registration_end_time || '',
        news_ticker_text: regSettings.news_ticker_text || '',
        updated_at: new Date().toISOString(),
        updated_by: 'admin'
      };
      
      console.log('Saving settings data:', settingsData);
      
      if (settings.length > 0) {
        // Update existing settings
        console.log('Updating existing settings with ID:', settings[0].id);
        const updated = await base44.entities.RegistrationSettings.update(settings[0].id, settingsData);
        console.log('Update result:', updated);
        toast.success('Registration settings updated successfully!');
      } else {
        // Create new settings
        console.log('Creating new settings...');
        const created = await base44.entities.RegistrationSettings.create(settingsData);
        console.log('Create result:', created);
        toast.success('Registration settings created successfully!');
      }
      
      // Reload to ensure we have the latest data
      console.log('Reloading settings...');
      await loadRegistrationSettings();
    } catch (error) {
      console.error('Error saving registration settings:', error);
      console.error('Error stack:', error.stack);
      toast.error('Failed to save registration settings: ' + (error.message || 'Unknown error'));
    }
    setSavingRegSettings(false);
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-200">Loading settings...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Registration Control Settings</h1>
                  <p className="text-blue-200 mt-1">Manage student registration and announcements</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="space-y-6">
                {/* Toggle Student Registration */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <Label className="text-white font-semibold text-lg">Student Registration</Label>
                    <p className="text-sm text-blue-200 mt-1">Enable or disable student registration on the home page</p>
                  </div>
                  <button
                    onClick={() => setRegSettings(prev => ({
                      ...prev,
                      student_registration_enabled: !prev.student_registration_enabled
                    }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      regSettings.student_registration_enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        regSettings.student_registration_enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Current Status Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      {regSettings.student_registration_enabled ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <div>
                            <h3 className="text-sm font-medium text-blue-200">Status</h3>
                            <span className="text-white font-semibold">Registration Enabled</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <X className="w-6 h-6 text-red-400" />
                          <div>
                            <h3 className="text-sm font-medium text-blue-200">Status</h3>
                            <span className="text-white font-semibold">Registration Disabled</span>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                  
                  {/* Countdown Timer Display */}
                  {regSettings.student_registration_enabled && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0 || countdown.isRegistrationOpen) && (
                    <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-200">
                            {countdown.isRegistrationOpen ? 'Registration Closes In' : 'Registration Opens In'}
                          </h3>
                          <div className="flex gap-2 text-white font-bold text-lg">
                            <span>{countdown.days}d</span>
                            <span>{countdown.hours}h</span>
                            <span>{countdown.minutes}m</span>
                            <span>{countdown.seconds}s</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Registration Start Time */}
                <div>
                  <Label className="text-white font-semibold">Registration Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={regSettings.registration_start_time}
                    onChange={(e) => setRegSettings(prev => ({
                      ...prev,
                      registration_start_time: e.target.value
                    }))}
                    className="mt-2 bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-blue-200 mt-2">Optional: Set when registration should open</p>
                </div>

                {/* Registration End Time */}
                <div>
                  <Label className="text-white font-semibold">Registration End Time</Label>
                  <Input
                    type="datetime-local"
                    value={regSettings.registration_end_time}
                    onChange={(e) => setRegSettings(prev => ({
                      ...prev,
                      registration_end_time: e.target.value
                    }))}
                    className="mt-2 bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-blue-200 mt-2">Optional: Set when registration should close</p>
                </div>

                {/* News Ticker Text */}
                <div>
                  <Label className="text-white font-semibold">News Ticker Message</Label>
                  <Input
                    type="text"
                    value={regSettings.news_ticker_text}
                    onChange={(e) => setRegSettings(prev => ({
                      ...prev,
                      news_ticker_text: e.target.value
                    }))}
                    placeholder="e.g., Student registration will open on March 1st, 2025"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  />
                  <p className="text-xs text-blue-200 mt-2">This message will scroll on the home page header</p>
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <Button
                    onClick={handleSaveRegSettings}
                    disabled={savingRegSettings}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingRegSettings ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/dashboard')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
              {regSettings.news_ticker_text && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 overflow-hidden">
                  <div className="flex whitespace-nowrap animate-scroll-left">
                    <span className="text-white font-medium px-4">{regSettings.news_ticker_text}</span>
                    <span className="text-white font-medium px-4">{regSettings.news_ticker_text}</span>
                    <span className="text-white font-medium px-4">{regSettings.news_ticker_text}</span>
                    <span className="text-white font-medium px-4">{regSettings.news_ticker_text}</span>
                  </div>
                </div>
              )}
              <style jsx>{`
                @keyframes scroll-left {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(0%);
                  }
                }
                .animate-scroll-left {
                  animation: scroll-left 20s linear infinite;
                }
              `}</style>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageBackground>
  );
}
