import React from 'react'
import { ProjectFile } from '../store/fileSystemStore'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface FilePreviewProps {
  file: ProjectFile
  onClose: () => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const renderContent = () => {
    switch (file.type) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
      case 'svg':
        if (file.fileData) {
          return (
            <img
              src={`data:image/${file.type === 'svg' ? 'svg+xml' : file.type};base64,${file.fileData}`}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          )
        }
        return <div className="text-gray-500">Image data not available</div>
      
      case 'pdf':
        if (file.fileData) {
          return (
            <iframe
              src={`data:application/pdf;base64,${file.fileData}`}
              className="w-full h-full border-0"
              title={file.name}
            />
          )
        }
        return <div className="text-gray-500">PDF data not available</div>
      
      case 'txt':
      case 'md':
      case 'tex':
      case 'bib':
        return (
          <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded overflow-auto">
            {file.content}
          </pre>
        )
      
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-sm">File size: {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</p>
            <p className="text-sm text-gray-400 mt-2">Preview not available for this file type</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {renderContent()}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Type: {file.type.toUpperCase()}</span>
            <span>Size: {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</span>
            <span>Modified: {file.lastModified.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
