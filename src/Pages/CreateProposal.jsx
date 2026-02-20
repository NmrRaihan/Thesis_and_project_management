import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/services/databaseService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageBackground from '@/components/ui/PageBackground';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, 
  Sparkles, 
  Lightbulb, 
  Save, 
  Send, 
  Loader2,
  Wand2,
  BookOpen,
  Plus,
  X,
  MessageCircle
} from 'lucide-react';
import ProposalChatbot from '@/components/proposal/ProposalChatbot';
// Import our new AI service
import aiService from '@/services/aiService';

const FIELDS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Computer Vision',
  'Natural Language Processing',
  'Cybersecurity',
  'Cloud Computing',
  'Software Engineering',
  'Database Systems',
  'Networking',
  'Web Development',
  'Mobile Development',
  'Blockchain',
  'IoT',
  'Other'
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestingTitle, setSuggestingTitle] = useState(false);
  const [suggestingKeywords, setSuggestingKeywords] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_proposal: '',
    project_type: 'thesis',
    field: '',
    keywords: []
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'student') {
      navigate(createPageUrl('StudentLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    if (user.group_id) {
      const groups = await db.entities.StudentGroup.filter({ id: user.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
        
        const proposals = await db.entities.Proposal.filter({ group_id: groups[0].id });
        if (proposals.length > 0) {
          setProposal(proposals[0]);
          setFormData({
            title: proposals[0].title || '',
            description: proposals[0].description || '',
            full_proposal: proposals[0].full_proposal || '',
            project_type: proposals[0].project_type || 'thesis',
            field: proposals[0].field || '',
            keywords: proposals[0].keywords || []
          });
        }
      }
    }
    
    setLoading(false);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const suggestTitles = async () => {
    if (!formData.description && !formData.field) {
      toast.error('Please enter a description or select a field first');
      return;
    }
    
    setSuggestingTitle(true);
    
    try {
      // Call our real AI service for title generation
      const aiTitles = await aiService.generateProposalTitle(
        formData.description, 
        formData.field
      );
      
      // Parse the AI response to get titles
      const titleLines = aiTitles.split('\n').filter(line => line.trim() !== '');
      if (titleLines.length > 0) {
        // Extract the first title (everything after "1. ")
        const firstTitle = titleLines[0].replace(/^\d+\.\s*/, '').trim();
        setFormData({ ...formData, title: firstTitle });
        toast.success('AI-generated title suggestion applied!');
      } else {
        // Fallback if parsing fails
        setFormData({ ...formData, title: aiTitles });
        toast.success('AI-generated title suggestion applied!');
      }
    } catch (error) {
      console.error('AI Title Generation Error:', error);
      toast.error('Failed to generate title suggestion. Please try again.');
    }
    
    setSuggestingTitle(false);
  };

  const generateProposal = async () => {
    if (!formData.title) {
      toast.error('Please enter a title first');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Call our real AI service for full proposal generation
      const aiProposal = await aiService.generateFullProposal(formData);
      setFormData({ ...formData, full_proposal: aiProposal });
      toast.success('Proposal generated successfully with AI!');
    } catch (error) {
      console.error('AI Proposal Generation Error:', error);
      toast.error('Failed to generate proposal. Please try again.');
    }
    
    setGenerating(false);
  };

  const improveDescription = async () => {
    if (!formData.description) {
      toast.error('Please enter a description first');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Call our real AI service for description improvement
      const improvedDescription = await aiService.improveDescription(
        formData.description, 
        formData.field
      );
      setFormData({ ...formData, description: improvedDescription });
      toast.success('Description improved with AI!');
    } catch (error) {
      console.error('AI Description Improvement Error:', error);
      toast.error('Failed to improve description. Please try again.');
    }
    
    setGenerating(false);
  };

  const suggestKeywords = async () => {
    if (!formData.title && !formData.description) {
      toast.error('Please enter a title or description first');
      return;
    }
    
    setSuggestingKeywords(true);
    
    try {
      // Call our real AI service for keyword suggestions
      const suggestedKeywords = await aiService.suggestKeywords(
        formData.title, 
        formData.description
      );
      
      if (suggestedKeywords.length > 0) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, ...suggestedKeywords]
        });
        toast.success(`${suggestedKeywords.length} keywords added!`);
      } else {
        toast.info('No additional keywords suggested');
      }
    } catch (error) {
      console.error('AI Keyword Suggestion Error:', error);
      toast.error('Failed to suggest keywords. Please try again.');
    }
    
    setSuggestingKeywords(false);
  };

  const saveProposal = async (submit = false) => {
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!group) {
      toast.error('You need to create a group first');
      return;
    }
    
    setSaving(true);
    
    const proposalData = {
      group_id: group.id,
      title: formData.title,
      description: formData.description,
      full_proposal: formData.full_proposal,
      project_type: formData.project_type,
      field: formData.field,
      keywords: formData.keywords,
      status: submit ? 'submitted' : 'draft'
    };
    
    try {
      if (proposal) {
        await db.entities.Proposal.update(proposal.id, proposalData);
      } else {
        const newProposal = await db.entities.Proposal.create(proposalData);
        setProposal(newProposal);
      }
      
      // Update group project type
      await db.entities.StudentGroup.update(group.id, { 
        project_type: formData.project_type,
        field_of_interest: formData.field,
        status: 'active'
      });
      
      setSaving(false);
      toast.success(submit ? 'Proposal submitted!' : 'Proposal saved!');
      
      if (submit) {
        navigate(createPageUrl('SuggestedTeachers'));
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      setSaving(false);
      toast.error('Failed to save proposal. Please try again.');
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="CreateProposal">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <Skeleton className="h-96 rounded-2xl bg-white/20" />
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  if (!group) {
    return (
      <PageBackground>
        <DashboardLayout userType="student" currentPage="CreateProposal">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur border border-white/20">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Create a Group First</h2>
              <p className="text-blue-200 mb-6">
                You need to create or join a group before creating a proposal.
              </p>
              <button
                onClick={() => navigate(createPageUrl('SelectPartners'))}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Select Partners
              </button>
            </Card>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="student" currentPage="CreateProposal">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Create Proposal</h1>
              <p className="text-blue-200 mt-1">AI-powered proposal generator</p>
            </div>
          {proposal && (
            <Badge className={
              proposal.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
              proposal.status === 'approved' ? 'bg-green-100 text-green-700' :
              'bg-slate-100 text-slate-700'
            }>
              {proposal.status?.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Project Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-white/10 backdrop-blur border border-white/20">
            <Label className="text-white mb-3 block">Project Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, project_type: 'thesis' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.project_type === 'thesis'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <BookOpen className={`w-8 h-8 mx-auto mb-2 ${
                  formData.project_type === 'thesis' ? 'text-blue-300' : 'text-blue-200'
                }`} />
                <h3 className="font-semibold text-white">Thesis</h3>
                <p className="text-sm text-blue-200 mt-1">Research-focused academic work</p>
              </button>
              
              <button
                onClick={() => setFormData({ ...formData, project_type: 'project' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.project_type === 'project'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${
                  formData.project_type === 'project' ? 'text-blue-300' : 'text-blue-200'
                }`} />
                <h3 className="font-semibold text-white">Project</h3>
                <p className="text-sm text-blue-200 mt-1">Application-focused development</p>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 space-y-6 bg-white/10 backdrop-blur border border-white/20">
            {/* Field Selection */}
            <div className="space-y-2">
              <Label className="text-white">Research Field</Label>
              <Select value={formData.field} onValueChange={(v) => setFormData({ ...formData, field: v })}>
                <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Title</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={suggestTitles}
                  disabled={suggestingTitle}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {suggestingTitle ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-1" />
                  )}
                  Suggest Title
                </Button>
              </div>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter your thesis/project title"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Brief Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={improveDescription}
                  disabled={generating || !formData.description}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-1" />
                  )}
                  Improve
                </Button>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your research idea..."
                className="min-h-[120px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Keywords</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={suggestKeywords}
                  disabled={suggestingKeywords || (!formData.title && !formData.description)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {suggestingKeywords ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  Suggest Keywords
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add keywords"
                  className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Button onClick={addKeyword} className="h-11 px-4 rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-blue-500/30 text-blue-200 border border-blue-400/50 pl-3 pr-1 py-1">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="ml-1 p-0.5 hover:bg-blue-400/20 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Full Proposal */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={generateProposal}
                disabled={generating || !formData.title}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl"
              >
                {generating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                Generate Full Proposal with AI
              </Button>
            </div>

            {/* Full Proposal */}
            {formData.full_proposal && (
              <div className="space-y-2">
                <Label className="text-white">Full Proposal</Label>
                <Textarea
                  value={formData.full_proposal}
                  onChange={(e) => setFormData({ ...formData, full_proposal: e.target.value })}
                  className="min-h-[400px] rounded-xl font-mono text-sm bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => saveProposal(false)}
            disabled={saving}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/30 text-white hover:bg-white/10"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Draft
          </Button>
          <Button
            onClick={() => saveProposal(true)}
            disabled={saving || !formData.title || !formData.full_proposal}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            Submit & Find Teachers
          </Button>
        </motion.div>

        {/* Floating Chatbot Button */}
        <Button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg z-40"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>

        {/* Floating Chatbot */}
        {showChatbot && (
          <ProposalChatbot 
            floating
            onClose={() => setShowChatbot(false)}
            onSuggestion={(suggestionData) => {
              if (suggestionData.type === 'titles' && suggestionData.data.length > 0) {
                setFormData({ ...formData, title: suggestionData.data[0] });
              } else if (suggestionData.type === 'description') {
                setFormData({ ...formData, description: suggestionData.data });
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  </PageBackground>
);
}