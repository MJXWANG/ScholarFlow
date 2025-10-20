import { create } from 'zustand'
import { LaTeXCompiler, CompilationResult } from '../services/latexCompiler'

interface CompilationState {
  isCompiling: boolean
  lastResult: CompilationResult | null
  compilationHistory: CompilationResult[]
  
  // Actions
  compileProject: (projectFiles: { name: string; content: string }[], mainFile?: string) => Promise<void>
  clearHistory: () => void
  getLastSuccessfulResult: () => CompilationResult | null
}

export const useCompilationStore = create<CompilationState>((set, get) => ({
  isCompiling: false,
  lastResult: null,
  compilationHistory: [],

  compileProject: async (projectFiles, mainFile = 'main.tex') => {
    set({ isCompiling: true })
    
    try {
      const compiler = LaTeXCompiler.getInstance()
      const result = await compiler.compileProject(projectFiles, mainFile)
      
      set(state => ({
        isCompiling: false,
        lastResult: result,
        compilationHistory: [...state.compilationHistory, result]
      }))
    } catch (error) {
      const errorResult: CompilationResult = {
        success: false,
        errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
      
      set(state => ({
        isCompiling: false,
        lastResult: errorResult,
        compilationHistory: [...state.compilationHistory, errorResult]
      }))
    }
  },

  clearHistory: () => {
    set({
      compilationHistory: [],
      lastResult: null
    })
  },

  getLastSuccessfulResult: () => {
    const state = get()
    const successfulResults = state.compilationHistory.filter(result => result.success)
    return successfulResults.length > 0 ? successfulResults[successfulResults.length - 1] : null
  }
}))
