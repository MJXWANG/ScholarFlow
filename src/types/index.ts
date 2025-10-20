export interface AIMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    action?: string
    fileId?: string
    suggestions?: string[]
  }
}

export interface AIAssistantState {
  messages: AIMessage[]
  isTyping: boolean
  isConnected: boolean
  
  // Actions
  sendMessage: (content: string, metadata?: any) => Promise<void>
  clearMessages: () => void
  setTyping: (isTyping: boolean) => void
}

export interface LaTeXCompilationResult {
  success: boolean
  pdfPath?: string
  errors?: string[]
  warnings?: string[]
  log?: string
}

export interface EditorState {
  content: string
  language: 'latex' | 'bibtex' | 'plain'
  isDirty: boolean
  cursorPosition: { line: number; column: number }
  
  // Actions
  updateContent: (content: string) => void
  setCursorPosition: (position: { line: number; column: number }) => void
  markClean: () => void
  markDirty: () => void
}
