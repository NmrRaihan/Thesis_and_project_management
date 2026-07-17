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
  Save,
  ArrowLeft
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import { motion } from 'framer-motion';

export default function DefenseRegistration() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    defense_registration_enabled: false,
    defense_message: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsList = await base44.entities.DefenseRegistration.list();
      
      if (settingsList.length > 0) {
        setSettings(settingsList[0]);
      } else {
        const defaultSettings = {
          defense_registration_enabled: false,
          defense_message: '',
          updated_at: new Date().toISOString(),
          updated_by: 'admin'
        };
        const created = await base44.entities.DefenseRegistration.create(defaultSettings);
        setSettings(created);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsList = await base44.entities.DefenseRegistration.list();
      
      // Ensure boolean value
      const enabledValue = Boolean(settings.defense_registration_enabled);
      
      const settingsData = {
        defense_registration_enabled: enabledValue,
        defense_message: settings.defense_message || '',
        updated_at: new Date().toISOString(),
        updated_by: 'admin'
      };
      
      console.log('Saving defense registration:', settingsData);
      
      if (settingsList.length > 0) {
        await base44.entities.DefenseRegistration.update(settingsList[0].id, settingsData);
        toast.success('Defense registration settings saved!');
      } else {
        await base44.entities.DefenseRegistration.create(settingsData);
        toast.success('Defense registration settings created!');
      }
      
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-200">Loading...</p>
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Defense Registration</h1>
                  <p className="text-blue-200 mt-1">Control student access to thesis/project completion form</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="space-y-6">
                {/* Toggle */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <Label className="text-white font-semibold text-lg">Defense Registration Access</Label>
                    <p className="text-sm text-blue-200 mt-1">
                      {settings.defense_registration_enabled 
                        ? 'Students can access the completion form' 
                        : 'Students cannot access the completion form'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      defense_registration_enabled: !prev.defense_registration_enabled
                    }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      settings.defense_registration_enabled ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.defense_registration_enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Status Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      {settings.defense_registration_enabled ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <div>
                            <h3 className="text-sm font-medium text-blue-200">Status</h3>
                            <span className="text-white font-semibold">ON - Students can submit</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <X className="w-6 h-6 text-red-400" />
                          <div>
                            <h3 className="text-sm font-medium text-blue-200">Status</h3>
                            <span className="text-white font-semibold">OFF - Students see message</span>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Message Input */}
                <div>
                  <Label className="text-white font-semibold">Message for Students (when OFF)</Label>
                  <Input
                    type="text"
                    value={settings.defense_message}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      defense_message: e.target.value
                    }))}
                    placeholder="e.g., Thesis submission will be open from March 22-28, 2026"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  />
                  <p className="text-xs text-blue-200 mt-2">
                    This message will be shown to students when defense registration is OFF
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
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
        </div>
      </div>
    </PageBackground>
  );
}
