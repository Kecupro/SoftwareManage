import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNotifications } from './NotificationContext';

const FileUploadContext = createContext();

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};

export const FileUploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError, showWarning } = useNotifications();

  // File validation rules
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 10;

  const validateFile = (file) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Loại file ${file.type} không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, ZIP, RAR`
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File ${file.name} quá lớn. Kích thước tối đa: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    return { valid: true };
  };

  const uploadFile = useCallback(async (file, entityType, entityId, description = '') => {
    const validation = validateFile(file);
    if (!validation.valid) {
      showError(validation.error);
      return null;
    }

    const uploadId = Date.now().toString();
    const upload = {
      id: uploadId,
      file,
      entityType, // 'project', 'module', 'sprint', 'user-story', 'task', 'bug'
      entityId,
      description,
      status: 'uploading', // 'uploading', 'success', 'error'
      progress: 0,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User', // Will be replaced with actual user
      size: file.size,
      type: file.type,
      name: file.name
    };

    setUploads(prev => [...prev, upload]);
    setIsUploading(true);

    try {
      // Simulate file upload with progress
      await simulateFileUpload(upload, (progress) => {
        setUploads(prev => 
          prev.map(u => 
            u.id === uploadId 
              ? { ...u, progress }
              : u
          )
        );
      });

      // Update upload status to success
      setUploads(prev => 
        prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'success', progress: 100 }
            : u
        )
      );

      showSuccess(`File ${file.name} đã được upload thành công!`);
      return uploadId;

    } catch (error) {
      // Update upload status to error
      setUploads(prev => 
        prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error', progress: 0 }
            : u
        )
      );

      showError(`Lỗi upload file ${file.name}: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [showSuccess, showError]);

  const uploadMultipleFiles = useCallback(async (files, entityType, entityId, description = '') => {
    if (files.length > maxFiles) {
      showWarning(`Chỉ có thể upload tối đa ${maxFiles} files cùng lúc`);
      return [];
    }

    const uploadPromises = files.map(file => 
      uploadFile(file, entityType, entityId, description)
    );

    const results = await Promise.all(uploadPromises);
    return results.filter(id => id !== null);
  }, [uploadFile, showWarning]);

  const removeUpload = useCallback((uploadId) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const getUploadsByEntity = useCallback((entityType, entityId) => {
    return uploads.filter(upload => 
      upload.entityType === entityType && upload.entityId === entityId
    );
  }, [uploads]);

  const getUploadStats = useCallback(() => {
    const total = uploads.length;
    const successful = uploads.filter(u => u.status === 'success').length;
    const failed = uploads.filter(u => u.status === 'error').length;
    const uploading = uploads.filter(u => u.status === 'uploading').length;

    return { total, successful, failed, uploading };
  }, [uploads]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (fileType === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (fileType.includes('zip') || fileType.includes('rar')) {
      return (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const value = {
    uploads,
    isUploading,
    uploadFile,
    uploadMultipleFiles,
    removeUpload,
    clearUploads,
    getUploadsByEntity,
    getUploadStats,
    formatFileSize,
    getFileIcon,
    allowedTypes,
    maxFileSize,
    maxFiles
  };

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
};

// Simulate file upload with progress
const simulateFileUpload = async (upload, onProgress) => {
  const totalSteps = 100;
  const stepDelay = 50; // 50ms per step

  for (let i = 0; i <= totalSteps; i++) {
    onProgress(i);
    await new Promise(resolve => setTimeout(resolve, stepDelay));
  }

  // Simulate random success/failure
  if (Math.random() < 0.95) { // 95% success rate
    return Promise.resolve();
  } else {
    return Promise.reject(new Error('Network error'));
  }
}; 