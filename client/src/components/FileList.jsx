import React from 'react';
import { useFileUpload } from '../context/FileUploadContext';

export default function FileList({ entityType, entityId, showUploadButton = true, onFileClick }) {
  const { 
    getUploadsByEntity, 
    removeUpload, 
    formatFileSize, 
    getFileIcon
  } = useFileUpload();

  const files = getUploadsByEntity(entityType, entityId);

  const handleDownload = (file) => {
    // Create a temporary link to download the file
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (uploadId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
      removeUpload(uploadId);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài liệu</h3>
        <p className="mt-1 text-sm text-gray-500">
          Chưa có tài liệu nào được upload cho {entityType} này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Tài liệu ({files.length})
        </h3>
        {showUploadButton && (
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Upload tài liệu
          </button>
        )}
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
              file.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </h4>
                  {getStatusIcon(file.status)}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.type}</span>
                  <span>•</span>
                  <span>Upload bởi {file.uploadedBy}</span>
                  <span>•</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>

                {file.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {file.description}
                  </p>
                )}

                {/* Progress Bar for Uploading */}
                {file.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Đang upload...</span>
                      <span>{file.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && (
                  <p className="mt-2 text-sm text-red-600">
                    Lỗi upload file. Vui lòng thử lại.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                {file.status === 'success' && (
                  <>
                    <button
                      onClick={() => onFileClick ? onFileClick(file) : handleDownload(file)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Xem/Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 