import React, { useState } from 'react'
import { useAIStore } from '../store/aiStore'
import { PolishRequest } from '../services/aiService'

interface AILanguagePolisherProps {
  onClose: () => void
  onInsertPolishedText: (text: string) => void
  initialText?: string
}

export const AILanguagePolisher: React.FC<AILanguagePolisherProps> = ({ 
  onClose, 
  onInsertPolishedText,
  initialText = ''
}) => {
  const { 
    polishText, 
    isPolishingText, 
    polishResult, 
    error, 
    clearError,
    preferences,
    updatePreferences
  } = useAIStore()

  const [formData, setFormData] = useState<PolishRequest>({
    text: initialText,
    style: preferences.style,
    field: preferences.field,
    language: preferences.language,
    targetAudience: preferences.targetAudience
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text.trim()) return

    await polishText(formData)
  }

  const handleInsertPolishedText = () => {
    if (polishResult) {
      onInsertPolishedText(polishResult.polishedText)
      onClose()
    }
  }

  const handleFieldChange = (field: keyof PolishRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 更新全局偏好
    if (field === 'language' || field === 'style' || field === 'field' || field === 'targetAudience') {
      updatePreferences({ [field]: value })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">智能语言润色器</h2>
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
              {/* 文本输入 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">润色设置</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    待润色文本 *
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => handleFieldChange('text', e.target.value)}
                    placeholder="输入需要润色的文本..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    字符数: {formData.text.length}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究领域
                  </label>
                  <select
                    value={formData.field}
                    onChange={(e) => handleFieldChange('field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      写作风格
                    </label>
                    <select
                      value={formData.style}
                      onChange={(e) => handleFieldChange('style', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="academic">学术风格</option>
                      <option value="formal">正式风格</option>
                      <option value="casual">轻松风格</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目标读者
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => handleFieldChange('targetAudience', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="general">普通读者</option>
                      <option value="expert">专家读者</option>
                      <option value="student">学生读者</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="chinese">中文</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isPolishingText || !formData.text.trim()}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isPolishingText || !formData.text.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isPolishingText ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>润色中...</span>
                  </div>
                ) : (
                  '开始润色'
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
                  <span className="text-red-700 font-medium">润色失败</span>
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

            {polishResult ? (
              <div className="space-y-6">
                {/* 润色后的文本 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">润色后的文本</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{polishResult.polishedText}</p>
                  </div>
                </div>

                {/* 质量评分 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">质量评分</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(polishResult.score.clarity)} ${getScoreColor(polishResult.score.clarity)}`}>
                        清晰度: {polishResult.score.clarity}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(polishResult.score.flow)} ${getScoreColor(polishResult.score.flow)}`}>
                        流畅度: {polishResult.score.flow}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(polishResult.score.academic)} ${getScoreColor(polishResult.score.academic)}`}>
                        学术性: {polishResult.score.academic}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(polishResult.score.overall)} ${getScoreColor(polishResult.score.overall)}`}>
                        总体: {polishResult.score.overall}/10
                      </div>
                    </div>
                  </div>
                </div>

                {/* 修改详情 */}
                {polishResult.changes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">修改详情</h3>
                    <div className="space-y-3">
                      {polishResult.changes.map((change, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-start space-x-3">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              change.type === 'grammar' ? 'bg-red-100 text-red-800' :
                              change.type === 'style' ? 'bg-blue-100 text-blue-800' :
                              change.type === 'clarity' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {change.type === 'grammar' ? '语法' :
                               change.type === 'style' ? '风格' :
                               change.type === 'clarity' ? '清晰' : '流畅'}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">原文:</span> {change.original}
                              </div>
                              <div className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">修改:</span> {change.improved}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">原因:</span> {change.reason}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 建议 */}
                {polishResult.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">改进建议</h3>
                    <ul className="space-y-1">
                      {polishResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleInsertPolishedText}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
                  <p className="text-lg font-medium mb-2">等待润色文本</p>
                  <p className="text-sm">输入文本并点击"开始润色"按钮</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
