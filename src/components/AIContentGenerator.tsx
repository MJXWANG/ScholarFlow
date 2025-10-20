import React, { useState } from 'react'
import { useAIStore } from '../store/aiStore'
import { ContentRequest } from '../services/aiService'

interface AIContentGeneratorProps {
  onClose: () => void
  onInsertContent: (content: string) => void
  currentSection?: string
  existingContent?: string
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ 
  onClose, 
  onInsertContent,
  currentSection = '',
  existingContent = ''
}) => {
  const { 
    generateContent, 
    isGeneratingContent, 
    contentResult, 
    error, 
    clearError,
    preferences,
    updatePreferences
  } = useAIStore()

  const [formData, setFormData] = useState<ContentRequest>({
    section: currentSection,
    keywords: [],
    context: '',
    length: 'medium',
    style: preferences.style,
    field: preferences.field,
    language: preferences.language,
    existingContent: existingContent
  })

  const [keywordInput, setKeywordInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.section.trim()) return

    await generateContent(formData)
  }

  const handleInsertContent = () => {
    if (contentResult) {
      onInsertContent(contentResult.content)
      onClose()
    }
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleFieldChange = (field: keyof ContentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 更新全局偏好
    if (field === 'language' || field === 'style' || field === 'field') {
      updatePreferences({ [field]: value })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">智能内容生成器</h2>
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
                <h3 className="text-lg font-medium text-gray-900">内容信息</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    章节名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => handleFieldChange('section', e.target.value)}
                    placeholder="例如：引言、相关工作、方法论"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    子章节 (可选)
                  </label>
                  <input
                    type="text"
                    value={formData.subsection || ''}
                    onChange={(e) => handleFieldChange('subsection', e.target.value)}
                    placeholder="例如：问题定义、研究目标"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究领域
                  </label>
                  <select
                    value={formData.field}
                    onChange={(e) => handleFieldChange('field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上下文信息
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => handleFieldChange('context', e.target.value)}
                    placeholder="描述这个章节应该包含什么内容，有什么特殊要求..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关键词
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      placeholder="输入关键词后按回车添加"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容长度
                    </label>
                    <select
                      value={formData.length}
                      onChange={(e) => handleFieldChange('length', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="short">短篇 (300-500字)</option>
                      <option value="medium">中篇 (500-800字)</option>
                      <option value="long">长篇 (800-1200字)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      写作风格
                    </label>
                    <select
                      value={formData.style}
                      onChange={(e) => handleFieldChange('style', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="academic">学术风格</option>
                      <option value="formal">正式风格</option>
                      <option value="casual">轻松风格</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="chinese">中文</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isGeneratingContent || !formData.section.trim()}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isGeneratingContent || !formData.section.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isGeneratingContent ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>生成中...</span>
                  </div>
                ) : (
                  '生成智能内容'
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

            {contentResult ? (
              <div className="space-y-6">
                {/* 生成的内容 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">生成内容</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{contentResult.content}</p>
                  </div>
                </div>

                {/* 写作建议 */}
                {contentResult.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">写作建议</h3>
                    <ul className="space-y-1">
                      {contentResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 相关引用 */}
                {contentResult.references.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">相关引用</h3>
                    <ul className="space-y-1">
                      {contentResult.references.map((reference, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{reference}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 改进建议 */}
                {contentResult.improvements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">改进建议</h3>
                    <ul className="space-y-1">
                      {contentResult.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 下一步 */}
                {contentResult.nextSteps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">下一步</h3>
                    <ul className="space-y-1">
                      {contentResult.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleInsertContent}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">等待生成内容</p>
                  <p className="text-sm">填写左侧表单并点击"生成智能内容"按钮</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
