import { create } from 'zustand'

export interface Project {
  id: string
  name: string
  path: string
  files: ProjectFile[]
  currentFile?: string
  lastModified: Date
}

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'tex' | 'bib' | 'png' | 'pdf' | 'other'
  lastModified: Date
}

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean
  
  // Actions
  createProject: (name: string, path: string) => void
  openProject: (project: Project) => void
  closeProject: () => void
  updateFile: (fileId: string, content: string) => void
  setCurrentFile: (fileId: string) => void
  addFile: (file: ProjectFile) => void
  removeFile: (fileId: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  isLoading: false,

  createProject: (name: string, path: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      path,
      files: [],
      lastModified: new Date()
    }
    
    set(state => ({
      projects: [...state.projects, newProject],
      currentProject: newProject
    }))
  },

  openProject: (project: Project) => {
    set({ currentProject: project })
  },

  closeProject: () => {
    set({ currentProject: null })
  },

  updateFile: (fileId: string, content: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.map(file =>
        file.id === fileId ? { ...file, content, lastModified: new Date() } : file
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
      currentProject: { ...state.currentProject, currentFile: fileId }
    })
  },

  addFile: (file: ProjectFile) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: [...state.currentProject.files, file],
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  },

  removeFile: (fileId: string) => {
    const state = get()
    if (!state.currentProject) return

    const updatedProject = {
      ...state.currentProject,
      files: state.currentProject.files.filter(file => file.id !== fileId),
      lastModified: new Date()
    }

    set({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    })
  }
}))
