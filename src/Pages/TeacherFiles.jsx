import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from '@/utils';
import { 
  Upload, 
  FolderOpen, 
  FileText, 
  File,
  Download,
  Loader2,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import PageBackground from '@/components/ui/PageBackground';

export default function TeacherFiles() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || localStorage.getItem('userType') !== 'teacher') {
      navigate(createPageUrl('TeacherLogin'));
      return;
    }
    setCurrentUser(user);
    loadData(user);
    
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('group');
    if (groupId) setSelectedGroup(groupId);
  }, []);

  const loadData = async (user) => {
    setLoading(true);
    
    const groupsData = await base44.entities.StudentGroup.filter({ 
      assigned_teacher_id: user.teacher_id 
    });
    setGroups(groupsData);
    
    // Load files for all groups
    let allFiles = [];
    for (const group of groupsData) {
      const groupFiles = await base44.entities.SharedFile.filter({ group_id: group.id });
      allFiles = [...allFiles, ...groupFiles];
    }
    setFiles(allFiles.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    
    if (selectedGroup === 'all') {
      toast.error('Please select a specific group to upload files');
      return;
    }
    
    setUploading(true);
    
    for (const file of uploadedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.SharedFile.create({
        group_id: selectedGroup,
        uploaded_by: currentUser.teacher_id,
        uploader_type: 'teacher',
        uploader_name: currentUser.full_name,
        file_name: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        category: 'other'
      });
    }
    
    setUploading(false);
    toast.success('Files uploaded successfully!');
    loadData(currentUser);
    e.target.value = '';
  };

  const filteredFiles = selectedGroup === 'all' 
    ? files 
    : files.filter(f => f.group_id === selectedGroup);

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.group_name || `Group ${groupId?.slice(-4)}`;
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return Image;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return FileSpreadsheet;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const categoryColors = {
    proposal: 'bg-purple-100 text-purple-700',
    research: 'bg-blue-100 text-blue-700',
    report: 'bg-green-100 text-green-700',
    presentation: 'bg-amber-100 text-amber-700',
    other: 'bg-slate-100 text-slate-700'
  };

  if (loading) {
    return (
      <PageBackground>
        <DashboardLayout userType="teacher" currentPage="TeacherFiles">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64 bg-white/20" />
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-white/20" />)}
            </div>
          </div>
        </DashboardLayout>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <DashboardLayout userType="teacher" currentPage="TeacherFiles">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Shared Files</h1>
              <p className="text-blue-200 mt-1">Documents shared with your students</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-lg border-white/20 text-white">
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id} className="hover:bg-white/10">
                      {g.group_name || `Group ${g.id.slice(-4)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || selectedGroup === 'all'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Files
              </Button>
            </div>
          </div>
  
          {selectedGroup === 'all' && (
            <Card className="p-4 bg-blue-500/20 border-blue-400/30 backdrop-blur">
              <p className="text-sm text-blue-200">
                Select a specific group to upload files.
              </p>
            </Card>
          )}
  
          {groups.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <FolderOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
              <p className="text-blue-200">Accept student requests to start sharing files.</p>
            </Card>
          ) : filteredFiles.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur-lg border-white/20">
              <FolderOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-white mb-2">No Files Yet</h2>
              <p className="text-blue-200">Upload files to share with your students.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFiles.map((file, idx) => {
                const FileIcon = getFileIcon(file.file_type);
                  
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-4 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                          <FileIcon className="w-6 h-6 text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{file.file_name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-blue-200">
                            <span>{file.uploader_name}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-white/20 text-white border border-white/30">
                              {getGroupName(file.group_id)}
                            </Badge>
                            <Badge className={`text-xs ${
                              file.category === 'proposal' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                              file.category === 'research' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                              file.category === 'report' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                              file.category === 'presentation' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                              'bg-white/20 text-white border border-white/30'
                            }`}>
                              {file.category}
                            </Badge>
                          </div>
                        </div>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Download className="w-5 h-5 text-blue-300" />
                        </a>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
      </PageBackground>
    );
}