import { OpenAI } from 'openai'

// 初始化OpenAI客户端
const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || ''
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// 检查API密钥是否配置
if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.')
}

// 文档上下文接口
export interface DocumentContext {
  content: string
  type: 'research' | 'review' | 'thesis' | 'proposal'
  field: string
  stage: 'outline' | 'writing' | 'editing' | 'finalizing'
  currentSection?: string
  wordCount: number
  lastModified: Date
}

// 用户上下文接口
export interface UserContext {
  expertise: 'beginner' | 'intermediate' | 'expert'
  preferences: {
    language: 'chinese' | 'english'
    style: 'academic' | 'formal' | 'casual'
    field: string
    targetAudience: 'general' | 'expert' | 'student'
  }
  history: string[]
}

// 意图类型枚举
export enum IntentType {
  GENERATE = 'generate',
  MODIFY = 'modify', 
  FORMAT = 'format',
  CITE = 'cite',
  COLLABORATE = 'collaborate',
  ANALYZE = 'analyze',
  SUGGEST = 'suggest',
  HELP = 'help'
}

// 目标类型枚举
export enum TargetType {
  OUTLINE = 'outline',
  CONTENT = 'content',
  CITATION = 'citation',
  FORMAT = 'format',
  STRUCTURE = 'structure',
  LANGUAGE = 'language',
  REFERENCE = 'reference'
}

// 意图接口
export interface Intent {
  type: IntentType
  target: TargetType
  parameters: Record<string, any>
  confidence: number
  originalInput: string
  suggestedActions?: string[]
}

// AI响应接口
export interface AIResponse {
  message: string
  intent: Intent
  actions: AIAction[]
  suggestions?: string[]
  followUpQuestions?: string[]
}

// AI行动接口
export interface AIAction {
  type: 'generate' | 'modify' | 'format' | 'analyze' | 'suggest' | 'create_file' | 'insert_content' | 'save_file'
  target: string
  parameters: Record<string, any>
  description: string
  execute: () => Promise<any>
  autoExecute?: boolean // 是否自动执行
}

// 意图理解服务类
export class IntentUnderstandingService {
  
  // 理解用户意图
  static async parseUserIntent(
    userInput: string, 
    documentContext: DocumentContext,
    userContext: UserContext
  ): Promise<Intent> {
    try {
      // 检查API密钥
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      const prompt = this.buildIntentPrompt(userInput, documentContext, userContext)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的科研写作AI助手。你的任务是理解用户的自然语言输入，并将其转换为结构化的意图。

请分析用户的输入并返回JSON格式的意图，包含以下字段：
- type: 意图类型 (generate, modify, format, cite, collaborate, analyze, suggest, help)
- target: 目标类型 (outline, content, citation, format, structure, language, reference)
- parameters: 相关参数对象
- confidence: 置信度 (0-1)
- originalInput: 原始输入
- suggestedActions: 建议的行动列表

意图类型说明：
- generate: 生成新内容（大纲、段落、引用等）
- modify: 修改现有内容
- format: 格式化文档
- cite: 处理引用和参考文献
- collaborate: 协作相关操作
- analyze: 分析文档或内容
- suggest: 提供建议
- help: 寻求帮助

目标类型说明：
- outline: 大纲相关
- content: 内容相关
- citation: 引用相关
- format: 格式相关
- structure: 结构相关
- language: 语言相关
- reference: 参考文献相关`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content || ''
      return this.parseIntentResponse(content, userInput)
    } catch (error) {
      console.error('Error parsing user intent:', error)
      
      // 根据错误类型提供不同的反馈
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return {
            type: IntentType.HELP,
            target: TargetType.CONTENT,
            parameters: {},
            confidence: 0.5,
            originalInput: userInput,
            suggestedActions: ['请配置OpenAI API密钥', '检查网络连接']
          }
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return {
            type: IntentType.HELP,
            target: TargetType.CONTENT,
            parameters: {},
            confidence: 0.5,
            originalInput: userInput,
            suggestedActions: ['请检查网络连接', '稍后重试']
          }
        }
      }
      
      // 返回默认意图
      return {
        type: IntentType.HELP,
        target: TargetType.CONTENT,
        parameters: {},
        confidence: 0.5,
        originalInput: userInput,
        suggestedActions: ['请重新描述你的需求', '检查网络连接']
      }
    }
  }

  // 构建意图理解提示词
  private static buildIntentPrompt(
    userInput: string,
    documentContext: DocumentContext,
    userContext: UserContext
  ): string {
    return `用户输入: "${userInput}"

文档上下文:
- 类型: ${documentContext.type}
- 领域: ${documentContext.field}
- 阶段: ${documentContext.stage}
- 当前章节: ${documentContext.currentSection || '未指定'}
- 字数: ${documentContext.wordCount}
- 内容预览: ${documentContext.content.substring(0, 200)}...

用户上下文:
- 专业水平: ${userContext.expertise}
- 语言偏好: ${userContext.preferences.language}
- 写作风格: ${userContext.preferences.style}
- 目标受众: ${userContext.preferences.targetAudience}

请分析用户的意图并返回JSON格式的结果。`
  }

  // 解析意图响应
  private static parseIntentResponse(content: string, originalInput: string): Intent {
    try {
      const parsed = JSON.parse(content)
      return {
        type: parsed.type || IntentType.HELP,
        target: parsed.target || TargetType.CONTENT,
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0.7,
        originalInput,
        suggestedActions: parsed.suggestedActions || []
      }
    } catch (error) {
      console.error('Error parsing intent response:', error)
      return {
        type: IntentType.HELP,
        target: TargetType.CONTENT,
        parameters: {},
        confidence: 0.5,
        originalInput,
        suggestedActions: ['请重新描述你的需求']
      }
    }
  }

  // 生成AI响应
  static async generateAIResponse(
    intent: Intent,
    documentContext: DocumentContext,
    userContext: UserContext
  ): Promise<AIResponse> {
    try {
      // 检查API密钥
      if (!OPENAI_API_KEY) {
        return {
          message: '请先配置OpenAI API密钥。请在项目根目录创建.env文件并添加VITE_OPENAI_API_KEY=your_api_key',
          intent,
          actions: [],
          suggestions: ['配置API密钥', '检查环境变量设置']
        }
      }

      const prompt = this.buildResponsePrompt(intent, documentContext, userContext)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的科研写作AI助手。根据用户的意图，生成合适的响应和行动建议。

请返回JSON格式的响应，包含：
- message: 友好的回复消息（包含完整的内容）
- actions: 建议的行动列表
- suggestions: 额外的建议
- followUpQuestions: 后续问题

响应应该：
1. 理解用户的真实需求
2. 提供具体的帮助
3. 主动建议相关操作
4. 保持专业和友好的语调

特别重要：
- 如果用户要求生成大纲，请在message字段中直接生成完整的大纲内容，并在actions字段中添加自动插入内容的行动
- 如果用户要求润色文本，请在message字段中直接提供润色后的内容，并在actions字段中添加自动替换内容的行动
- 如果用户要求检查格式，请在message字段中直接指出问题并提供修正建议
- 优先提供具体的帮助，而不是继续询问细节
- 对于学术写作，要提供专业、结构化的内容
- 确保message字段包含完整的内容，不要截断
- 在actions字段中添加自动执行的行动，如insert_content、create_file等
- 行动的autoExecute字段默认为true，表示自动执行`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })

      const content = response.choices[0]?.message?.content || ''
      return this.parseResponseResponse(content, intent)
    } catch (error) {
      console.error('Error generating AI response:', error)
      
      // 根据错误类型提供不同的反馈
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('401')) {
          return {
            message: 'API密钥配置有误。请检查VITE_OPENAI_API_KEY是否正确设置。',
            intent,
            actions: [],
            suggestions: ['检查API密钥', '重新配置环境变量']
          }
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return {
            message: '网络连接出现问题。请检查网络连接后重试。',
            intent,
            actions: [],
            suggestions: ['检查网络连接', '稍后重试']
          }
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
          return {
            message: 'API使用量超限。请检查OpenAI账户余额或稍后重试。',
            intent,
            actions: [],
            suggestions: ['检查账户余额', '稍后重试']
          }
        }
      }
      
      return {
        message: '抱歉，我遇到了一些问题。请重新描述你的需求。',
        intent,
        actions: [],
        suggestions: ['请检查网络连接', '重新描述你的需求']
      }
    }
  }

  // 构建响应生成提示词
  private static buildResponsePrompt(
    intent: Intent,
    documentContext: DocumentContext,
    userContext: UserContext
  ): string {
    return `用户意图分析结果:
- 意图类型: ${intent.type}
- 目标: ${intent.target}
- 参数: ${JSON.stringify(intent.parameters)}
- 置信度: ${intent.confidence}
- 原始输入: "${intent.originalInput}"

文档上下文:
- 类型: ${documentContext.type}
- 领域: ${documentContext.field}
- 阶段: ${documentContext.stage}
- 当前章节: ${documentContext.currentSection || '未指定'}

用户偏好:
- 语言: ${userContext.preferences.language}
- 风格: ${userContext.preferences.style}
- 受众: ${userContext.preferences.targetAudience}

请生成合适的AI响应和行动建议。

特别说明：
- 如果用户要求生成大纲，请直接生成完整的大纲内容，不要继续询问
- 如果用户要求润色文本，请直接提供润色后的内容
- 如果用户要求检查格式，请直接指出问题并提供修正建议
- 优先提供具体的帮助，而不是继续询问细节`
  }

  // 解析响应结果
  private static parseResponseResponse(content: string, intent: Intent): AIResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        message: parsed.message || '我来帮助你完成这个任务。',
        intent,
        actions: parsed.actions || [],
        suggestions: parsed.suggestions || [],
        followUpQuestions: parsed.followUpQuestions || []
      }
    } catch (error) {
      console.error('Error parsing response:', error)
      console.log('Raw response content:', content)
      
      // 如果JSON解析失败，尝试直接使用原始内容
      if (content.trim()) {
        return {
          message: content,
          intent,
          actions: [],
          suggestions: ['如果内容不完整，请重新请求']
        }
      }
      
      return {
        message: '我来帮助你完成这个任务。',
        intent,
        actions: [],
        suggestions: ['请提供更多详细信息']
      }
    }
  }

  // 检测文档问题
  static async detectDocumentIssues(documentContext: DocumentContext): Promise<{
    issues: Array<{
      type: 'format' | 'content' | 'structure' | 'citation'
      severity: 'low' | 'medium' | 'high'
      message: string
      suggestion: string
      position?: number
    }>
    suggestions: string[]
  }> {
    try {
      const prompt = `请分析以下文档并检测问题：

文档内容: ${documentContext.content.substring(0, 1000)}...
文档类型: ${documentContext.type}
文档领域: ${documentContext.field}
文档阶段: ${documentContext.stage}

请检测以下类型的问题：
1. 格式问题（引用格式、段落结构等）
2. 内容问题（逻辑不清晰、缺少关键信息等）
3. 结构问题（章节顺序、大纲完整性等）
4. 引用问题（缺少引用、格式错误等）

返回JSON格式：
{
  "issues": [
    {
      "type": "format|content|structure|citation",
      "severity": "low|medium|high",
      "message": "问题描述",
      "suggestion": "解决建议",
      "position": 位置（可选）
    }
  ],
  "suggestions": ["建议1", "建议2"]
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术编辑，擅长检测文档中的问题并提供改进建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content || ''
      return JSON.parse(content)
    } catch (error) {
      console.error('Error detecting document issues:', error)
      return {
        issues: [],
        suggestions: ['请检查文档内容']
      }
    }
  }

  // 主动建议
  static async generateProactiveSuggestions(
    documentContext: DocumentContext,
    userContext: UserContext
  ): Promise<{
    suggestions: Array<{
      type: 'content' | 'structure' | 'format' | 'citation'
      priority: 'low' | 'medium' | 'high'
      message: string
      action: string
      reason: string
    }>
    nextSteps: string[]
  }> {
    try {
      const prompt = `基于以下文档和用户信息，提供主动建议：

文档信息:
- 类型: ${documentContext.type}
- 领域: ${documentContext.field}
- 阶段: ${documentContext.stage}
- 字数: ${documentContext.wordCount}
- 内容预览: ${documentContext.content.substring(0, 500)}...

用户信息:
- 专业水平: ${userContext.expertise}
- 语言偏好: ${userContext.preferences.language}
- 写作风格: ${userContext.preferences.style}

请提供主动建议，包括：
1. 内容改进建议
2. 结构优化建议
3. 格式完善建议
4. 引用补充建议

返回JSON格式：
{
  "suggestions": [
    {
      "type": "content|structure|format|citation",
      "priority": "low|medium|high",
      "message": "建议描述",
      "action": "具体行动",
      "reason": "建议理由"
    }
  ],
  "nextSteps": ["下一步1", "下一步2"]
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术写作顾问，能够主动发现文档中的改进机会并提供具体建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })

      const content = response.choices[0]?.message?.content || ''
      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating proactive suggestions:', error)
      return {
        suggestions: [],
        nextSteps: ['继续完善文档内容']
      }
    }
  }
}

export default IntentUnderstandingService
