import React, { useState, useRef, useEffect } from 'react'
import { useFileSystemStore } from '../store/fileSystemStore'

interface RichTextEditorProps {
  onContentChange?: (latexContent: string) => void
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ onContentChange }) => {
  const { getCurrentFile, saveFile } = useFileSystemStore()
  const currentFile = getCurrentFile()
  const [isRichMode, setIsRichMode] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState('')

  // 初始化内容
  useEffect(() => {
    if (currentFile?.content) {
      if (isRichMode) {
        // 将LaTeX转换为富文本显示
        setContent(convertLatexToRichText(currentFile.content))
      } else {
        setContent(currentFile.content)
      }
    }
  }, [currentFile, isRichMode])

  // 富文本转LaTeX
  const convertRichTextToLatex = (richText: string): string => {
    let latex = richText
    
    // 处理标题
    latex = latex.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\\title{$1}')
    latex = latex.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\\section{$1}')
    latex = latex.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\\subsection{$1}')
    latex = latex.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\\subsubsection{$1}')
    
    // 处理段落
    latex = latex.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // 处理粗体
    latex = latex.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '\\textbf{$1}')
    latex = latex.replace(/<b[^>]*>(.*?)<\/b>/gi, '\\textbf{$1}')
    
    // 处理斜体
    latex = latex.replace(/<em[^>]*>(.*?)<\/em>/gi, '\\textit{$1}')
    latex = latex.replace(/<i[^>]*>(.*?)<\/i>/gi, '\\textit{$1}')
    
    // 处理下划线
    latex = latex.replace(/<u[^>]*>(.*?)<\/u>/gi, '\\underline{$1}')
    
    // 处理删除线
    latex = latex.replace(/<del[^>]*>(.*?)<\/del>/gi, '\\sout{$1}')
    
    // 处理代码
    latex = latex.replace(/<code[^>]*>(.*?)<\/code>/gi, '\\texttt{$1}')
    
    // 处理引用
    latex = latex.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '\\begin{quote}\n$1\n\\end{quote}')
    
    // 处理列表
    latex = latex.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi)
      if (items) {
        return '\\begin{itemize}\n' + 
               items.map((item: string) => item.replace(/<li[^>]*>(.*?)<\/li>/i, '\\item $1')).join('\n') +
               '\n\\end{itemize}'
      }
      return match
    })
    
    // 处理有序列表
    latex = latex.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi)
      if (items) {
        return '\\begin{enumerate}\n' + 
               items.map((item: string) => item.replace(/<li[^>]*>(.*?)<\/li>/i, '\\item $1')).join('\n') +
               '\n\\end{enumerate}'
      }
      return match
    })
    
    // 处理数学公式（简单处理）
    latex = latex.replace(/\$\$(.*?)\$\$/g, '\\begin{equation}\n$1\n\\end{equation}')
    latex = latex.replace(/\$(.*?)\$/g, '$1')
    
    // 处理换行
    latex = latex.replace(/<br\s*\/?>/gi, '\\\\')
    
    // 清理HTML标签
    latex = latex.replace(/<[^>]*>/g, '')
    
    // 清理多余的空白
    latex = latex.replace(/\n\s*\n\s*\n/g, '\n\n')
    latex = latex.trim()
    
    // 添加LaTeX文档结构
    if (!latex.includes('\\documentclass')) {
      latex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

${latex}

\\end{document}`
    }
    
    return latex
  }

  // LaTeX转富文本
  const convertLatexToRichText = (latex: string): string => {
    let richText = latex
    
    // 处理标题
    richText = richText.replace(/\\title\{([^}]+)\}/g, '<h1>$1</h1>')
    richText = richText.replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>')
    richText = richText.replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>')
    
    // 处理粗体
    richText = richText.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
    
    // 处理斜体
    richText = richText.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
    
    // 处理列表
    richText = richText.replace(/\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g, (match) => {
      const items = match.match(/\\item\s+([^\n]+)/g)
      if (items) {
        const listItems = items.map((item: string) => 
          `<li>${item.replace(/\\item\s+/, '')}</li>`
        ).join('')
        return `<ul>${listItems}</ul>`
      }
      return match
    })
    
    // 处理段落
    richText = richText.replace(/\n\n/g, '</p><p>')
    richText = `<p>${richText}</p>`
    
    return richText
  }

  const handleContentChange = () => {
    if (!editorRef.current) return
    
    const newContent = editorRef.current.innerHTML
    setContent(newContent)
    
    if (isRichMode && onContentChange) {
      const latexContent = convertRichTextToLatex(newContent)
      onContentChange(latexContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 快捷键处理
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          break
        case 's':
          e.preventDefault()
          handleSave()
          break
      }
    }
  }

  const handleSave = () => {
    if (currentFile && editorRef.current) {
      const latexContent = isRichMode 
        ? convertRichTextToLatex(editorRef.current.innerHTML)
        : editorRef.current.textContent || ''
      
      saveFile(currentFile.id, latexContent)
    }
  }

  const insertElement = (tag: string, placeholder: string = '') => {
    if (!editorRef.current) return
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const element = document.createElement(tag)
      element.textContent = placeholder
      range.deleteContents()
      range.insertNode(element)
      range.setStartAfter(element)
      range.setEndAfter(element)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    
    handleContentChange()
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {isRichMode ? '富文本编辑' : 'LaTeX编辑'}
          </span>
          <button
            onClick={() => setIsRichMode(!isRichMode)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {isRichMode ? '切换到LaTeX' : '切换到富文本'}
          </button>
        </div>
        
        {isRichMode && (
          <div className="flex items-center space-x-1">
            {/* 标题按钮 */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => insertElement('h1', '标题')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-bold"
                title="插入标题"
              >
                H1
              </button>
              <button
                onClick={() => insertElement('h2', '章节')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-bold"
                title="插入章节"
              >
                H2
              </button>
              <button
                onClick={() => insertElement('h3', '小节')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-bold"
                title="插入小节"
              >
                H3
              </button>
            </div>
            
            {/* 格式按钮 */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => document.execCommand('bold')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-bold"
                title="粗体 (Ctrl+B)"
              >
                B
              </button>
              <button
                onClick={() => document.execCommand('italic')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 italic"
                title="斜体 (Ctrl+I)"
              >
                I
              </button>
              <button
                onClick={() => document.execCommand('underline')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 underline"
                title="下划线 (Ctrl+U)"
              >
                U
              </button>
            </div>
            
            {/* 列表按钮 */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => insertElement('ul', '')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                title="无序列表"
              >
                • 列表
              </button>
              <button
                onClick={() => insertElement('ol', '')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                title="有序列表"
              >
                1. 列表
              </button>
            </div>
            
            {/* 特殊元素 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => insertElement('blockquote', '引用内容')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                title="插入引用"
              >
                " 引用
              </button>
              <button
                onClick={() => insertElement('code', '代码')}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-mono"
                title="插入代码"
              >
                &lt;/&gt;
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          保存
        </button>
      </div>
      
      {/* 编辑器 */}
      <div className="flex-1 p-4 overflow-hidden">
        {isRichMode ? (
          <div
            ref={editorRef}
            contentEditable
            className="w-full h-full p-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none overflow-y-auto editor-scrollbar"
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            style={{ 
              minHeight: '100%'
            }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (onContentChange) {
                onContentChange(e.target.value)
              }
            }}
            className="w-full h-full p-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm overflow-y-auto editor-scrollbar"
            placeholder="输入LaTeX内容..."
            style={{ 
              minHeight: '100%'
            }}
          />
        )}
      </div>
    </div>
  )
}
