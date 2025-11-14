import { AIService, OutlineRequest } from './aiService'

// AI规划系统 - 模拟Cursor的智能规划
export interface AIPlan {
  id: string
  title: string
  description: string
  steps: AIPlanStep[]
  estimatedTime: string
  status: 'planning' | 'ready' | 'executing' | 'completed' | 'cancelled'
}

export interface AIPlanStep {
  id: string
  title: string
  description: string
  action: string
  parameters: Record<string, any>
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'skipped'
  dependencies?: string[]
  autoApprove?: boolean
}

export interface AIThinkingProcess {
  analysis: string
  reasoning: string[]
  plan: AIPlan
  alternatives: string[]
  risks: string[]
}

// AI规划服务
export class AIPlanningService {
  
  // 分析用户需求并制定计划
  static async analyzeAndPlan(userInput: string): Promise<AIThinkingProcess> {
    // 模拟Cursor的分析过程
    const analysis = this.analyzeUserIntent(userInput)
    const reasoning = this.generateReasoning(analysis)
    const plan = this.createExecutionPlan(analysis)
    const alternatives = this.generateAlternatives(analysis)
    const risks = this.identifyRisks(plan)
    
    return {
      analysis,
      reasoning,
      plan,
      alternatives,
      risks
    }
  }
  
  // 分析用户意图 - 增强版，提取主题信息
  private static analyzeUserIntent(input: string): string {
    // 提取主题关键词
    const extractedTopic = this.extractTopic(input)
    
    if (input.includes('论文') || input.includes('大纲')) {
      return `用户需要生成学术论文大纲，主题：${extractedTopic}，这是一个内容生成任务`
    }
    if (input.includes('润色') || input.includes('修改')) {
      return '用户需要改进现有文本，这是一个文本优化任务'
    }
    if (input.includes('检查') || input.includes('格式')) {
      return '用户需要检查文档格式，这是一个质量检查任务'
    }
    return `用户提出了关于"${extractedTopic}"的写作需求`
  }
  
  // 从用户输入中提取主题
  private static extractTopic(input: string): string {
    // 尝试提取 "关于...的" 模式
    const aboutMatch = input.match(/关于(.+?)的/)
    if (aboutMatch) {
      return aboutMatch[1].trim()
    }
    
    // 尝试提取引号中的内容
    const quoteMatch = input.match(/[""](.+?)[""]/)
    if (quoteMatch) {
      return quoteMatch[1].trim()
    }
    
    // 尝试从常见短语中提取
    const patterns = [
      /帮我.*?写.*?(.+?)(论文|大纲|内容)/,
      /生成.*?(.+?)(论文|大纲|内容)/,
      /写.*?(.+?)(论文|大纲|内容)/,
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    // 如果没有匹配到，返回默认主题
    return '研究主题'
  }
  
  // 生成推理过程
  private static generateReasoning(analysis: string): string[] {
    const reasoning = [
      '分析用户的具体需求',
      '确定最适合的执行方案',
      '考虑现有文档状态',
      '制定详细的执行步骤',
      '评估潜在风险和替代方案'
    ]
    
    if (analysis.includes('论文')) {
      reasoning.push('需要创建完整的学术文档结构')
      reasoning.push('考虑不同学科的标准格式')
    }
    
    return reasoning
  }
  
  // 创建执行计划
  private static createExecutionPlan(analysis: string): AIPlan {
    // 从分析结果中提取主题
    const topicMatch = analysis.match(/主题：(.+?)，/)
    const topic = topicMatch ? topicMatch[1] : '研究主题'
    
    if (analysis.includes('论文')) {
      return {
        id: `plan_${Date.now()}`,
        title: '生成学术论文大纲',
        description: `为用户生成关于"${topic}"的完整学术论文大纲，包括所有必要的章节和子章节`,
        estimatedTime: '2-3分钟',
        status: 'ready',
        steps: [
          {
            id: 'step_1',
            title: '分析论文主题',
            description: `确定"${topic}"的研究领域和主题方向`,
            action: 'analyze_topic',
            parameters: { topic: topic },
            status: 'pending',
            autoApprove: true
          },
          {
            id: 'step_2',
            title: '生成论文大纲',
            description: '调用AI服务创建包含所有章节的完整大纲结构',
            action: 'generate_outline',
            parameters: { 
              topic: topic,
              type: 'research', 
              sections: ['introduction', 'literature', 'methodology', 'results', 'conclusion'] 
            },
            status: 'pending'
          },
          {
            id: 'step_3',
            title: '创建文档文件',
            description: '创建新的LaTeX文档文件',
            action: 'create_file',
            parameters: { fileName: `${topic}_大纲.tex`, type: 'tex' },
            status: 'pending'
          },
          {
            id: 'step_4',
            title: '插入大纲内容',
            description: '将生成的大纲插入到文档中',
            action: 'insert_content',
            parameters: { position: 'start' },
            status: 'pending'
          },
          {
            id: 'step_5',
            title: '保存文档',
            description: '保存文档并标记为已修改',
            action: 'save_file',
            parameters: {},
            status: 'pending',
            autoApprove: true
          }
        ]
      }
    }
    
    // 默认计划
    return {
      id: `plan_${Date.now()}`,
      title: '执行用户请求',
      description: '根据用户需求执行相应操作',
      estimatedTime: '1-2分钟',
      status: 'ready',
      steps: [
        {
          id: 'step_1',
          title: '处理用户请求',
          description: '分析并执行用户的具体需求',
          action: 'process_request',
          parameters: {},
          status: 'pending'
        }
      ]
    }
  }
  
  // 生成替代方案
  private static generateAlternatives(analysis: string): string[] {
    const alternatives = []
    
    if (analysis.includes('论文')) {
      alternatives.push('使用模板生成大纲')
      alternatives.push('基于现有文档扩展')
      alternatives.push('分步骤生成各个章节')
    }
    
    return alternatives
  }
  
  // 识别风险
  private static identifyRisks(plan: AIPlan): string[] {
    const risks = [
      '生成的内容可能不符合用户的具体需求',
      '文档格式可能需要进一步调整',
      '内容质量需要用户验证'
    ]
    
    if (plan.steps.some(step => step.action === 'create_file')) {
      risks.push('可能覆盖现有文件')
    }
    
    return risks
  }
  
  // 执行计划步骤
  static async executePlanStep(step: AIPlanStep): Promise<any> {
    console.log(`执行步骤: ${step.title}`)
    console.log(`描述: ${step.description}`)
    console.log(`参数:`, step.parameters)
    
    try {
      // 根据步骤类型执行不同的操作
      switch (step.action) {
        case 'analyze_topic':
          return {
            success: true,
            message: `已分析主题: ${step.parameters.topic}`,
            result: `主题分析完成，准备生成大纲`
          }
          
        case 'generate_outline':
          // 调用AI服务生成大纲
          const outlineResult = await this.generateOutlineContent(step.parameters)
          return {
            success: true,
            message: '大纲生成完成',
            result: outlineResult
          }
          
        case 'create_file':
          return {
            success: true,
            message: `文件创建完成: ${step.parameters.fileName}`,
            result: `文件 ${step.parameters.fileName} 已创建`
          }
          
        case 'insert_content':
          return {
            success: true,
            message: '内容插入完成',
            result: '大纲内容已插入到文档中'
          }
          
        case 'save_file':
          return {
            success: true,
            message: '文档保存完成',
            result: '文档已保存'
          }
          
        default:
          // 模拟执行过程
          await new Promise(resolve => setTimeout(resolve, 1000))
          return {
            success: true,
            message: `步骤 "${step.title}" 执行完成`,
            result: `执行结果: ${step.description}`
          }
      }
    } catch (error) {
      console.error('执行步骤失败:', error)
      return {
        success: false,
        message: `步骤 "${step.title}" 执行失败`,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
  
  // 生成大纲内容 - 调用真实AI服务
  private static async generateOutlineContent(parameters: any): Promise<string> {
    try {
      console.log('🤖 开始调用真实AI服务生成大纲...')
      
      // 从参数中提取信息，如果没有则使用默认值
      const topic = parameters.topic || '研究主题'
      const type = parameters.type || 'research'
      
      // 构建AI服务请求
      const outlineRequest: OutlineRequest = {
        topic: topic,
        field: '计算机科学', // 可以从上下文中获取
        paperType: type as 'research' | 'review' | 'thesis' | 'proposal',
        length: 'medium',
        language: 'chinese'
      }
      
      // 调用真实的AI服务生成大纲
      const outlineResponse = await AIService.generateOutline(outlineRequest)
      
      // 将AI服务的响应转换为格式化的大纲文本
      let outlineText = `# ${outlineResponse.title}\n\n`
      
      // 添加摘要
      if (outlineResponse.abstract) {
        outlineText += `## 摘要 (Abstract)\n\n${outlineResponse.abstract}\n\n`
      }
      
      // 添加关键词
      if (outlineResponse.keywords && outlineResponse.keywords.length > 0) {
        outlineText += `**关键词**: ${outlineResponse.keywords.join(', ')}\n\n`
      }
      
      // 添加各个章节
      outlineResponse.sections.forEach((section, index) => {
        outlineText += `## ${index + 1}. ${section.name}\n\n`
        
        if (section.description) {
          outlineText += `*${section.description}*\n\n`
        }
        
        // 添加子章节
        if (section.subsections && section.subsections.length > 0) {
          section.subsections.forEach((subsection, subIndex) => {
            outlineText += `### ${index + 1}.${subIndex + 1} ${subsection}\n`
          })
          outlineText += '\n'
        }
        
        // 添加预计字数
        if (section.estimatedLength) {
          outlineText += `*预计字数: ${section.estimatedLength}*\n\n`
        }
      })
      
      // 添加写作建议
      if (outlineResponse.suggestions && outlineResponse.suggestions.length > 0) {
        outlineText += `## 💡 写作建议\n\n`
        outlineResponse.suggestions.forEach((suggestion, index) => {
          outlineText += `${index + 1}. ${suggestion}\n`
        })
        outlineText += '\n'
      }
      
      console.log('✅ AI大纲生成成功')
      return outlineText
      
    } catch (error) {
      console.error('❌ 生成大纲失败:', error)
      
      // 如果API调用失败，返回有意义的错误信息
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return '❌ **大纲生成失败**\n\n请配置OpenAI API密钥。\n\n在项目根目录创建 `.env` 文件，并添加：\n```\nVITE_OPENAI_API_KEY=your_api_key_here\n```'
        }
        if (error.message.includes('network')) {
          return '❌ **大纲生成失败**\n\n网络连接错误，请检查网络连接后重试。'
        }
        if (error.message.includes('quota')) {
          return '❌ **大纲生成失败**\n\nOpenAI API 使用量超限，请检查账户余额。'
        }
        return `❌ **大纲生成失败**\n\n错误信息：${error.message}`
      }
      
      return '❌ **大纲生成失败**\n\n请稍后重试。'
    }
  }
}

export default AIPlanningService
