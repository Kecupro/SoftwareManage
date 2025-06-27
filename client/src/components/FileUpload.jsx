import React, { useState, useRef, useCallback } from 'react';
import { useFileUpload } from '../context/FileUploadContext';

export default function FileUpload({ 
  entityType, 
  entityId, 
  description = '', 
  multiple = true, 
  onUploadComplete,
  className = '' 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const { 
    uploadFile, 
    uploadMultipleFiles, 
    isUploading, 
    allowedTypes, 
    maxFileSize, 
    maxFiles,
    formatFileSize,
    getFileIcon 
  } = useFileUpload();

  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    
    if (multiple && fileArray.length > maxFiles) {
      alert(`Chỉ có thể chọn tối đa ${maxFiles} files`);
      return;
    }

    setSelectedFiles(prev => {
      const newFiles = multiple ? [...prev, ...fileArray] : fileArray;
      return newFiles.slice(0, maxFiles);
    });
  }, [multiple, maxFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (multiple) {
        const uploadIds = await uploadMultipleFiles(selectedFiles, entityType, entityId, description);
        if (onUploadComplete) {
          onUploadComplete(uploadIds);
        }
      } else {
        const uploadId = await uploadFile(selectedFiles[0], entityType, entityId, description);
        if (onUploadComplete && uploadId) {
          onUploadComplete([uploadId]);
        }
      }
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [selectedFiles, multiple, uploadFile, uploadMultipleFiles, entityType, entityId, description, onUploadComplete]);

  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getAcceptedTypes = () => {
    return allowedTypes.join(',');
  };

  const getMaxSizeText = () => {
    return `${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div className="text-gray-600">
            <p className="text-lg font-medium">
              Kéo thả files vào đây hoặc{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                chọn files
              </button>
            </p>
            <p className="text-sm mt-1">
              Hỗ trợ: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, ZIP, RAR
            </p>
            <p className="text-sm text-gray-500">
              Kích thước tối đa: {getMaxSizeText()} | Tối đa: {maxFiles} files
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptedTypes()}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Files đã chọn ({selectedFiles.length})
            </h4>
            <button
              type="button"
              onClick={() => setSelectedFiles([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Xóa tất cả
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang upload...</span>
              </div>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
} 