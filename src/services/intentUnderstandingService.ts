import { OpenAI } from 'openai'
import DocumentAnalysisService from './documentAnalysisService'

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

  // 检测文档问题（增强版）
  static async detectDocumentIssues(documentContext: DocumentContext): Promise<{
    issues: Array<{
      type: 'format' | 'content' | 'structure' | 'citation' | 'language'
      severity: 'low' | 'medium' | 'high'
      message: string
      suggestion: string
      position?: number
      location?: string
      line?: number
    }>
    suggestions: string[]
    criticalCount?: number
    warningCount?: number
  }> {
    try {
      console.log('🔍 开始深度文档分析...')
      
      // 1. 先进行结构分析（本地快速分析）
      const structure = DocumentAnalysisService.analyzeStructure(documentContext.content)
      console.log('📊 文档结构分析完成:', structure.statistics)
      
      // 2. 使用规则引擎检测明显问题（本地）
      const localIssues = await DocumentAnalysisService.detectIssues(
        documentContext.content,
        structure
      )
      console.log(`⚠️ 发现 ${localIssues.issues.length} 个问题（本地检测）`)
      
      // 3. 使用AI进行深度内容分析（OpenAI API）
      let aiIssues: any[] = []
      if (OPENAI_API_KEY && documentContext.content.length > 100) {
        try {
          const prompt = `请深度分析以下学术文档的内容质量：

文档类型: ${documentContext.type}
文档领域: ${documentContext.field}
文档阶段: ${documentContext.stage}
总字数: ${structure.statistics.totalWordCount}
章节数: ${structure.statistics.totalSections}

文档大纲:
${structure.outline.slice(0, 15).join('\n')}

文档内容预览:
${documentContext.content.substring(0, 1200)}

请检测：
1. 逻辑问题 - 论述是否连贯、论证是否充分
2. 语言问题 - 表达是否清晰、用词是否准确
3. 学术规范 - 是否符合学术写作标准
4. 内容完整性 - 是否缺少关键章节或信息

返回JSON格式：
{
  "issues": [
    {
      "type": "content|language|citation|structure",
      "severity": "high|medium|low",
      "message": "问题描述",
      "suggestion": "具体改进建议",
      "location": "问题位置（章节名称）"
    }
  ],
  "suggestions": ["整体改进建议1", "整体改进建议2"]
}`

          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: '你是一个资深的学术审稿人，擅长发现文档中的深层次问题并提供专业建议。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1500
          })

          const aiResult = response.choices[0]?.message?.content || ''
          const parsed = JSON.parse(aiResult)
          aiIssues = parsed.issues || []
          
          console.log(`🤖 AI深度分析发现 ${aiIssues.length} 个问题`)
          
          // 合并建议
          const combinedSuggestions = [
            ...(parsed.suggestions || []),
            ...this.generateStructureSuggestions(structure)
          ]
          
          return {
            issues: [...localIssues.issues, ...aiIssues],
            suggestions: combinedSuggestions,
            criticalCount: localIssues.criticalCount,
            warningCount: localIssues.warningCount
          }
        } catch (aiError) {
          console.warn('AI分析失败，使用本地检测结果:', aiError)
        }
      }
      
      // 如果AI分析失败或未启用，返回本地检测结果
      return {
        issues: localIssues.issues,
        suggestions: this.generateStructureSuggestions(structure),
        criticalCount: localIssues.criticalCount,
        warningCount: localIssues.warningCount
      }
      
    } catch (error) {
      console.error('❌ 文档问题检测失败:', error)
      return {
        issues: [],
        suggestions: ['文档分析服务暂时不可用，请稍后重试']
      }
    }
  }
  
  // 生成结构相关建议
  private static generateStructureSuggestions(structure: any): string[] {
    const suggestions: string[] = []
    
    if (structure.statistics.emptySections > 0) {
      suggestions.push(`建议填充 ${structure.statistics.emptySections} 个空章节的内容`)
    }
    
    if (structure.statistics.totalSections < 3) {
      suggestions.push('建议增加章节数量，完善文档结构')
    }
    
    if (structure.statistics.totalWordCount < 500) {
      suggestions.push('建议扩充文档内容，目前内容较少')
    }
    
    if (structure.statistics.averageWordsPerSection < 100) {
      suggestions.push('各章节内容较少，建议增加详细描述')
    }
    
    return suggestions
  }

  // 主动建议（增强版 - 结合本地分析和AI）
  static async generateProactiveSuggestions(
    documentContext: DocumentContext,
    _userContext: UserContext
  ): Promise<{
    suggestions: Array<{
      type: 'content' | 'structure' | 'format' | 'citation' | 'quality'
      priority: 'low' | 'medium' | 'high'
      message: string
      action: string
      reason: string
    }>
    nextSteps: string[]
    fieldInfo?: {
      detectedField: string
      confidence: number
      suggestedCitations: string[]
    }
  }> {
    try {
      console.log('💡 开始生成主动建议...')
      
      // 1. 文档结构分析
      const structure = DocumentAnalysisService.analyzeStructure(documentContext.content)
      
      // 2. 学术领域识别（AI）
      let fieldInfo: any = null
      if (OPENAI_API_KEY && documentContext.content.length > 200) {
        try {
          const fieldDetection = await DocumentAnalysisService.detectField(documentContext.content)
          fieldInfo = {
            detectedField: fieldDetection.primaryField,
            confidence: fieldDetection.confidence,
            suggestedCitations: fieldDetection.suggestedCitations
          }
          console.log(`🎓 识别领域: ${fieldDetection.primaryField} (${(fieldDetection.confidence * 100).toFixed(0)}%)`)
        } catch (e) {
          console.warn('领域识别失败:', e)
        }
      }
      
      // 3. 质量评估（AI）
      let qualityScore: any = null
      if (OPENAI_API_KEY && documentContext.content.length > 200) {
        try {
          qualityScore = await DocumentAnalysisService.evaluateQuality(
            documentContext.content,
            structure
          )
          console.log(`📊 质量评分: ${qualityScore.overall}/10`)
        } catch (e) {
          console.warn('质量评估失败:', e)
        }
      }
      
      // 4. 生成本地建议
      const localSuggestions: any[] = []
      
      // 结构建议
      if (structure.statistics.emptySections > 0) {
        localSuggestions.push({
          type: 'structure',
          priority: 'high',
          message: `有 ${structure.statistics.emptySections} 个章节需要填充内容`,
          action: '点击章节标题开始撰写',
          reason: '完整的章节结构有助于读者理解'
        })
      }
      
      if (structure.statistics.totalSections < 3) {
        localSuggestions.push({
          type: 'structure',
          priority: 'high',
          message: '文档结构过于简单',
          action: '建议添加更多章节（引言、方法、结果、讨论等）',
          reason: '学术论文通常需要包含多个标准章节'
        })
      }
      
      // 内容建议
      if (structure.statistics.totalWordCount < 1000) {
        localSuggestions.push({
          type: 'content',
          priority: 'medium',
          message: '文档内容较少',
          action: `建议扩充内容至少到2000字（当前${structure.statistics.totalWordCount}字）`,
          reason: '充实的内容能够更好地阐述研究成果'
        })
      }
      
      // 引用建议
      const hasReferences = documentContext.content.toLowerCase().includes('reference') ||
                           documentContext.content.toLowerCase().includes('参考文献')
      if (!hasReferences && structure.statistics.totalWordCount > 500) {
        localSuggestions.push({
          type: 'citation',
          priority: 'high',
          message: '缺少参考文献章节',
          action: '添加"参考文献"章节并引用相关文献',
          reason: '学术论文必须引用前人研究成果'
        })
      }
      
      // 质量建议
      if (qualityScore) {
        if (qualityScore.structure < 7) {
          localSuggestions.push({
            type: 'structure',
            priority: 'medium',
            message: '文档结构需要改进',
            action: '重新组织章节顺序，确保逻辑清晰',
            reason: `当前结构评分: ${qualityScore.structure}/10`
          })
        }
        
        if (qualityScore.clarity < 7) {
          localSuggestions.push({
            type: 'quality',
            priority: 'medium',
            message: '表达清晰度可以提升',
            action: '使用更简洁明了的语言表达观点',
            reason: `当前清晰度评分: ${qualityScore.clarity}/10`
          })
        }
      }
      
      // 5. 使用AI生成深度建议（可选）
      let aiSuggestions: any[] = []
      if (OPENAI_API_KEY && documentContext.content.length > 200) {
        try {
          const prompt = `作为学术写作顾问，请为以下文档提供改进建议：

文档信息:
- 类型: ${documentContext.type}
- 识别领域: ${fieldInfo?.detectedField || documentContext.field}
- 写作阶段: ${documentContext.stage}
- 总字数: ${structure.statistics.totalWordCount}
- 章节数: ${structure.statistics.totalSections}

大纲结构:
${structure.outline.slice(0, 10).join('\n')}

质量评估:
${qualityScore ? `- 结构: ${qualityScore.structure}/10\n- 清晰度: ${qualityScore.clarity}/10\n- 连贯性: ${qualityScore.coherence}/10` : '暂无评估'}

请提供3-5条具体的改进建议，返回JSON：
{
  "suggestions": [
    {
      "type": "content|structure|format|citation|quality",
      "priority": "high|medium|low",
      "message": "简短的建议描述",
      "action": "具体的行动建议",
      "reason": "建议理由"
    }
  ],
  "nextSteps": ["下一步行动1", "下一步行动2"]
}`

          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: '你是一位资深的学术写作导师，擅长提供具体可行的改进建议。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })

          const aiResult = response.choices[0]?.message?.content || ''
          const parsed = JSON.parse(aiResult)
          aiSuggestions = parsed.suggestions || []
          
          console.log(`🤖 AI生成了 ${aiSuggestions.length} 条建议`)
          
          // 返回合并的建议
          return {
            suggestions: [...localSuggestions, ...aiSuggestions],
            nextSteps: parsed.nextSteps || this.generateNextSteps(structure, documentContext.stage),
            fieldInfo
          }
        } catch (aiError) {
          console.warn('AI建议生成失败，使用本地建议:', aiError)
        }
      }
      
      // 返回本地建议
      return {
        suggestions: localSuggestions,
        nextSteps: this.generateNextSteps(structure, documentContext.stage),
        fieldInfo
      }
      
    } catch (error) {
      console.error('❌ 主动建议生成失败:', error)
      return {
        suggestions: [],
        nextSteps: ['继续完善文档内容']
      }
    }
  }
  
  // 生成下一步行动建议
  private static generateNextSteps(structure: any, stage: string): string[] {
    const nextSteps: string[] = []
    
    switch (stage) {
      case 'outline':
        nextSteps.push('完善大纲结构')
        if (structure.statistics.emptySections > 0) {
          nextSteps.push('填充空章节的内容')
        }
        nextSteps.push('添加每个章节的详细说明')
        break
      
      case 'writing':
        nextSteps.push('继续撰写未完成的章节')
        nextSteps.push('确保内容连贯性')
        nextSteps.push('添加必要的引用')
        break
      
      case 'editing':
        nextSteps.push('检查语言表达是否清晰')
        nextSteps.push('优化段落结构')
        nextSteps.push('完善参考文献')
        break
      
      case 'finalizing':
        nextSteps.push('最后检查格式规范')
        nextSteps.push('确认引用格式一致')
        nextSteps.push('准备提交')
        break
      
      default:
        nextSteps.push('开始撰写文档内容')
        nextSteps.push('建立清晰的文档结构')
    }
    
    return nextSteps
  }
}

export default IntentUnderstandingService
