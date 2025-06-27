import React, { useState } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import FileUploadModal from './FileUploadModal';

export default function FileManager({ entityType, entityId, description, showUploadButton = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Tài liệu</h3>
          {showUploadButton && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Upload qua Modal
            </button>
          )}
        </div>
        
        <FileUpload
          entityType={entityType}
          entityId={entityId}
          description={description}
        />
      </div>
      
      {/* File List Section */}
      <div>
        <FileList
          entityType={entityType}
          entityId={entityId}
          showUploadButton={false}
        />
      </div>

      {/* Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        description={description}
      />
    </div>
  );
} 