import { OpenAI } from 'openai'

// AI服务配置
const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || ''

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 注意：生产环境应该使用后端代理
})

// 检查API密钥是否配置
if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.')
}

// 智能大纲生成请求
export interface OutlineRequest {
  topic: string
  field: string
  paperType: 'research' | 'review' | 'thesis' | 'proposal'
  targetJournal?: string
  length: 'short' | 'medium' | 'long'
  language: 'chinese' | 'english'
}

// 智能大纲生成响应
export interface OutlineResponse {
  title: string
  abstract: string
  sections: {
    name: string
    description: string
    subsections: string[]
    estimatedLength: string
  }[]
  keywords: string[]
  suggestions: string[]
}

// 智能内容填充请求
export interface ContentRequest {
  section: string
  subsection?: string
  keywords: string[]
  context: string
  length: 'short' | 'medium' | 'long'
  style: 'academic' | 'formal' | 'casual'
  field: string
  language: 'chinese' | 'english'
  existingContent?: string
}

// 智能内容填充响应
export interface ContentResponse {
  content: string
  suggestions: string[]
  references: string[]
  improvements: string[]
  nextSteps: string[]
}

// 语言润色请求
export interface PolishRequest {
  text: string
  style: 'academic' | 'formal' | 'casual'
  field: string
  language: 'chinese' | 'english'
  targetAudience: 'general' | 'expert' | 'student'
}

// 语言润色响应
export interface PolishResponse {
  polishedText: string
  changes: {
    original: string
    improved: string
    reason: string
    type: 'grammar' | 'style' | 'clarity' | 'flow'
  }[]
  suggestions: string[]
  score: {
    clarity: number
    flow: number
    academic: number
    overall: number
  }
}

// AI服务类
export class AIService {
  // 生成智能大纲
  static async generateOutline(request: OutlineRequest): Promise<OutlineResponse> {
    try {
      const prompt = this.buildOutlinePrompt(request)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic writing assistant specializing in research paper structure and organization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content || ''
      return this.parseOutlineResponse(content, request)
    } catch (error) {
      console.error('Error generating outline:', error)
      throw new Error('Failed to generate outline. Please check your API key and try again.')
    }
  }

  // 生成智能内容
  static async generateContent(request: ContentRequest): Promise<ContentResponse> {
    try {
      const prompt = this.buildContentPrompt(request)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic writer who can generate high-quality research content based on given requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content || ''
      return this.parseContentResponse(content, request)
    } catch (error) {
      console.error('Error generating content:', error)
      throw new Error('Failed to generate content. Please check your API key and try again.')
    }
  }

  // 语言润色
  static async polishText(request: PolishRequest): Promise<PolishResponse> {
    try {
      const prompt = this.buildPolishPrompt(request)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic editor who can improve text clarity, flow, and academic writing style.'
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
      return this.parsePolishResponse(content, request)
    } catch (error) {
      console.error('Error polishing text:', error)
      throw new Error('Failed to polish text. Please check your API key and try again.')
    }
  }

  // 构建大纲生成提示词
  private static buildOutlinePrompt(request: OutlineRequest): string {
    const language = request.language === 'chinese' ? '中文' : 'English'
    const paperTypeMap = {
      research: 'research paper',
      review: 'literature review',
      thesis: 'thesis',
      proposal: 'research proposal'
    }
    
    return `Please generate a comprehensive outline for a ${paperTypeMap[request.paperType]} in ${language} on the topic: "${request.topic}"

Field: ${request.field}
Length: ${request.length}
${request.targetJournal ? `Target Journal: ${request.targetJournal}` : ''}

Please provide:
1. A compelling title
2. A concise abstract (150-200 words)
3. Detailed sections with subsections
4. Estimated length for each section
5. Relevant keywords
6. Writing suggestions

Format the response as JSON with the following structure:
{
  "title": "Paper Title",
  "abstract": "Abstract text...",
  "sections": [
    {
      "name": "Section Name",
      "description": "Section description",
      "subsections": ["Subsection 1", "Subsection 2"],
      "estimatedLength": "500-800 words"
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`
  }

  // 构建内容生成提示词
  private static buildContentPrompt(request: ContentRequest): string {
    const language = request.language === 'chinese' ? '中文' : 'English'
    
    return `Please generate high-quality academic content in ${language} for the following section:

Section: ${request.section}
${request.subsection ? `Subsection: ${request.subsection}` : ''}
Field: ${request.field}
Style: ${request.style}
Length: ${request.length}
Keywords: ${request.keywords.join(', ')}
Context: ${request.context}
${request.existingContent ? `Existing Content: ${request.existingContent}` : ''}

Please provide:
1. Well-structured content
2. Writing suggestions
3. Relevant references (format: Author, Title, Year)
4. Improvement suggestions
5. Next steps

Format the response as JSON:
{
  "content": "Generated content...",
  "suggestions": ["suggestion1", "suggestion2"],
  "references": ["Author, Title, Year"],
  "improvements": ["improvement1", "improvement2"],
  "nextSteps": ["step1", "step2"]
}`
  }

  // 构建润色提示词
  private static buildPolishPrompt(request: PolishRequest): string {
    const language = request.language === 'chinese' ? '中文' : 'English'
    
    return `Please polish the following text in ${language} to improve clarity, flow, and academic writing style:

Text: ${request.text}
Field: ${request.field}
Style: ${request.style}
Target Audience: ${request.targetAudience}

Please provide:
1. Improved text
2. List of changes made with explanations
3. Additional suggestions
4. Quality scores (1-10) for clarity, flow, academic tone, and overall quality

Format the response as JSON:
{
  "polishedText": "Improved text...",
  "changes": [
    {
      "original": "original text",
      "improved": "improved text",
      "reason": "explanation",
      "type": "grammar|style|clarity|flow"
    }
  ],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": {
    "clarity": 8,
    "flow": 7,
    "academic": 9,
    "overall": 8
  }
}`
  }

  // 解析大纲响应
  private static parseOutlineResponse(content: string, request: OutlineRequest): OutlineResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        title: parsed.title || 'Untitled',
        abstract: parsed.abstract || '',
        sections: parsed.sections || [],
        keywords: parsed.keywords || [],
        suggestions: parsed.suggestions || []
      }
    } catch (error) {
      console.error('Error parsing outline response:', error)
      // 返回默认结构
      return {
        title: `Research on ${request.topic}`,
        abstract: 'Abstract will be generated here...',
        sections: [
          {
            name: 'Introduction',
            description: 'Introduction section',
            subsections: ['Background', 'Problem Statement', 'Objectives'],
            estimatedLength: '500-800 words'
          },
          {
            name: 'Literature Review',
            description: 'Literature review section',
            subsections: ['Related Work', 'Gap Analysis'],
            estimatedLength: '800-1200 words'
          },
          {
            name: 'Methodology',
            description: 'Research methodology',
            subsections: ['Research Design', 'Data Collection', 'Analysis'],
            estimatedLength: '600-1000 words'
          },
          {
            name: 'Results',
            description: 'Research results',
            subsections: ['Findings', 'Analysis'],
            estimatedLength: '500-800 words'
          },
          {
            name: 'Conclusion',
            description: 'Conclusion and future work',
            subsections: ['Summary', 'Implications', 'Future Work'],
            estimatedLength: '300-500 words'
          }
        ],
        keywords: request.topic.split(' ').slice(0, 5),
        suggestions: ['Ensure proper citations', 'Maintain academic tone', 'Use clear structure']
      }
    }
  }

  // 解析内容响应
  private static parseContentResponse(content: string, _request: ContentRequest): ContentResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        content: parsed.content || 'Content will be generated here...',
        suggestions: parsed.suggestions || [],
        references: parsed.references || [],
        improvements: parsed.improvements || [],
        nextSteps: parsed.nextSteps || []
      }
    } catch (error) {
      console.error('Error parsing content response:', error)
      return {
        content: 'Content will be generated here...',
        suggestions: ['Add more details', 'Include examples', 'Cite relevant sources'],
        references: [],
        improvements: ['Improve clarity', 'Add transitions', 'Strengthen arguments'],
        nextSteps: ['Review content', 'Add citations', 'Check formatting']
      }
    }
  }

  // 解析润色响应
  private static parsePolishResponse(content: string, _request: PolishRequest): PolishResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        polishedText: parsed.polishedText || _request.text,
        changes: parsed.changes || [],
        suggestions: parsed.suggestions || [],
        score: parsed.score || {
          clarity: 7,
          flow: 7,
          academic: 7,
          overall: 7
        }
      }
    } catch (error) {
      console.error('Error parsing polish response:', error)
      return {
        polishedText: _request.text,
        changes: [],
        suggestions: ['Consider improving clarity', 'Add more academic tone'],
        score: {
          clarity: 7,
          flow: 7,
          academic: 7,
          overall: 7
        }
      }
    }
  }
}

// 导出默认实例
export default AIService
