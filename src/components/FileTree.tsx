import React, { useState, useRef, useCallback } from 'react'
import { useFileSystemStore } from '../store/fileSystemStore'
import { FilePreview } from './FilePreview'
import { 
  FolderIcon, 
  DocumentIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export const FileTree: React.FC = () => {
  const { 
    currentProject, 
    createFile, 
    createProject,
    deleteFile, 
    renameFile, 
    setCurrentFile,
    getCurrentFile,
    uploadFile
  } = useFileSystemStore()
  
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFile = getCurrentFile()

  const handleFileClick = (fileId: string) => {
    setCurrentFile(fileId)
  }

  const handleRename = (fileId: string, currentName: string) => {
    setEditingFile(fileId)
    setEditingName(currentName)
  }

  const handleRenameSubmit = () => {
    if (editingFile && editingName.trim()) {
      renameFile(editingFile, editingName.trim())
      setEditingFile(null)
      setEditingName('')
    }
  }

  const handleRenameCancel = () => {
    setEditingFile(null)
    setEditingName('')
  }

  const handleDelete = (fileId: string) => {
    if (confirm('确定要删除这个文件吗？')) {
      deleteFile(fileId)
    }
  }

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.trim()
      const fileType = fileName.includes('.') ? undefined : 'tex'
      createFile(fileName, '', fileType)
      setNewFileName('')
      setShowNewFileDialog(false)
    }
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return
    
    setIsUploading(true)
    console.log('Uploading files:', files.length)
    
    try {
      for (const file of Array.from(files)) {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)
        try {
          await uploadFile(file)
          console.log('Successfully uploaded:', file.name)
        } catch (error) {
          console.error('Error uploading file:', file.name, error)
        }
      }
    } finally {
      setIsUploading(false)
    }
  }, [uploadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    // 重置input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'tex':
        return <DocumentIcon className="h-4 w-4 text-blue-500" />
      case 'bib':
        return <DocumentIcon className="h-4 w-4 text-green-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return <PhotoIcon className="h-4 w-4 text-purple-500" />
      case 'svg':
        return <PhotoIcon className="h-4 w-4 text-indigo-500" />
      case 'pdf':
        return <DocumentIcon className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <DocumentIcon className="h-4 w-4 text-blue-600" />
      case 'txt':
      case 'md':
        return <DocumentIcon className="h-4 w-4 text-gray-600" />
      case 'zip':
      case 'rar':
      case '7z':
        return <DocumentIcon className="h-4 w-4 text-orange-500" />
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-500" />
    }
  }

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">File Explorer</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <FolderIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No project opened</p>
            <p className="text-xs text-gray-400 mb-4">Please create a project first</p>
            <button
              onClick={() => {
                const projectName = prompt('Enter project name:', 'My Project')
                if (projectName) {
                  createProject(projectName)
                }
              }}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Create New Project
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`h-full flex flex-col ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">File Explorer</h2>
        <div className="flex space-x-1">
          <button 
            onClick={openFileDialog}
            className="p-1 hover:bg-accent rounded"
            title="Upload Files"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setShowNewFileDialog(true)}
            className="p-1 hover:bg-accent rounded"
            title="New File"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {currentProject.files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer hover:bg-accent ${
                currentFile?.id === file.id ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleFileClick(file.id)}
            >
              {getFileIcon(file.type)}
              
              {editingFile === file.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit()
                    if (e.key === 'Escape') handleRenameCancel()
                  }}
                  className="flex-1 text-sm bg-background border border-input rounded px-1 py-0.5"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm truncate">
                  {file.name}
                  {file.isDirty && <span className="text-orange-500 ml-1">●</span>}
                </span>
              )}
              
              {editingFile !== file.id && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                  {(file.type === 'png' || file.type === 'jpg' || file.type === 'jpeg' || file.type === 'gif' || file.type === 'webp' || file.type === 'svg' || file.type === 'pdf' || file.type === 'txt' || file.type === 'md' || file.type === 'tex' || file.type === 'bib') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewFile(file)
                      }}
                      className="p-0.5 hover:bg-accent rounded"
                      title="Preview"
                    >
                      <EyeIcon className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRename(file.id, file.name)
                    }}
                    className="p-0.5 hover:bg-accent rounded"
                    title="Rename"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(file.id)
                    }}
                    className="p-0.5 hover:bg-accent rounded"
                    title="Delete"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {currentProject.files.length === 0 && !isUploading && (
            <div className="text-center text-gray-500 py-4">
              <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No files in project</p>
              <p className="text-xs text-gray-400">Click + button to create files or drag files here</p>
            </div>
          )}
          
          {isUploading && (
            <div className="text-center text-blue-500 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm font-medium">Uploading files...</p>
            </div>
          )}
          
          {isDragOver && (
            <div className="text-center text-blue-500 py-4 border-2 border-dashed border-blue-300 rounded-lg mx-2">
              <DocumentArrowUpIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Drop files here to upload</p>
            </div>
          )}
        </div>
      </div>

      {/* 新建文件对话框 */}
      {showNewFileDialog && (
        <div className="border-t border-border bg-background p-3">
          <div className="space-y-2">
            <input
              type="text"
                     placeholder="File name (e.g., introduction.tex)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setShowNewFileDialog(false)
              }}
              className="w-full text-sm border border-input rounded px-2 py-1"
              autoFocus
            />
            <div className="flex space-x-2">
                     <button
                       onClick={handleCreateFile}
                       className="flex-1 bg-primary text-primary-foreground text-sm py-1 rounded hover:bg-primary/90"
                     >
                       Create
                     </button>
                     <button
                       onClick={() => setShowNewFileDialog(false)}
                       className="flex-1 bg-gray-200 text-gray-800 text-sm py-1 rounded hover:bg-gray-300"
                     >
                       Cancel
                     </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".tex,.bib,.png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.doc,.docx,.txt,.md,.zip,.rar,.7z"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* 文件预览模态框 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}
