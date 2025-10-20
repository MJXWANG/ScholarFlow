import { create } from 'zustand'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'tex' | 'bib' | 'png' | 'jpg' | 'jpeg' | 'pdf' | 'svg' | 'other'
  lastModified: Date
  isDirty: boolean
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
    case 'pdf': return 'pdf'
    case 'svg': return 'svg'
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
