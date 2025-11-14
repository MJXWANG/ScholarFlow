import { OpenAI } from 'openai'

// 初始化OpenAI客户端
const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || ''
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// 文档结构分析结果
export interface DocumentStructure {
  sections: Array<{
    title: string
    level: number // 1=章, 2=节, 3=小节
    startLine: number
    endLine: number
    wordCount: number
    hasContent: boolean
    subsections: string[]
  }>
  statistics: {
    totalSections: number
    totalWordCount: number
    averageWordsPerSection: number
    emptySections: number
  }
  outline: string[] // 大纲层级结构
}

// 学术领域识别结果
export interface FieldDetection {
  primaryField: string // 主要领域
  subFields: string[] // 子领域
  confidence: number // 置信度 0-1
  keywords: string[] // 领域关键词
  suggestedCitations: string[] // 建议引用的经典文献
}

// 写作质量评分
export interface QualityScore {
  structure: number // 结构完整性 0-10
  clarity: number // 清晰度 0-10
  coherence: number // 连贯性 0-10
  academic: number // 学术性 0-10
  overall: number // 总体评分 0-10
  feedback: string[] // 详细反馈
}

// 文档分析服务
export class DocumentAnalysisService {
  
  // 分析文档结构
  static analyzeStructure(content: string): DocumentStructure {
    const lines = content.split('\n')
    const sections: DocumentStructure['sections'] = []
    const outline: string[] = []
    
    let currentSection: DocumentStructure['sections'][0] | null = null
    let lineNumber = 0
    
    for (const line of lines) {
      lineNumber++
      
      // 检测Markdown标题
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const title = headerMatch[2].trim()
        
        // 保存上一个section
        if (currentSection) {
          currentSection.endLine = lineNumber - 1
          currentSection.wordCount = this.countWords(
            lines.slice(currentSection.startLine, currentSection.endLine + 1).join('\n')
          )
          currentSection.hasContent = currentSection.wordCount > 0
          sections.push(currentSection)
        }
        
        // 创建新section
        currentSection = {
          title,
          level,
          startLine: lineNumber,
          endLine: lineNumber,
          wordCount: 0,
          hasContent: false,
          subsections: []
        }
        
        // 添加到大纲
        const indent = '  '.repeat(level - 1)
        outline.push(`${indent}${title}`)
      }
    }
    
    // 保存最后一个section
    if (currentSection) {
      currentSection.endLine = lineNumber
      currentSection.wordCount = this.countWords(
        lines.slice(currentSection.startLine, currentSection.endLine + 1).join('\n')
      )
      currentSection.hasContent = currentSection.wordCount > 0
      sections.push(currentSection)
    }
    
    // 计算统计信息
    const totalWordCount = this.countWords(content)
    const emptySections = sections.filter(s => !s.hasContent).length
    
    return {
      sections,
      statistics: {
        totalSections: sections.length,
        totalWordCount,
        averageWordsPerSection: sections.length > 0 ? totalWordCount / sections.length : 0,
        emptySections
      },
      outline
    }
  }
  
  // 识别学术领域
  static async detectField(content: string): Promise<FieldDetection> {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }
      
      // 提取内容预览（前1000字）
      const preview = content.substring(0, 1000)
      
      const prompt = `请分析以下学术文档内容，识别其所属的学术领域：

文档内容预览：
${preview}

请返回JSON格式：
{
  "primaryField": "主要学术领域（如：计算机科学、生物学、物理学等）",
  "subFields": ["子领域1", "子领域2"],
  "confidence": 0.95,
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "suggestedCitations": ["该领域的经典文献或权威著作"]
}

注意：
1. primaryField应该是具体的学术领域
2. subFields是更细分的研究方向
3. confidence是0-1之间的数值
4. keywords是从文档中提取的领域关键词
5. suggestedCitations是该领域应该引用的经典文献`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术分类专家，能够准确识别文档所属的学术领域和研究方向。请只返回JSON格式，不要包含任何其他文字说明。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })
      
      const result = response.choices[0]?.message?.content || ''
      
      // 尝试提取JSON（如果AI返回了说明文字）
      let jsonStr = result.trim()
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
      
      const parsed = JSON.parse(jsonStr)
      
      return {
        primaryField: parsed.primaryField || 'Unknown',
        subFields: parsed.subFields || [],
        confidence: parsed.confidence || 0.5,
        keywords: parsed.keywords || [],
        suggestedCitations: parsed.suggestedCitations || []
      }
      
    } catch (error) {
      console.error('Error detecting field:', error)
      
      // 返回默认值
      return {
        primaryField: 'Computer Science',
        subFields: [],
        confidence: 0.5,
        keywords: this.extractSimpleKeywords(content),
        suggestedCitations: []
      }
    }
  }
  
  // 评估文档质量
  static async evaluateQuality(content: string, structure: DocumentStructure): Promise<QualityScore> {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }
      
      const prompt = `请评估以下学术文档的质量：

文档统计：
- 总章节数: ${structure.statistics.totalSections}
- 总字数: ${structure.statistics.totalWordCount}
- 空章节数: ${structure.statistics.emptySections}

文档大纲：
${structure.outline.slice(0, 20).join('\n')}

文档内容预览：
${content.substring(0, 800)}

请从以下维度评分（0-10分）：
1. 结构完整性 - 章节组织是否合理、逻辑是否清晰
2. 清晰度 - 表达是否清晰易懂
3. 连贯性 - 章节之间是否连贯、过渡是否自然
4. 学术性 - 是否符合学术规范、用词是否专业

返回JSON格式：
{
  "structure": 8,
  "clarity": 7,
  "coherence": 8,
  "academic": 9,
  "overall": 8,
  "feedback": [
    "具体的改进建议1",
    "具体的改进建议2"
  ]
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术审稿人，能够客观评估文档质量并提供建设性意见。请只返回JSON格式，不要包含任何其他文字说明。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
      
      const result = response.choices[0]?.message?.content || ''
      
      // 尝试提取JSON（如果AI返回了说明文字）
      let jsonStr = result.trim()
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
      
      const parsed = JSON.parse(jsonStr)
      
      return {
        structure: parsed.structure || 7,
        clarity: parsed.clarity || 7,
        coherence: parsed.coherence || 7,
        academic: parsed.academic || 7,
        overall: parsed.overall || 7,
        feedback: parsed.feedback || []
      }
      
    } catch (error) {
      console.error('Error evaluating quality:', error)
      
      // 返回基于规则的简单评分
      const structureScore = this.calculateStructureScore(structure)
      
      return {
        structure: structureScore,
        clarity: 7,
        coherence: 7,
        academic: 7,
        overall: structureScore,
        feedback: ['请配置OpenAI API密钥以获取详细评估']
      }
    }
  }
  
  // 检测具体问题（增强版）
  static async detectIssues(content: string, structure: DocumentStructure): Promise<{
    issues: Array<{
      type: 'format' | 'content' | 'structure' | 'citation' | 'language'
      severity: 'low' | 'medium' | 'high'
      message: string
      suggestion: string
      location?: string
      line?: number
    }>
    criticalCount: number
    warningCount: number
    infoCount: number
  }> {
    const issues: any[] = []
    
    // 1. 结构问题检测
    if (structure.statistics.emptySections > 0) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        message: `发现 ${structure.statistics.emptySections} 个空章节`,
        suggestion: '建议填充这些章节的内容，或删除不必要的章节标题',
        location: '文档结构'
      })
    }
    
    if (structure.statistics.totalSections < 3) {
      issues.push({
        type: 'structure',
        severity: 'high',
        message: '文档章节数量过少',
        suggestion: '学术论文通常需要至少包含：引言、方法、结果、结论等章节',
        location: '文档结构'
      })
    }
    
    // 2. 格式问题检测
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 检测连续空行过多
      if (line.trim() === '' && lines[i + 1]?.trim() === '' && lines[i + 2]?.trim() === '') {
        issues.push({
          type: 'format',
          severity: 'low',
          message: '发现连续多个空行',
          suggestion: '建议保持格式整洁，避免过多空行',
          location: `第 ${i + 1} 行`,
          line: i + 1
        })
      }
    }
    
    // 3. 引用问题检测
    const hasReferences = content.toLowerCase().includes('reference') || 
                         content.toLowerCase().includes('参考文献') ||
                         content.toLowerCase().includes('bibliography')
    
    if (!hasReferences && structure.statistics.totalWordCount > 500) {
      issues.push({
        type: 'citation',
        severity: 'high',
        message: '未发现参考文献章节',
        suggestion: '学术论文需要包含参考文献，请添加"参考文献"章节',
        location: '文档末尾'
      })
    }
    
    // 4. 内容长度问题
    if (structure.statistics.totalWordCount < 500) {
      issues.push({
        type: 'content',
        severity: 'medium',
        message: '文档内容过少',
        suggestion: `当前仅 ${structure.statistics.totalWordCount} 字，建议扩充内容`,
        location: '整体内容'
      })
    }
    
    // 统计问题数量
    const criticalCount = issues.filter(i => i.severity === 'high').length
    const warningCount = issues.filter(i => i.severity === 'medium').length
    const infoCount = issues.filter(i => i.severity === 'low').length
    
    return {
      issues,
      criticalCount,
      warningCount,
      infoCount
    }
  }
  
  // 辅助方法：计算字数
  private static countWords(text: string): number {
    // 去除Markdown标记和特殊字符
    const cleanText = text
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/[*_~`]/g, '') // 移除格式标记
      .trim()
    
    if (!cleanText) return 0
    
    // 中文字符计数
    const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length
    
    // 英文单词计数
    const englishWords = cleanText
      .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文
      .split(/\s+/)
      .filter(word => word.length > 0).length
    
    return chineseChars + englishWords
  }
  
  // 辅助方法：提取简单关键词
  private static extractSimpleKeywords(content: string): string[] {
    // 简单的关键词提取（实际应该用更复杂的算法）
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
    
    // 统计词频
    const frequency: Record<string, number> = {}
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    // 返回前10个高频词
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }
  
  // 辅助方法：计算结构评分
  private static calculateStructureScore(structure: DocumentStructure): number {
    let score = 5 // 基础分
    
    // 章节数量合理 +2分
    if (structure.statistics.totalSections >= 3 && structure.statistics.totalSections <= 10) {
      score += 2
    }
    
    // 没有空章节 +2分
    if (structure.statistics.emptySections === 0) {
      score += 2
    }
    
    // 字数充足 +1分
    if (structure.statistics.totalWordCount > 1000) {
      score += 1
    }
    
    return Math.min(10, score)
  }
}

export default DocumentAnalysisService

