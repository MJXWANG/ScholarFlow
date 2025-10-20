import JSZip from 'jszip'
import { PDFDocument, rgb } from 'pdf-lib'

export interface CompilationResult {
  success: boolean
  pdfBlob?: Blob
  errors?: string[]
  warnings?: string[]
  log?: string
}

export interface CompilationOptions {
  engine?: 'pdflatex' | 'xelatex' | 'lualatex'
  timeout?: number
  maxRuns?: number
}

export class LaTeXCompiler {
  private static instance: LaTeXCompiler
  
  static getInstance(): LaTeXCompiler {
    if (!LaTeXCompiler.instance) {
      LaTeXCompiler.instance = new LaTeXCompiler()
    }
    return LaTeXCompiler.instance
  }

  async compileProject(
    projectFiles: { name: string; content: string }[],
    mainFile: string = 'main.tex',
    options: CompilationOptions = {}
  ): Promise<CompilationResult> {
    try {
      // 模拟LaTeX编译过程
      const result = await this.simulateCompilation(projectFiles, mainFile, options)
      return result
    } catch (error) {
      return {
        success: false,
        errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        log: error instanceof Error ? error.stack : 'Unknown error'
      }
    }
  }

  private async simulateCompilation(
    projectFiles: { name: string; content: string }[],
    mainFile: string,
    _options: CompilationOptions
  ): Promise<CompilationResult> {
    // 模拟编译延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mainFileContent = projectFiles.find(f => f.name === mainFile)?.content
    
    if (!mainFileContent) {
      return {
        success: false,
        errors: [`Main file not found: ${mainFile}`],
        log: 'Main file does not exist'
      }
    }

    // 简单的LaTeX语法检查
    const errors: string[] = []
    const warnings: string[] = []

    // 检查基本LaTeX结构
    if (!mainFileContent.includes('\\documentclass')) {
      errors.push('Missing \\documentclass declaration')
    }

    if (!mainFileContent.includes('\\begin{document}')) {
      errors.push('Missing \\begin{document}')
    }

    if (!mainFileContent.includes('\\end{document}')) {
      errors.push('Missing \\end{document}')
    }

    // 检查未定义的命令
    const undefinedCommands = this.findUndefinedCommands(mainFileContent)
    warnings.push(...undefinedCommands)

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings,
        log: this.generateLog(errors, warnings)
      }
    }

    // 模拟生成PDF
    const pdfBlob = await this.generateMockPDF(mainFileContent)
    
    return {
      success: true,
      pdfBlob,
      warnings,
      log: this.generateLog([], warnings)
    }
  }

  private findUndefinedCommands(content: string): string[] {
    const warnings: string[] = []
    
    // 检查一些常见的未定义命令
    const undefinedPatterns = [
      { pattern: /\\cite\{[^}]+\}/g, message: '引用命令 \\cite 需要 bibliography 文件' },
      { pattern: /\\ref\{[^}]+\}/g, message: '引用命令 \\ref 需要对应的 \\label' },
      { pattern: /\\includegraphics\{[^}]+\}/g, message: '图片文件可能不存在' }
    ]

    undefinedPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        warnings.push(message)
      }
    })

    return warnings
  }

  private generateLog(errors: string[], warnings: string[]): string {
    let log = 'LaTeX 编译日志\n'
    log += '='.repeat(50) + '\n\n'

    if (errors.length > 0) {
      log += 'Errors:\n'
      errors.forEach((error, index) => {
        log += `${index + 1}. ${error}\n`
      })
      log += '\n'
    }

    if (warnings.length > 0) {
      log += 'Warnings:\n'
      warnings.forEach((warning, index) => {
        log += `${index + 1}. ${warning}\n`
      })
      log += '\n'
    }

    if (errors.length === 0 && warnings.length === 0) {
      log += 'Compilation successful, no errors or warnings.\n'
    }

    return log
  }

  private async generateMockPDF(content: string): Promise<Blob> {
    // 使用pdf-lib创建真正的PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    
    // 解析LaTeX内容，支持多页
    const parsedContent = this.parseLatexContentWithPages(content)
    console.log('Parsed LaTeX content with pages:', parsedContent)
    
    // 为每个页面创建PDF页面
    parsedContent.pages.forEach((pageContent, pageIndex) => {
      // 第一页使用已创建的页面，其他页面创建新页面
      const currentPage = pageIndex === 0 ? page : pdfDoc.addPage([595.28, 841.89])
      
      // 添加页眉（除了第一页）
      if (pageIndex > 0) {
        currentPage.drawText(`Page ${pageIndex + 1}`, {
          x: 50,
          y: 800,
          size: 10,
          color: rgb(0.5, 0.5, 0.5),
        })
      }
      
      // 添加标题（只在第一页）
      if (pageIndex === 0 && parsedContent.title) {
        currentPage.drawText(parsedContent.title, {
          x: 50,
          y: 750,
          size: 24,
          color: rgb(0, 0, 0),
        })
      }
      
      // 添加作者（只在第一页）
      if (pageIndex === 0 && parsedContent.author) {
        currentPage.drawText(parsedContent.author, {
          x: 50,
          y: 700,
          size: 14,
          color: rgb(0.3, 0.3, 0.3),
        })
      }
      
      // 添加日期（只在第一页）
      if (pageIndex === 0 && parsedContent.date) {
        currentPage.drawText(parsedContent.date, {
          x: 50,
          y: 680,
          size: 12,
          color: rgb(0.5, 0.5, 0.5),
        })
      }
      
      // 添加页面内容
      let yPosition = pageIndex === 0 ? 600 : 750
      pageContent.forEach(item => {
        if (item.type === 'section') {
          // 添加节标题
          currentPage.drawText(item.title!, {
            x: 50,
            y: yPosition,
            size: 16,
            color: rgb(0, 0, 0),
          })
          yPosition -= 30
          
          // 添加节内容
          const lines = this.wrapText(item.content!, 80)
          lines.forEach(line => {
            if (yPosition < 50) {
              // 如果当前页面空间不够，内容会被截断
              return
            }
            
            currentPage.drawText(line, {
              x: 70,
              y: yPosition,
              size: 12,
              color: rgb(0, 0, 0),
            })
            yPosition -= 20
          })
          yPosition -= 20
        }
      })
    })
    
    const pdfBytes = await pdfDoc.save()
    console.log('PDF generated, size:', pdfBytes.length, 'bytes')
    console.log('PDF pages:', pdfDoc.getPageCount())
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  }

  private parseLatexContentWithPages(content: string) {
    const result = {
      title: '',
      author: '',
      date: '',
      pages: [] as Array<Array<{type: 'section' | 'pagebreak', title?: string, content?: string}>>
    }
    
    // 提取标题
    const titleMatch = content.match(/\\title\{([^}]+)\}/)
    if (titleMatch) result.title = titleMatch[1]
    
    // 提取作者
    const authorMatch = content.match(/\\author\{([^}]+)\}/)
    if (authorMatch) result.author = authorMatch[1]
    
    // 提取日期
    const dateMatch = content.match(/\\date\{([^}]+)\}/)
    if (dateMatch) result.date = dateMatch[1]
    
    // 检查是否有页面分隔符
    if (content.includes('\\newpage')) {
      // 有页面分隔符，按页面分割
      const pageBreaks = content.split(/\\newpage/)
      
      pageBreaks.forEach((pageContent, _pageIndex) => {
        const currentPage: Array<{type: 'section' | 'pagebreak', title?: string, content?: string}> = []
        
        // 提取当前页面的节
        const sectionRegex = /\\section\{([^}]+)\}([^\\]*?)(?=\\section|\\end\{document\}|$)/gs
        let match
        while ((match = sectionRegex.exec(pageContent)) !== null) {
          const title = match[1]
          const content = match[2].trim()
          currentPage.push({ 
            type: 'section', 
            title, 
            content 
          })
        }
        
        // 将当前页面添加到结果中
        if (currentPage.length > 0) {
          result.pages.push(currentPage)
        }
      })
    } else {
      // 没有页面分隔符，所有内容在一页
      const currentPage: Array<{type: 'section' | 'pagebreak', title?: string, content?: string}> = []
      
      const sectionRegex = /\\section\{([^}]+)\}([^\\]*?)(?=\\section|\\end\{document\}|$)/gs
      let match
      while ((match = sectionRegex.exec(content)) !== null) {
        const title = match[1]
        const content = match[2].trim()
        currentPage.push({ 
          type: 'section', 
          title, 
          content 
        })
      }
      
      if (currentPage.length > 0) {
        result.pages.push(currentPage)
      }
    }
    
    console.log('Parsed pages:', result.pages)
    return result
  }

  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    })
    
    if (currentLine) lines.push(currentLine)
    return lines
  }

  // 导出项目为ZIP文件
  async exportProjectAsZip(projectFiles: { name: string; content: string }[]): Promise<Blob> {
    const zip = new JSZip()
    
    projectFiles.forEach(file => {
      zip.file(file.name, file.content)
    })
    
    return await zip.generateAsync({ type: 'blob' })
  }
}
