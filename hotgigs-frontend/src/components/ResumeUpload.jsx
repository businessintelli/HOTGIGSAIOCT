import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ResumeUpload = ({ onUploadComplete, mode = 'single' }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, uploading, completed, failed
      progress: 0,
      error: null
    }));
    
    if (mode === 'single') {
      setFiles(newFiles.slice(0, 1));
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: mode === 'bulk',
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    setUploading(true);

    for (const fileItem of files) {
      if (fileItem.status === 'completed') continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('source', mode === 'bulk' ? 'bulk_upload' : 'candidate_upload');

        const endpoint = mode === 'bulk' 
          ? '/api/resumes/bulk-upload' 
          : '/api/resumes/upload';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();

        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed', progress: 100, resumeId: data.resume_id } 
            : f
        ));

        // Start polling for processing status
        if (data.resume_id) {
          pollProcessingStatus(fileItem.id, data.resume_id);
        }

      } catch (error) {
        // Update status to failed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'failed', error: error.message } 
            : f
        ));
      }
    }

    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(files);
    }
  };

  const pollProcessingStatus = async (fileId, resumeId) => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) return;

      try {
        const response = await fetch(`/api/resumes/${resumeId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                processingStatus: data.status,
                processingProgress: data.progress_percentage,
                currentStep: data.current_step
              } 
            : f
        ));

        if (data.status === 'completed' || data.status === 'failed') {
          return;
        }

        attempts++;
        setTimeout(poll, 2000); // Poll every 2 seconds
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    poll();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive 
            ? 'Drop the files here...' 
            : mode === 'bulk'
              ? 'Drag & drop resumes here, or click to select'
              : 'Drag & drop your resume here, or click to select'
          }
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, DOCX, DOC (Max 10MB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'bulk' ? 'Selected Files' : 'Selected File'} ({files.length})
            </h3>
            {files.length > 0 && !uploading && (
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                {getStatusIcon(fileItem.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(fileItem.file.size)}</span>
                    {fileItem.status === 'uploading' && (
                      <span>• Uploading...</span>
                    )}
                    {fileItem.status === 'completed' && fileItem.processingStatus && (
                      <span>• {fileItem.currentStep || 'Processing...'}</span>
                    )}
                    {fileItem.status === 'failed' && (
                      <span className="text-red-500">• {fileItem.error}</span>
                    )}
                  </div>
                  
                  {/* Processing Progress Bar */}
                  {fileItem.status === 'completed' && fileItem.processingStatus !== 'completed' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${fileItem.processingProgress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {fileItem.status === 'pending' && !uploading && (
                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="ml-3 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && files.some(f => f.status === 'pending') && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setFiles([])}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{uploading ? 'Uploading...' : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}</span>
          </button>
        </div>
      )}

      {/* Success Message */}
      {files.length > 0 && files.every(f => f.status === 'completed' && f.processingStatus === 'completed') && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-800">
              All resumes uploaded and processed successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;

