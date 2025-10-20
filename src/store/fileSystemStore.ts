import { create } from 'zustand'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'tex' | 'bib' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'pdf' | 'svg' | 'doc' | 'docx' | 'txt' | 'md' | 'zip' | 'rar' | '7z' | 'other'
  lastModified: Date
  isDirty: boolean
  fileData?: string // Base64 encoded file data for binary files
  fileSize?: number // File size in bytes
}

export interface Project {
  id: string
  name: string
  path: string
  files: ProjectFile[]
  currentFileId: string | null
  lastModified: Date
}

interface FileSystemState {
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean
  
  // File operations
  createFile: (name: string, content?: string, type?: ProjectFile['type']) => void
  uploadFile: (file: File) => Promise<void>
  saveFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void
  setCurrentFile: (fileId: string) => void
  
  // Project operations
  createProject: (name: string) => void
  openProject: (project: Project) => void
  saveProject: () => void
  exportProject: () => void
  importProject: (file: File) => Promise<void>
  
  // File system helpers
  getFileById: (fileId: string) => ProjectFile | null
  getCurrentFile: () => ProjectFile | null
  markFileDirty: (fileId: string) => void
  markFileClean: (fileId: string) => void
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

const getFileType = (filename: string): ProjectFile['type'] => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'tex': return 'tex'
    case 'bib': return 'bib'
    case 'png': return 'png'
    case 'jpg':
    case 'jpeg': return 'jpg'
    case 'gif': return 'gif'
    case 'webp': return 'webp'
    case 'pdf': return 'pdf'
    case 'svg': return 'svg'
    case 'doc': return 'doc'
    case 'docx': return 'docx'
    case 'txt': return 'txt'
    case 'md': return 'md'
    case 'zip': return 'zip'
    case 'rar': return 'rar'
    case '7z': return '7z'
    default: return 'other'
  }
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  currentProject: null,
  projects: [],
  isLoading: false,

  createFile: (name: string, content = '', type?: ProjectFile['type']) => {
    const state = get()
    if (!state.currentProject) return

    const fileType = type || getFileType(name)
    const newFile: ProjectFile = {
      id: generateId(),
      name,
      path: `/${name}`,
      content,
      type: fileType,
      lastModified: new Date(),
      isDirty: false
    }

    const updatedProject = {
      ...state.currentProject,
      files: [...state.currentProject.files, newFile],
      currentFileId: newFile.id,
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  uploadFile: async (file: File) => {
    console.log('uploadFile called with:', file.name, file.type, file.size)
    const state = get()
    if (!state.currentProject) {
      console.error('No current project found')
      return
    }

    const fileType = getFileType(file.name)
    console.log('Detected file type:', fileType)
    
    // 更智能的文件类型检测
    const isTextFile = ['tex', 'bib', 'txt', 'md', 'doc', 'docx'].includes(fileType) || 
                      file.type.startsWith('text/') || 
                      (fileType === 'other' && file.size < 1024 * 1024) // 小于1MB的无扩展名文件尝试作为文本处理
    const isImageFile = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType) || 
                       file.type.startsWith('image/')
    const isPdfFile = fileType === 'pdf' || file.type === 'application/pdf'
    
    console.log('File classification:', { isTextFile, isImageFile, isPdfFile, fileType, mimeType: file.type })
    
    let content = ''
    let fileData: string | undefined
    
    try {
      if (isTextFile) {
        console.log('Reading as text file...')
        // 对于文本文件，读取内容
        content = await file.text()
        console.log('Text content length:', content.length)
      } else if (isImageFile) {
        console.log('Processing as image file...')
        // 对于图片文件，转换为Base64并显示预览信息
        const arrayBuffer = await file.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        fileData = base64
        content = `[Image file: ${file.name}]\nSize: ${file.size} bytes\nType: ${file.type}\n\nPreview available in file tree.`
        console.log('Image processed, base64 length:', base64.length)
      } else if (isPdfFile) {
        console.log('Processing as PDF file...')
        // 对于PDF文件，转换为Base64并显示预览信息
        const arrayBuffer = await file.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        fileData = base64
        content = `[PDF file: ${file.name}]\nSize: ${file.size} bytes\nType: ${file.type}\n\nPreview available in file tree.`
        console.log('PDF processed, base64 length:', base64.length)
      } else {
        console.log('Processing as binary file...')
        // 对于其他二进制文件，尝试作为文本读取（如果可能）
        try {
          const textContent = await file.text()
          // 检查是否包含可打印字符
          const printableChars = textContent.replace(/[^\x20-\x7E\s]/g, '').length
          const totalChars = textContent.length
          
          if (printableChars / totalChars > 0.7) {
            // 如果70%以上是可打印字符，当作文本处理
            content = textContent
            console.log('Binary file treated as text, printable ratio:', printableChars / totalChars)
          } else {
            // 真正的二进制文件
            const arrayBuffer = await file.arrayBuffer()
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
            fileData = base64
            content = `[Binary file: ${file.name}]\nSize: ${file.size} bytes\nType: ${file.type}\n\nThis file cannot be displayed as text.`
            console.log('Binary file processed, base64 length:', base64.length)
          }
        } catch (textError) {
          // 如果文本读取失败，作为二进制处理
          const arrayBuffer = await file.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          fileData = base64
          content = `[Binary file: ${file.name}]\nSize: ${file.size} bytes\nType: ${file.type}\n\nThis file cannot be displayed as text.`
          console.log('Binary file processed, base64 length:', base64.length)
        }
      }
    } catch (error) {
      console.error('Error reading file:', error)
      content = `[Error reading file: ${file.name}]\n${error instanceof Error ? error.message : 'Unknown error'}`
    }

    const newFile: ProjectFile = {
      id: generateId(),
      name: file.name,
      path: `/${file.name}`,
      content,
      type: fileType,
      lastModified: new Date(),
      isDirty: false,
      fileData,
      fileSize: file.size
    }

    const updatedProject = {
      ...state.currentProject,
      files: [...state.currentProject.files, newFile],
      currentFileId: newFile.id,
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  saveFile: (fileId: string, content: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.map(file =>
        file.id === fileId 
          ? { 
              ...file, 
              content, 
              lastModified: new Date(),
              isDirty: false 
            } 
          : file
      ),
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  deleteFile: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.filter(file => file.id !== fileId),
      currentFileId: state.currentProject.currentFileId === fileId ? null : state.currentProject.currentFileId,
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  renameFile: (fileId: string, newName: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.map(file =>
        file.id === fileId 
          ? { 
              ...file, 
              name: newName,
              path: `/${newName}`,
              type: getFileType(newName),
              lastModified: new Date()
            } 
          : file
      ),
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  setCurrentFile: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return

    set({
      currentProject: { ...state.currentProject, currentFileId: fileId }
    })
  },

  createProject: (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      path: `/${name}`,
      files: [],
      currentFileId: null,
      lastModified: new Date()
    }

    // 自动创建main.tex文件
    const mainFile: ProjectFile = {
      id: generateId(),
      name: 'main.tex',
      path: '/main.tex',
      content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}

\\title{${name}}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Start writing your paper here...

\\section{Methodology}
Describe your research methodology.

\\section{Results}
Present your research results.

\\section{Conclusion}
Summarize your findings and conclusions.

\\end{document}`,
      type: 'tex',
      lastModified: new Date(),
      isDirty: false
    }

    newProject.files = [mainFile]
    newProject.currentFileId = mainFile.id

    set(state => ({
      projects: [...state.projects, newProject],
      currentProject: newProject
    }))
  },

  openProject: (project: Project) => {
    set({ currentProject: project })
  },

  saveProject: () => {
    const state = get()
    if (!state.currentProject) return

    // 这里可以实现保存到本地存储或导出文件
    const projectData = JSON.stringify(state.currentProject, null, 2)
    const blob = new Blob([projectData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.currentProject.name}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  exportProject: () => {
    const state = get()
    if (!state.currentProject) return

    // 导出为ZIP文件（这里简化处理，实际可以用JSZip库）
    const projectData = JSON.stringify(state.currentProject, null, 2)
    const blob = new Blob([projectData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.currentProject.name}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  importProject: async (file: File) => {
    try {
      const text = await file.text()
      const project: Project = JSON.parse(text)
      
      // 验证项目结构
      if (!project.id || !project.name || !Array.isArray(project.files)) {
        throw new Error('无效的项目文件格式')
      }

      // 重新生成ID避免冲突
      project.id = generateId()
      project.files = project.files.map(file => ({
        ...file,
        id: generateId(),
        lastModified: new Date(),
        isDirty: false
      }))

      set(state => ({
        projects: [...state.projects, project],
        currentProject: project
      }))
    } catch (error) {
      console.error('导入项目失败:', error)
      throw error
    }
  },

  getFileById: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return null
    return state.currentProject.files.find(file => file.id === fileId) || null
  },

  getCurrentFile: () => {
    const state = get()
    if (!state.currentProject || !state.currentProject.currentFileId) return null
    return state.getFileById(state.currentProject.currentFileId)
  },

  markFileDirty: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.map(file =>
        file.id === fileId ? { ...file, isDirty: true } : file
      )
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  markFileClean: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.map(file =>
        file.id === fileId ? { ...file, isDirty: false } : file
      )
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  }
}))
