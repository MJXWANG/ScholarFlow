import React, { useState } from 'react'
import { useAIStore } from '../store/aiStore'
import { OutlineRequest } from '../services/aiService'

interface AIOutlineGeneratorProps {
  onClose: () => void
  onInsertOutline: (outline: string) => void
}

export const AIOutlineGenerator: React.FC<AIOutlineGeneratorProps> = ({ onClose, onInsertOutline }) => {
  const { 
    generateOutline, 
    isGeneratingOutline, 
    outlineResult, 
    error, 
    clearError,
    preferences,
    updatePreferences
  } = useAIStore()

  const [formData, setFormData] = useState<OutlineRequest>({
    topic: '',
    field: preferences.field,
    paperType: 'research',
    length: 'medium',
    language: preferences.language
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topic.trim()) return

    await generateOutline(formData)
  }

  const handleInsertOutline = () => {
    if (outlineResult) {
      const outlineText = `\\title{${outlineResult.title}}

\\begin{abstract}
${outlineResult.abstract}
\\end{abstract}

\\section{Introduction}
${outlineResult.sections.find(s => s.name.toLowerCase().includes('introduction'))?.description || 'Introduction content...'}

\\section{Literature Review}
${outlineResult.sections.find(s => s.name.toLowerCase().includes('literature'))?.description || 'Literature review content...'}

\\section{Methodology}
${outlineResult.sections.find(s => s.name.toLowerCase().includes('method'))?.description || 'Methodology content...'}

\\section{Results}
${outlineResult.sections.find(s => s.name.toLowerCase().includes('result'))?.description || 'Results content...'}

\\section{Conclusion}
${outlineResult.sections.find(s => s.name.toLowerCase().includes('conclusion'))?.description || 'Conclusion content...'}

\\section*{Keywords}
${outlineResult.keywords.join(', ')}

\\section*{Suggestions}
${outlineResult.suggestions.join('\\n')}`
      
      onInsertOutline(outlineText)
      onClose()
    }
  }

  const handleFieldChange = (field: keyof OutlineRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 更新全局偏好
    if (field === 'language' || field === 'field') {
      updatePreferences({ [field]: value })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">智能大纲生成器</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 左侧：表单 */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究主题 *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => handleFieldChange('topic', e.target.value)}
                    placeholder="例如：深度学习在自然语言处理中的应用"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究领域
                  </label>
                  <select
                    value={formData.field}
                    onChange={(e) => handleFieldChange('field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="computer science">计算机科学</option>
                    <option value="mathematics">数学</option>
                    <option value="physics">物理学</option>
                    <option value="biology">生物学</option>
                    <option value="chemistry">化学</option>
                    <option value="engineering">工程学</option>
                    <option value="medicine">医学</option>
                    <option value="psychology">心理学</option>
                    <option value="economics">经济学</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      论文类型
                    </label>
                    <select
                      value={formData.paperType}
                      onChange={(e) => handleFieldChange('paperType', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="research">研究论文</option>
                      <option value="review">文献综述</option>
                      <option value="thesis">学位论文</option>
                      <option value="proposal">研究提案</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      论文长度
                    </label>
                    <select
                      value={formData.length}
                      onChange={(e) => handleFieldChange('length', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="short">短篇 (3000-5000字)</option>
                      <option value="medium">中篇 (5000-8000字)</option>
                      <option value="long">长篇 (8000+字)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    语言
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleFieldChange('language', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="chinese">中文</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              {/* 高级选项 */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <span>高级选项</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目标期刊 (可选)
                      </label>
                      <input
                        type="text"
                        value={formData.targetJournal || ''}
                        onChange={(e) => handleFieldChange('targetJournal', e.target.value)}
                        placeholder="例如：Nature, Science, IEEE TPAMI"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isGeneratingOutline || !formData.topic.trim()}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isGeneratingOutline || !formData.topic.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGeneratingOutline ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>生成中...</span>
                  </div>
                ) : (
                  '生成智能大纲'
                )}
              </button>
            </form>
          </div>

          {/* 右侧：结果展示 */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">生成失败</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  清除错误
                </button>
              </div>
            )}

            {outlineResult ? (
              <div className="space-y-6">
                {/* 标题和摘要 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">论文标题</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{outlineResult.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">摘要</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                      {outlineResult.abstract}
                    </p>
                  </div>
                </div>

                {/* 章节结构 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">章节结构</h3>
                  <div className="space-y-3">
                    {outlineResult.sections.map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{section.name}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {section.estimatedLength}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                        {section.subsections.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">子章节：</span>
                            {section.subsections.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 关键词和建议 */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">关键词</h3>
                    <div className="flex flex-wrap gap-2">
                      {outlineResult.keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">写作建议</h3>
                    <ul className="space-y-1">
                      {outlineResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleInsertOutline}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    插入到编辑器
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    打印
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">等待生成大纲</p>
                  <p className="text-sm">填写左侧表单并点击"生成智能大纲"按钮</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
