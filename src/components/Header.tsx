import React, { useState, useRef } from 'react'
import { useFileSystemStore } from '../store/fileSystemStore'
import { useLayoutStore } from '../store/layoutStore'
import { DocumentTextIcon, Cog6ToothIcon, ArrowsPointingOutIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onToggleAI: () => void
  showAI: boolean
}

export const Header: React.FC<HeaderProps> = ({ onToggleAI, showAI }) => {
  const { 
    currentProject, 
    createProject, 
    saveProject, 
    exportProject, 
    importProject 
  } = useFileSystemStore()
  
  const { resetLayout } = useLayoutStore()
  
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setShowNewProjectDialog(false)
    }
  }

  const handleImportProject = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await importProject(file)
        alert('项目导入成功！')
      } catch (error) {
        alert('项目导入失败：' + (error as Error).message)
      }
    }
  }

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center space-x-3">
        <DocumentTextIcon className="h-6 w-6 text-primary" />
               <h1 className="text-lg font-semibold text-foreground">ScholarFlow IDE</h1>
               <span className="text-sm text-muted-foreground">Academic Writing IDE</span>
        {currentProject && (
          <span className="text-sm text-blue-600 font-medium">
            {currentProject.name}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
               <button
                 onClick={() => setShowNewProjectDialog(true)}
                 className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
               >
                 New Project
               </button>
               <button
                 onClick={handleImportProject}
                 className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
               >
                 Import Project
               </button>
        {currentProject && (
          <>
            <button 
              onClick={saveProject}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Save Project
            </button>
            <button 
              onClick={exportProject}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Export Project
            </button>
          </>
        )}
        <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Compile LaTeX
        </button>
               <button
                 onClick={resetLayout}
                 className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                 title="Reset Layout"
               >
                 <ArrowsPointingOutIcon className="h-5 w-5" />
               </button>
               <button
                 onClick={onToggleAI}
                 className={`rounded-md p-1.5 transition-colors ${
                   showAI 
                     ? 'bg-blue-500 text-white hover:bg-blue-600' 
                     : 'text-muted-foreground hover:bg-accent'
                 }`}
                 title={showAI ? "Hide AI Assistant" : "Show AI Assistant"}
               >
                 <ChatBubbleLeftRightIcon className="h-5 w-5" />
               </button>
               <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                 <Cog6ToothIcon className="h-5 w-5" />
               </button>
      </div>

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                   <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                     <h3 className="text-lg font-medium text-gray-900">New Project</h3>
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Project Name
                         </label>
                         <input
                           type="text"
                           placeholder="Enter project name"
                           value={newProjectName}
                           onChange={(e) => setNewProjectName(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') handleCreateProject()
                             if (e.key === 'Escape') setShowNewProjectDialog(false)
                           }}
                           className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           autoFocus
                         />
                       </div>
                       <div className="text-sm text-gray-500">
                         A LaTeX project with main.tex file will be created automatically
                       </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  )
}
