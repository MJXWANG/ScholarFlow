import React, { useState, useEffect, useRef } from 'react'

interface LaTeXSuggestion {
  command: string
  description: string
  category: 'text' | 'math' | 'structure' | 'formatting'
  example?: string
}

const latexSuggestions: LaTeXSuggestion[] = [
  // 文本格式
  { command: '\\textbf{text}', description: '粗体文本', category: 'formatting', example: '\\textbf{重要内容}' },
  { command: '\\textit{text}', description: '斜体文本', category: 'formatting', example: '\\textit{强调内容}' },
  { command: '\\underline{text}', description: '下划线文本', category: 'formatting', example: '\\underline{下划线内容}' },
  { command: '\\texttt{text}', description: '等宽字体', category: 'formatting', example: '\\texttt{代码内容}' },
  
  // 结构元素
  { command: '\\section{title}', description: '一级标题', category: 'structure', example: '\\section{引言}' },
  { command: '\\subsection{title}', description: '二级标题', category: 'structure', example: '\\subsection{背景}' },
  { command: '\\subsubsection{title}', description: '三级标题', category: 'structure', example: '\\subsubsection{具体内容}' },
  { command: '\\paragraph{title}', description: '段落标题', category: 'structure', example: '\\paragraph{详细说明}' },
  
  // 列表
  { command: '\\begin{itemize}', description: '无序列表', category: 'structure', example: '\\begin{itemize}\\item 项目1\\item 项目2\\end{itemize}' },
  { command: '\\begin{enumerate}', description: '有序列表', category: 'structure', example: '\\begin{enumerate}\\item 第一项\\item 第二项\\end{enumerate}' },
  
  // 数学公式
  { command: '$formula$', description: '行内数学公式', category: 'math', example: '$E = mc^2$' },
  { command: '$$formula$$', description: '独立数学公式', category: 'math', example: '$$\\int_0^\\infty e^{-x} dx = 1$$' },
  { command: '\\begin{equation}', description: '编号数学公式', category: 'math', example: '\\begin{equation}\\label{eq:1}\\int_0^\\infty e^{-x} dx = 1\\end{equation}' },
  
  // 引用和脚注
  { command: '\\cite{key}', description: '引用文献', category: 'text', example: '\\cite{smith2023}' },
  { command: '\\footnote{text}', description: '脚注', category: 'text', example: '\\footnote{这是脚注内容}' },
  
  // 特殊字符
  { command: '\\&', description: '&符号', category: 'text', example: 'A \\& B' },
  { command: '\\%', description: '%符号', category: 'text', example: '50\\%' },
  { command: '\\#', description: '#符号', category: 'text', example: '\\#1' },
  { command: '\\$', description: '$符号', category: 'text', example: '\\$100' },
  
  // 环境
  { command: '\\begin{quote}', description: '引用环境', category: 'structure', example: '\\begin{quote}引用内容\\end{quote}' },
  { command: '\\begin{center}', description: '居中环境', category: 'structure', example: '\\begin{center}居中内容\\end{center}' },
]

interface LaTeXHelperProps {
  onInsert: (command: string) => void
  isVisible: boolean
  onClose: () => void
}

export const LaTeXHelper: React.FC<LaTeXHelperProps> = ({ onInsert, isVisible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<LaTeXSuggestion['category'] | 'all'>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const categories = [
    { key: 'all', label: '全部', icon: '📚' },
    { key: 'structure', label: '结构', icon: '📋' },
    { key: 'formatting', label: '格式', icon: '🎨' },
    { key: 'math', label: '数学', icon: '🔢' },
    { key: 'text', label: '文本', icon: '📝' }
  ] as const

  const filteredSuggestions = latexSuggestions.filter(suggestion => {
    const matchesSearch = suggestion.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || suggestion.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredSuggestions[selectedIndex]) {
            onInsert(filteredSuggestions[selectedIndex].command)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, selectedIndex, filteredSuggestions, onInsert, onClose])

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">LaTeX 命令助手</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 搜索和分类 */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="搜索LaTeX命令..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            autoFocus
          />
          
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 命令列表 */}
        <div className="flex-1 overflow-auto p-4">
          <div ref={listRef} className="space-y-2">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.command}
                onClick={() => {
                  onInsert(suggestion.command)
                  onClose()
                }}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-blue-600 mb-1">
                      {suggestion.command}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {suggestion.description}
                    </div>
                    {suggestion.example && (
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                        示例: {suggestion.example}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 text-xs text-gray-400">
                    {categories.find(c => c.key === suggestion.category)?.icon}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔍</div>
                <p className="text-gray-500">没有找到匹配的命令</p>
              </div>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            💡 使用方向键选择，Enter插入，Esc关闭
          </div>
        </div>
      </div>
    </div>
  )
}
