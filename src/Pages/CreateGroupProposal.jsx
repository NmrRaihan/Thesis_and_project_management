import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService as db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Target, 
  Calendar,
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle,
  Users,
  Lightbulb,
  Save,
  Loader2,
  ClipboardList,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RESEARCH_FIELDS = [
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

export default function CreateGroupProposal() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState({
    title: '',
    abstract: '',
    objectives: '',
    methodology: '',
    expected_outcomes: '',
    field: '',
    project_type: 'thesis'
  });
  const [loading, setLoading] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/student/login');
      return;
    }
    
    const studentData = JSON.parse(currentUser);
    setStudent(studentData);
    
    // Check if student is a group leader
    if (!studentData.is_group_admin || !studentData.group_id) {
      toast.error('You must be a group leader to create a proposal');
      navigate('/studentdashboard');
      return;
    }
    
    loadGroupData(studentData);
    checkExistingProposal(studentData);
  }, [navigate]);

  const loadGroupData = async (studentData) => {
    try {
      const groups = await db.entities.StudentGroup.filter({ id: studentData.group_id });
      if (groups.length > 0) {
        setGroup(groups[0]);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  const checkExistingProposal = async (studentData) => {
    try {
      const proposals = await db.entities.Proposal.list();
      const existing = proposals.find(p => p.group_id === studentData.group_id);
      if (existing) {
        setExistingProposal(existing);
      }
    } catch (error) {
      console.error('Error checking existing proposal:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!proposal.title.trim() || !proposal.abstract.trim() || !proposal.field.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newProposal = {
        group_id: student.group_id,
        group_name: student.group_name,
        title: proposal.title,
        abstract: proposal.abstract,
        objectives: proposal.objectives,
        methodology: proposal.methodology,
        expected_outcomes: proposal.expected_outcomes,
        field: proposal.field,
        project_type: proposal.project_type,
        status: 'draft',
        created_by: student.student_id,
        created_at: new Date().toISOString()
      };

      await db.entities.Proposal.create(newProposal);
      toast.success('Proposal created successfully!');
      navigate('/studentdashboard');
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProposal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateProgress = () => {
    const fields = ['title', 'abstract', 'field'];
    const optionalFields = ['objectives', 'methodology', 'expected_outcomes'];
    
    let completed = 0;
    let total = fields.length + optionalFields.length;
    
    fields.forEach(field => {
      if (proposal[field]?.trim()) completed++;
    });
    
    optionalFields.forEach(field => {
      if (proposal[field]?.trim()) completed += 0.5; // Optional fields count less
    });
    
    return Math.round((completed / total) * 100);
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return proposal.title.trim() && proposal.field;
    if (currentStep === 2) return proposal.abstract.trim();
    return true;
  };

  const handleNextStep = () => {
    if (!canProceedToNextStep()) {
      toast.error('Please fill in all required fields before continuing');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!student) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-200">Loading...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  if (existingProposal) {
    return (
      <PageBackground>
        <div className="min-h-screen relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Proposal Already Exists</h2>
              <p className="text-blue-200 mb-6">
                Your group already has a proposal titled "{existingProposal.title}"
              </p>
              <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
                <h3 className="text-xl font-semibold text-white mb-2">{existingProposal.title}</h3>
                <p className="text-blue-200 text-sm mb-2">Status: {existingProposal.status}</p>
                <p className="text-blue-200">{existingProposal.abstract?.substring(0, 150)}...</p>
              </div>
              <Button 
                onClick={() => navigate('/studentdashboard')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => navigate('/studentdashboard')} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    Create Group Proposal
                  </h1>
                  <p className="text-blue-200 mt-1">Structure your research idea into a comprehensive proposal</p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-200">Completion</p>
                  <p className="text-2xl font-bold text-white">{calculateProgress()}%</p>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Steps & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Steps */}
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Basic Info', icon: FileText, fields: ['title', 'field'] },
                    { step: 2, title: 'Abstract', icon: BookOpen, fields: ['abstract'] },
                    { step: 3, title: 'Details', icon: ClipboardList, fields: ['objectives', 'methodology'] }
                  ].map(({ step, title, icon: Icon, fields }) => {
                    const isComplete = fields.every(f => proposal[f]?.trim());
                    const isCurrent = currentStep === step;
                    
                    return (
                      <div 
                        key={step}
                        onClick={() => setCurrentStep(step)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isCurrent 
                            ? 'bg-blue-500/20 border border-blue-400/50' 
                            : isComplete 
                              ? 'bg-green-500/10 border border-green-400/30'
                              : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete 
                            ? 'bg-green-500' 
                            : isCurrent 
                              ? 'bg-blue-500' 
                              : 'bg-white/20'
                        }`}>
                          {isComplete ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-white font-semibold text-sm">{step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCurrent || isComplete ? 'text-white' : 'text-blue-200'}`}>
                            {title}
                          </p>
                          <p className="text-xs text-blue-300 mt-0.5">
                            {isComplete ? 'Complete' : isCurrent ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Group Info */}
              {group && (
                <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Group Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wide">Group Name</p>
                      <p className="text-white font-medium">{group.group_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wide">Project Type</p>
                      <Badge className="mt-1 bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        {proposal.project_type.charAt(0).toUpperCase() + proposal.project_type.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wide">Members</p>
                      <p className="text-white font-medium">
                        {group.members?.length || 1} / 3
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wide">Your Role</p>
                      <Badge className="mt-1 bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        Group Leader
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-400/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Quick Tips
                </h3>
                <ul className="text-sm text-blue-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Be specific and clear in your title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Abstract should summarize key points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Define measurable objectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Explain your methodology clearly</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                        <p className="text-blue-200 text-sm">Start with the fundamentals of your proposal</p>
                      </div>
                    </div>

                    {/* Project Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-white font-semibold">Project Type *</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('project_type', 'thesis')}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            proposal.project_type === 'thesis'
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:border-white/40 bg-white/5'
                          }`}
                        >
                          <BookOpen className={`w-8 h-8 mx-auto mb-2 ${
                            proposal.project_type === 'thesis' ? 'text-blue-300' : 'text-blue-200'
                          }`} />
                          <h3 className="font-semibold text-white">Thesis</h3>
                          <p className="text-xs text-blue-200 mt-1">Research-focused academic work</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleInputChange('project_type', 'project')}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            proposal.project_type === 'project'
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:border-white/40 bg-white/5'
                          }`}
                        >
                          <Target className={`w-8 h-8 mx-auto mb-2 ${
                            proposal.project_type === 'project' ? 'text-blue-300' : 'text-blue-200'
                          }`} />
                          <h3 className="font-semibold text-white">Project</h3>
                          <p className="text-xs text-blue-200 mt-1">Application-focused development</p>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Project Title *</Label>
                      <Input
                        value={proposal.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter a clear, descriptive title for your project"
                        className="h-14 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 text-lg"
                      />
                      <p className="text-xs text-blue-300">
                        💡 Make it specific and descriptive (e.g., "AI-Powered Student Performance Prediction System")
                      </p>
                    </div>

                    {/* Research Field */}
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Research Field *</Label>
                      <Select value={proposal.field} onValueChange={(v) => handleInputChange('field', v)}>
                        <SelectTrigger className="h-14 rounded-xl bg-white/10 border-white/20 text-white text-lg">
                          <SelectValue placeholder="Select your research field" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {RESEARCH_FIELDS.map(field => (
                            <SelectItem key={field} value={field} className="text-white hover:bg-white/10">
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-blue-300">
                        📚 Choose the field that best matches your research area
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end pt-6 border-t border-white/10">
                      <Button
                        onClick={handleNextStep}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 h-12 rounded-xl"
                      >
                        Continue to Abstract
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Abstract */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Project Abstract</h2>
                        <p className="text-blue-200 text-sm">Provide a comprehensive summary of your research</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Abstract / Summary *</Label>
                      <Textarea
                        value={proposal.abstract}
                        onChange={(e) => handleInputChange('abstract', e.target.value)}
                        placeholder="Write a detailed summary of your research proposal (200-500 words)..."
                        className="min-h-[300px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 text-base leading-relaxed"
                      />
                      <div className="flex items-center justify-between text-xs text-blue-300">
                        <span>💡 Include problem statement, approach, and expected impact</span>
                        <span>{proposal.abstract.split(/\s+/).filter(w => w.length > 0).length} words</span>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-white/10">
                      <Button
                        onClick={handlePrevStep}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 px-8 h-12 rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 h-12 rounded-xl"
                      >
                        Continue to Details
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Detailed Information */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Research Details</h2>
                        <p className="text-blue-200 text-sm">Elaborate on your methodology and objectives</p>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        Research Objectives
                        <span className="text-xs text-blue-300 font-normal">(Optional but recommended)</span>
                      </Label>
                      <Textarea
                        value={proposal.objectives}
                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                        placeholder="List your main research objectives:&#10;1. To develop...&#10;2. To analyze...&#10;3. To evaluate..."
                        className="min-h-[150px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      />
                      <p className="text-xs text-blue-300">
                        🎯 List 3-5 specific, measurable objectives
                      </p>
                    </div>

                    {/* Methodology */}
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Methodology
                        <span className="text-xs text-blue-300 font-normal">(Optional but recommended)</span>
                      </Label>
                      <Textarea
                        value={proposal.methodology}
                        onChange={(e) => handleInputChange('methodology', e.target.value)}
                        placeholder="Describe your research approach:&#10;- Data collection methods&#10;- Analysis techniques&#10;- Tools and technologies&#10;- Evaluation criteria..."
                        className="min-h-[150px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      />
                      <p className="text-xs text-blue-300">
                        🔬 Explain how you'll conduct your research
                      </p>
                    </div>

                    {/* Expected Outcomes */}
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Expected Outcomes
                        <span className="text-xs text-blue-300 font-normal">(Optional)</span>
                      </Label>
                      <Textarea
                        value={proposal.expected_outcomes}
                        onChange={(e) => handleInputChange('expected_outcomes', e.target.value)}
                        placeholder="What do you expect to achieve?&#10;- Expected results&#10;- Potential impact&#10;- Applications..."
                        className="min-h-[120px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      />
                      <p className="text-xs text-blue-300">
                        ✨ Describe the expected results and impact
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-white/10">
                      <Button
                        onClick={handlePrevStep}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 px-8 h-12 rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading || !proposal.title.trim() || !proposal.abstract.trim() || !proposal.field.trim()}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 h-12 rounded-xl disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Proposal
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
