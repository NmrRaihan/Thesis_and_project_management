import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, Loader2, X, Plus } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose, user, userType, onSave, darkMode = false }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    department: user?.department || '',
    research_field: user?.research_field || '',
    bio: user?.bio || '',
    profile_photo: user?.profile_photo || '',
    accepted_topics: user?.accepted_topics || [],
    max_students: user?.max_students || 10,
    publications: user?.publications || []
  });
  
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_photo || '');
  const [uploading, setUploading] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newPublication, setNewPublication] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setUploading(true);
      // In a real app, you would upload to a server here
      // For now, we'll create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setFormData({ ...formData, profile_photo: e.target.result });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.accepted_topics.includes(newTopic.trim())) {
      setFormData({
        ...formData,
        accepted_topics: [...formData.accepted_topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove) => {
    setFormData({
      ...formData,
      accepted_topics: formData.accepted_topics.filter(topic => topic !== topicToRemove)
    });
  };

  const addPublication = () => {
    if (newPublication.trim() && !formData.publications.includes(newPublication.trim())) {
      setFormData({
        ...formData,
        publications: [...formData.publications, newPublication.trim()]
      });
      setNewPublication('');
    }
  };

  const removePublication = (pubToRemove) => {
    setFormData({
      ...formData,
      publications: formData.publications.filter(pub => pub !== pubToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const initials = formData.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || (userType === 'teacher' ? 'T' : 'S');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white border-slate-700' : ''}`}>
        <DialogHeader>
          <DialogTitle className={darkMode ? 'text-white' : ''}>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <label className={`absolute bottom-0 right-0 rounded-full p-2 shadow-md cursor-pointer transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-50'}`}>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className={`w-4 h-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAvatarPreview('');
                setFormData({ ...formData, profile_photo: '' });
              }}
              className={`text-sm hover:transition-colors ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <X className="w-4 h-4 mr-1" />
              Remove Photo
            </Button>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className={darkMode ? 'text-white' : ''}>Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
                className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className={darkMode ? 'text-white' : ''}>Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department" className={darkMode ? 'text-white' : ''}>Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter your department"
                className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
              />
            </div>
            
            {userType === 'teacher' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="research_field" className={darkMode ? 'text-white' : ''}>Research Field</Label>
                  <Input
                    id="research_field"
                    value={formData.research_field}
                    onChange={(e) => setFormData({ ...formData, research_field: e.target.value })}
                    placeholder="Enter your research field"
                    className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-white' : ''}>Accepted Topics</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                      placeholder="Add a research topic"
                      className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
                    />
                    <Button type="button" onClick={addTopic} className="px-3">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.accepted_topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.accepted_topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className={darkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50 pl-3 pr-1 py-1' : 'bg-blue-50 text-blue-700 pl-3 pr-1 py-1'}>
                          {topic}
                          <button 
                            onClick={() => removeTopic(topic)} 
                            className={`ml-1 p-0.5 rounded ${darkMode ? 'hover:bg-blue-800/50' : 'hover:bg-blue-200'}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_students" className={darkMode ? 'text-white' : ''}>Maximum Students</Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    className={darkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-white' : ''}>Publications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPublication}
                      onChange={(e) => setNewPublication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPublication())}
                      placeholder="Add a publication"
                      className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
                    />
                    <Button type="button" onClick={addPublication} className="px-3">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.publications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.publications.map((pub, idx) => (
                        <Badge key={idx} variant="secondary" className={darkMode ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700/50 pl-3 pr-1 py-1' : 'bg-indigo-50 text-indigo-700 pl-3 pr-1 py-1'}>
                          {pub}
                          <button 
                            onClick={() => removePublication(pub)} 
                            className={`ml-1 p-0.5 rounded ${darkMode ? 'hover:bg-indigo-800/50' : 'hover:bg-indigo-200'}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="bio" className={darkMode ? 'text-white' : ''}>Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className={darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400' : ''}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${darkMode ? 'border-slate-600 text-white hover:bg-slate-800' : ''}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}