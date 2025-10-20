import { create } from 'zustand'
import { AIService, OutlineRequest, OutlineResponse, ContentRequest, ContentResponse, PolishRequest, PolishResponse } from '../services/aiService'
import { IntentUnderstandingService, Intent, AIResponse, DocumentContext, UserContext, AIAction } from '../services/intentUnderstandingService'
import { aiExecutionEngine } from '../services/aiExecutionEngine'

// AI功能状态接口
interface AIState {
  // 加载状态
  isGeneratingOutline: boolean
  isGeneratingContent: boolean
  isPolishingText: boolean
  isProcessingIntent: boolean
  
  // 当前操作
  currentOperation: 'outline' | 'content' | 'polish' | 'intent' | null
  
  // 生成结果
  outlineResult: OutlineResponse | null
  contentResult: ContentResponse | null
  polishResult: PolishResponse | null
  
  // 智能对话相关
  currentIntent: Intent | null
  aiResponse: AIResponse | null
  conversationHistory: Array<{
    user: string
    ai: string
    intent?: Intent
    timestamp: Date
  }>
  
  // 文档上下文
  documentContext: DocumentContext | null
  
  // 用户上下文
  userContext: UserContext
  
  // 主动建议
  proactiveSuggestions: Array<{
    type: 'content' | 'structure' | 'format' | 'citation'
    priority: 'low' | 'medium' | 'high'
    message: string
    action: string
    reason: string
  }>
  
  // 文档问题
  documentIssues: Array<{
    type: 'format' | 'content' | 'structure' | 'citation'
    severity: 'low' | 'medium' | 'high'
    message: string
    suggestion: string
    position?: number
  }>
  
  // 错误状态
  error: string | null
  
  // 历史记录
  outlineHistory: OutlineResponse[]
  contentHistory: ContentResponse[]
  polishHistory: PolishResponse[]
  
  // 用户偏好
  preferences: {
    language: 'chinese' | 'english'
    style: 'academic' | 'formal' | 'casual'
    field: string
    targetAudience: 'general' | 'expert' | 'student'
  }
}

// AI功能操作接口
interface AIActions {
  // 生成大纲
  generateOutline: (request: OutlineRequest) => Promise<void>
  
  // 生成内容
  generateContent: (request: ContentRequest) => Promise<void>
  
  // 润色文本
  polishText: (request: PolishRequest) => Promise<void>
  
  // 智能对话相关
  processUserInput: (userInput: string) => Promise<void>
  updateDocumentContext: (context: DocumentContext) => void
  updateUserContext: (context: Partial<UserContext>) => void
  
  // 主动建议和问题检测
  generateProactiveSuggestions: () => Promise<void>
  detectDocumentIssues: () => Promise<void>
  
  // 自动化执行
  executeAIActions: (actions: AIAction[]) => Promise<void>
  setFileSystemStore: (store: any) => void
  
  // 对话历史管理
  addToConversationHistory: (user: string, ai: string, intent?: Intent) => void
  clearConversationHistory: () => void
  
  // 清除错误
  clearError: () => void
  
  // 清除结果
  clearResults: () => void
  
  // 更新偏好
  updatePreferences: (preferences: Partial<AIState['preferences']>) => void
  
  // 保存到历史
  saveToHistory: (type: 'outline' | 'content' | 'polish', result: any) => void
  
  // 从历史加载
  loadFromHistory: (type: 'outline' | 'content' | 'polish', index: number) => void
}

// 创建AI状态管理
export const useAIStore = create<AIState & AIActions>((set, get) => ({
  // 初始状态
  isGeneratingOutline: false,
  isGeneratingContent: false,
  isPolishingText: false,
  isProcessingIntent: false,
  currentOperation: null,
  outlineResult: null,
  contentResult: null,
  polishResult: null,
  
  // 智能对话相关
  currentIntent: null,
  aiResponse: null,
  conversationHistory: [],
  
  // 上下文
  documentContext: null,
  userContext: {
    expertise: 'intermediate',
    preferences: {
      language: 'chinese',
      style: 'academic',
      field: 'computer science',
      targetAudience: 'expert'
    },
    history: []
  },
  
  // 主动建议和问题
  proactiveSuggestions: [],
  documentIssues: [],
  
  error: null,
  outlineHistory: [],
  contentHistory: [],
  polishHistory: [],
  preferences: {
    language: 'chinese',
    style: 'academic',
    field: 'computer science',
    targetAudience: 'expert'
  },

  // 生成大纲
  generateOutline: async (request: OutlineRequest) => {
    set({ 
      isGeneratingOutline: true, 
      currentOperation: 'outline',
      error: null 
    })
    
    try {
      const result = await AIService.generateOutline(request)
      set({ 
        outlineResult: result,
        isGeneratingOutline: false,
        currentOperation: null
      })
      
      // 保存到历史
      get().saveToHistory('outline', result)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate outline',
        isGeneratingOutline: false,
        currentOperation: null
      })
    }
  },

  // 生成内容
  generateContent: async (request: ContentRequest) => {
    set({ 
      isGeneratingContent: true, 
      currentOperation: 'content',
      error: null 
    })
    
    try {
      const result = await AIService.generateContent(request)
      set({ 
        contentResult: result,
        isGeneratingContent: false,
        currentOperation: null
      })
      
      // 保存到历史
      get().saveToHistory('content', result)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate content',
        isGeneratingContent: false,
        currentOperation: null
      })
    }
  },

  // 润色文本
  polishText: async (request: PolishRequest) => {
    set({ 
      isPolishingText: true, 
      currentOperation: 'polish',
      error: null 
    })
    
    try {
      const result = await AIService.polishText(request)
      set({ 
        polishResult: result,
        isPolishingText: false,
        currentOperation: null
      })
      
      // 保存到历史
      get().saveToHistory('polish', result)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to polish text',
        isPolishingText: false,
        currentOperation: null
      })
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),

  // 清除结果
  clearResults: () => set({ 
    outlineResult: null,
    contentResult: null,
    polishResult: null
  }),

  // 更新偏好
  updatePreferences: (newPreferences) => {
    set(state => ({
      preferences: { ...state.preferences, ...newPreferences }
    }))
  },

  // 保存到历史
  saveToHistory: (type, result) => {
    set(state => {
      const historyKey = `${type}History` as keyof AIState
      const history = state[historyKey] as any[]
      
      return {
        [historyKey]: [result, ...history.slice(0, 9)] // 保留最近10条记录
      }
    })
  },

  // 从历史加载
  loadFromHistory: (type, index) => {
    const state = get()
    const historyKey = `${type}History` as keyof AIState
    const history = state[historyKey] as any[]
    
    if (history[index]) {
      const resultKey = `${type}Result` as keyof AIState
      set({ [resultKey]: history[index] })
    }
  },

  // 处理用户输入
  processUserInput: async (userInput: string) => {
    set({ 
      isProcessingIntent: true, 
      currentOperation: 'intent',
      error: null 
    })
    
    try {
      const state = get()
      let documentContext = state.documentContext
      const userContext = state.userContext
      
      // 如果没有文档上下文，创建一个默认的
      if (!documentContext) {
        documentContext = {
          content: '',
          type: 'research',
          field: 'computer science',
          stage: 'outline',
          wordCount: 0,
          lastModified: new Date()
        }
        set({ documentContext })
      }
      
      // 理解用户意图
      const intent = await IntentUnderstandingService.parseUserIntent(
        userInput, 
        documentContext, 
        userContext
      )
      
      // 生成AI响应
      const aiResponse = await IntentUnderstandingService.generateAIResponse(
        intent,
        documentContext,
        userContext
      )
      
      set({ 
        currentIntent: intent,
        aiResponse,
        isProcessingIntent: false,
        currentOperation: null
      })
      
      // 添加到对话历史
      get().addToConversationHistory(userInput, aiResponse.message, intent)
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process user input',
        isProcessingIntent: false,
        currentOperation: null
      })
    }
  },

  // 更新文档上下文
  updateDocumentContext: (context: DocumentContext) => {
    set({ documentContext: context })
  },

  // 更新用户上下文
  updateUserContext: (newContext: Partial<UserContext>) => {
    set(state => ({
      userContext: { ...state.userContext, ...newContext }
    }))
  },

  // 生成主动建议
  generateProactiveSuggestions: async () => {
    try {
      const state = get()
      const documentContext = state.documentContext
      const userContext = state.userContext
      
      if (!documentContext) return
      
      const result = await IntentUnderstandingService.generateProactiveSuggestions(
        documentContext,
        userContext
      )
      
      set({ proactiveSuggestions: result.suggestions })
    } catch (error) {
      console.error('Error generating proactive suggestions:', error)
    }
  },

  // 检测文档问题
  detectDocumentIssues: async () => {
    try {
      const state = get()
      const documentContext = state.documentContext
      
      if (!documentContext) return
      
      const result = await IntentUnderstandingService.detectDocumentIssues(documentContext)
      
      set({ documentIssues: result.issues })
    } catch (error) {
      console.error('Error detecting document issues:', error)
    }
  },

  // 添加到对话历史
  addToConversationHistory: (user: string, ai: string, intent?: Intent) => {
    set(state => ({
      conversationHistory: [
        ...state.conversationHistory,
        {
          user,
          ai,
          intent,
          timestamp: new Date()
        }
      ].slice(-50) // 保留最近50条记录
    }))
  },

  // 清除对话历史
  clearConversationHistory: () => {
    set({ conversationHistory: [] })
  },

  // 执行AI行动
  executeAIActions: async (actions: AIAction[]) => {
    try {
      await aiExecutionEngine.executeActions(actions)
      console.log('AI行动执行完成')
    } catch (error) {
      console.error('执行AI行动失败:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to execute AI actions'
      })
    }
  },

  // 设置文件系统store
  setFileSystemStore: (store: any) => {
    aiExecutionEngine.setFileSystemStore(store)
  }
}))

// 导出类型
export type AIStore = ReturnType<typeof useAIStore>
