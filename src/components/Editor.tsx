import React, { useState, useEffect } from 'react'
import { useVersionControlStore } from '../store/versionControlStore'
import { useFileSystemStore } from '../store/fileSystemStore'
import { useCompilationStore } from '../store/compilationStore'
import { VersionHistory } from './VersionHistory'
import { PDFPreview } from './PDFPreview'
import { RichTextEditor } from './RichTextEditor'
import { TemplateSelector } from './TemplateSelector'
import { LaTeXHelper } from './LaTeXHelper'

interface EditorProps {
  contentToInsert?: string | null
  onContentInserted?: () => void
}

export const Editor: React.FC<EditorProps> = ({ contentToInsert, onContentInserted }) => {
  const { 
    currentProject, 
    getCurrentFile, 
    saveFile, 
    markFileDirty, 
    markFileClean 
  } = useFileSystemStore()
  
  const [content, setContent] = useState('')
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [editMode, setEditMode] = useState<'latex' | 'rich'>('rich') // 默认使用富文本模式
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showLaTeXHelper, setShowLaTeXHelper] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  
  const { createVersion, startTracking, stopTracking, versions } = useVersionControlStore()
  const { compileProject, isCompiling, lastResult } = useCompilationStore()
  const currentFile = getCurrentFile()

  // 当切换文件时更新内容
  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content)
      setLastSavedContent(currentFile.content)
      setIsDirty(false)
    } else {
      setContent('')
      setLastSavedContent('')
      setIsDirty(false)
    }
  }, [currentFile?.id]) // 只依赖文件ID，避免内容变化时重新设置

  // 初始化版本控制
  useEffect(() => {
    if (currentFile && versions.length === 0) {
      createVersion(currentFile.content, '初始版本')
      setLastSavedContent(currentFile.content)
    }
    startTracking()
    
    return () => {
      stopTracking()
    }
  }, [currentFile?.id]) // 只依赖文件ID，避免无限循环

  // 检测内容变化
  useEffect(() => {
    if (content !== lastSavedContent) {
      setIsDirty(true)
      if (currentFile) {
        markFileDirty(currentFile.id)
      }
    } else {
      setIsDirty(false)
      if (currentFile) {
        markFileClean(currentFile.id)
      }
    }
  }, [content, lastSavedContent]) // 移除currentFile依赖，避免循环

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleSave = () => {
    if (isDirty && currentFile) {
      saveFile(currentFile.id, content)
      createVersion(content, `版本 ${versions.length + 1}`)
      setLastSavedContent(content)
      setIsDirty(false)
    }
  }

  const handleRevert = (revertedContent: string) => {
    setContent(revertedContent)
    setLastSavedContent(revertedContent)
    setIsDirty(false)
    if (currentFile) {
      saveFile(currentFile.id, revertedContent)
      markFileClean(currentFile.id)
    }
  }

  const handleLaTeXInsert = (command: string) => {
    setContent(prev => prev + command)
    setIsDirty(true)
  }

  // 处理AI内容插入
  useEffect(() => {
    if (contentToInsert) {
      setContent(prev => prev + '\n\n' + contentToInsert)
      setIsDirty(true)
      if (onContentInserted) {
        onContentInserted()
      }
    }
  }, [contentToInsert, onContentInserted])

  // const handleAIInsert = (content: string) => {
  //   setContent(prev => prev + '\n\n' + content)
  //   setIsDirty(true)
  // }

  const handleCompile = async () => {
    if (!currentProject) return
    
    // 先保存当前文件
    if (isDirty && currentFile) {
      saveFile(currentFile.id, content)
    }
    
    // 准备项目文件
    const projectFiles = currentProject.files.map(file => ({
      name: file.name,
      content: file.content
    }))
    
    // 编译项目
    await compileProject(projectFiles, 'main.tex')
  }

  if (!currentProject) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
          <div className="flex items-center space-x-2">
                 <span className="text-sm font-medium text-foreground">No Project</span>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No project opened</p>
            <p className="text-sm">Please create a new project or import an existing one</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentFile) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
          <div className="flex items-center space-x-2">
                 <span className="text-sm font-medium text-foreground">No File</span>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No file selected</p>
            <p className="text-sm">Please select a file from the file tree to edit</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">{currentFile.name}</span>
          <span className="text-xs text-muted-foreground">{currentFile.type.toUpperCase()}</span>
          {isDirty && (
                   <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                     Unsaved
                   </span>
          )}
          
          {/* 编辑模式切换 */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => setEditMode('rich')}
              className={`px-2 py-1 text-xs rounded ${
                editMode === 'rich' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              富文本
            </button>
            <button
              onClick={() => setEditMode('latex')}
              className={`px-2 py-1 text-xs rounded ${
                editMode === 'latex' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              LaTeX
            </button>
          </div>
        </div>
        
               <div className="flex items-center space-x-2">
                 <button
                   onClick={() => setShowTemplateSelector(true)}
                   className="px-3 py-1.5 text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 rounded-md"
                 >
                   模板
                 </button>
                 
                 <button
                   onClick={() => setShowLaTeXHelper(true)}
                   className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 rounded-md"
                 >
                   LaTeX助手
                 </button>
                 
                 <button
                   onClick={handleSave}
                   disabled={!isDirty}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                     isDirty
                       ? 'bg-green-500 text-white hover:bg-green-600'
                       : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                   }`}
                 >
                   Save Version
                 </button>

                 <button
                   onClick={() => setShowVersionHistory(!showVersionHistory)}
                   className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                 >
                   Version History ({versions.length})
                 </button>

                 <button 
                   onClick={handleCompile}
                   disabled={isCompiling}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                     isCompiling
                       ? 'bg-gray-400 text-white cursor-not-allowed'
                       : 'bg-blue-500 text-white hover:bg-blue-600'
                   }`}
                 >
                   {isCompiling ? 'Compiling...' : 'Compile LaTeX'}
                 </button>

                 <button 
                   onClick={() => setShowPDFPreview(!showPDFPreview)}
                   className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md"
                 >
                   PDF Preview
                 </button>
               </div>
      </div>
      
             <div className="flex flex-1">
               {/* 编辑器区域 */}
               <div className={`${showVersionHistory || showPDFPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
                 {editMode === 'rich' ? (
                   <RichTextEditor 
                     onContentChange={(latexContent) => {
                       setContent(latexContent)
                       setLastSavedContent(latexContent)
                     }}
                   />
                 ) : (
                   <textarea
                     value={content}
                     onChange={handleContentChange}
                     className="flex-1 w-full border-0 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 bg-white"
                     placeholder="Enter LaTeX code here..."
                   />
                 )}
               </div>

               {/* 版本历史面板 */}
               {showVersionHistory && (
                 <div className="w-1/2 border-l border-border bg-gray-50">
                   <VersionHistory onRevert={handleRevert} />
                 </div>
               )}

               {/* PDF预览面板 */}
               {showPDFPreview && (
                 <div className="w-1/2 border-l border-border bg-gray-50">
                   <PDFPreview 
                     compilationResult={lastResult} 
                     isCompiling={isCompiling} 
                   />
                 </div>
               )}
             </div>
             
             {/* 模板选择器 */}
             {showTemplateSelector && (
               <TemplateSelector onClose={() => setShowTemplateSelector(false)} />
             )}
             
             {/* LaTeX助手 */}
             {showLaTeXHelper && (
               <LaTeXHelper 
                 onInsert={handleLaTeXInsert}
                 isVisible={showLaTeXHelper}
                 onClose={() => setShowLaTeXHelper(false)}
               />
             )}
    </div>
  )
}
