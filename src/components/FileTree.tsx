import React, { useState } from 'react'
import { useFileSystemStore } from '../store/fileSystemStore'
import { 
  FolderIcon, 
  DocumentIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export const FileTree: React.FC = () => {
  const { 
    currentProject, 
    createFile, 
    deleteFile, 
    renameFile, 
    setCurrentFile,
    getCurrentFile 
  } = useFileSystemStore()
  
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')

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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'tex':
        return <DocumentIcon className="h-4 w-4 text-blue-500" />
      case 'bib':
        return <DocumentIcon className="h-4 w-4 text-green-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return <DocumentIcon className="h-4 w-4 text-purple-500" />
      case 'pdf':
        return <DocumentIcon className="h-4 w-4 text-red-500" />
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
                   <p className="text-xs text-gray-400">Please create or open a project first</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
               <h2 className="text-sm font-medium text-foreground">File Explorer</h2>
        <div className="flex space-x-1">
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
          
          {currentProject.files.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                   <p className="text-sm">No files in project</p>
                   <p className="text-xs text-gray-400">Click + button to create files</p>
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
    </div>
  )
}
