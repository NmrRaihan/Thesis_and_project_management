import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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

export default function StudentFiles() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [files, setFiles] = useState([]);

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
      const filesData = await base44.entities.SharedFile.filter({ 
        group_id: user.group_id 
      }, '-created_date');
      setFiles(filesData);
    }
    
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    
    setUploading(true);
    
    for (const file of uploadedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.SharedFile.create({
        group_id: currentUser.group_id,
        uploaded_by: currentUser.student_id,
        uploader_type: 'student',
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
      <DashboardLayout userType="student" currentPage="StudentFiles">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUser?.group_id) {
    return (
      <DashboardLayout userType="student" currentPage="StudentFiles">
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Group Yet</h2>
          <p className="text-slate-500">Join a supervised group to access shared files.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student" currentPage="StudentFiles">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shared Files</h1>
            <p className="text-slate-500 mt-1">Files shared with your group</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Files
          </Button>
        </div>

        {files.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-slate-900 mb-2">No Files Yet</h2>
            <p className="text-slate-500">Upload files to share with your group and supervisor.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, idx) => {
              const FileIcon = getFileIcon(file.file_type);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileIcon className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{file.file_name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                          <span>{file.uploader_name}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.file_size)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${file.uploader_type === 'teacher' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'}`}>
                            {file.uploader_type === 'teacher' ? 'From Teacher' : 'From Student'}
                          </Badge>
                          <Badge className={`text-xs ${categoryColors[file.category] || categoryColors.other}`}>
                            {file.category}
                          </Badge>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-slate-500" />
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
  );
}