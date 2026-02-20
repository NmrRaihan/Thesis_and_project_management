import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/databaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  FileText, 
  BookOpen, 
  Target, 
  Calendar,
  ArrowLeft,
  Send,
  Sparkles
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function CreateGroupProposal() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
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
      navigate('/student/dashboard');
      return;
    }
    
    checkExistingProposal(studentData);
  }, [navigate]);

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
      navigate('/student/dashboard');
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
                onClick={() => navigate('/student/dashboard')}
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
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate('/student/dashboard')} 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Create Group Proposal</h1>
                  <p className="text-blue-200">Submit your group's research proposal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Proposal Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Proposal Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-blue-200">Project Title *</Label>
                    <Input
                      id="title"
                      value={proposal.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter your project title"
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field" className="text-blue-200">Research Field *</Label>
                    <Input
                      id="field"
                      value={proposal.field}
                      onChange={(e) => handleInputChange('field', e.target.value)}
                      placeholder="e.g., Computer Science, Engineering, Business"
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="abstract" className="text-blue-200">Abstract *</Label>
                    <Textarea
                      id="abstract"
                      value={proposal.abstract}
                      onChange={(e) => handleInputChange('abstract', e.target.value)}
                      placeholder="Provide a brief summary of your research proposal"
                      className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objectives" className="text-blue-200">Objectives</Label>
                    <Textarea
                      id="objectives"
                      value={proposal.objectives}
                      onChange={(e) => handleInputChange('objectives', e.target.value)}
                      placeholder="List your research objectives"
                      className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="methodology" className="text-blue-200">Methodology</Label>
                    <Textarea
                      id="methodology"
                      value={proposal.methodology}
                      onChange={(e) => handleInputChange('methodology', e.target.value)}
                      placeholder="Describe your research methodology"
                      className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expected_outcomes" className="text-blue-200">Expected Outcomes</Label>
                    <Textarea
                      id="expected_outcomes"
                      value={proposal.expected_outcomes}
                      onChange={(e) => handleInputChange('expected_outcomes', e.target.value)}
                      placeholder="What do you expect to achieve?"
                      className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project_type" className="text-blue-200">Project Type</Label>
                    <select
                      id="project_type"
                      value={proposal.project_type}
                      onChange={(e) => handleInputChange('project_type', e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3"
                    >
                      <option value="thesis" className="bg-slate-800">Thesis</option>
                      <option value="project" className="bg-slate-800">Project</option>
                      <option value="research" className="bg-slate-800">Research Paper</option>
                    </select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Proposal...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Proposal
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Group Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Group Name</p>
                    <p className="text-white font-medium">{student.group_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Your Role</p>
                    <p className="text-white font-medium">Group Leader</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Members</p>
                    <p className="text-white font-medium">3/3</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Proposal Guidelines</h3>
                <ul className="text-sm text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <Sparkles className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Clear and concise title</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Well-defined objectives</span>
                  </li>
                  <li className="flex items-start">
                    <BookOpen className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Detailed methodology</span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Realistic timeline</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                <div className="space-y-3 text-sm text-blue-200">
                  <p>1. Create proposal</p>
                  <p>2. Submit to teachers</p>
                  <p>3. Teacher review</p>
                  <p>4. Admin approval</p>
                  <p>5. Start supervision</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}