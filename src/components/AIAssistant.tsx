import React, { useState } from 'react'
import { useAIStore } from '../store/aiStore'
import { AIOutlineGenerator } from './AIOutlineGenerator'
import { AIContentGenerator } from './AIContentGenerator'
import { AILanguagePolisher } from './AILanguagePolisher'
import { SmartConversation } from './SmartConversation'

interface AIAssistantProps {
  onInsertContent?: (content: string) => void
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onInsertContent }) => {
  const { 
    isGeneratingOutline, 
    isGeneratingContent, 
    isPolishingText,
    error,
    clearError
  } = useAIStore()

  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false)
  const [showContentGenerator, setShowContentGenerator] = useState(false)
  const [showLanguagePolisher, setShowLanguagePolisher] = useState(false)
  const [showSmartConversation, setShowSmartConversation] = useState(true)

  const handleInsertContent = (content: string) => {
    if (onInsertContent) {
      onInsertContent(content)
    }
  }

  const getStatusMessage = () => {
    if (isGeneratingOutline) return '正在生成智能大纲...'
    if (isGeneratingContent) return '正在生成智能内容...'
    if (isPolishingText) return '正在润色文本...'
    return null
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <h2 className="text-sm font-medium text-foreground">AI写作助手</h2>
          {statusMessage && (
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSmartConversation(!showSmartConversation)}
            className={`px-2 py-1 text-xs rounded ${
              showSmartConversation 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showSmartConversation ? '智能对话' : '传统模式'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {showSmartConversation ? (
          <SmartConversation onInsertContent={handleInsertContent} />
        ) : (
          <div className="h-full p-4 space-y-4 overflow-y-auto">
            {/* 欢迎消息 */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                你好！我是你的AI学术写作助手。我可以帮助你生成大纲、创作内容、润色文本。
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    清除
                  </button>
                </div>
              </div>
            )}

            {/* 智能写作功能 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">智能写作</h3>
              
              <button 
                onClick={() => setShowOutlineGenerator(true)}
                disabled={isGeneratingOutline}
                className="w-full text-left p-3 text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">智能大纲生成</div>
                    <div className="text-xs text-gray-600">根据主题生成完整论文大纲</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setShowContentGenerator(true)}
                disabled={isGeneratingContent}
                className="w-full text-left p-3 text-sm bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">智能内容生成</div>
                    <div className="text-xs text-gray-600">为指定章节生成高质量内容</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setShowLanguagePolisher(true)}
                disabled={isPolishingText}
                className="w-full text-left p-3 text-sm bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">智能语言润色</div>
                    <div className="text-xs text-gray-600">改进文本清晰度和学术表达</div>
                  </div>
                </div>
              </button>
            </div>

            {/* 快速操作 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">快速操作</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border">
                  改进段落
                </button>
                <button className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border">
                  写作建议
                </button>
                <button className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border">
                  语法检查
                </button>
                <button className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border">
                  引用建议
                </button>
              </div>
            </div>

            {/* 使用统计 */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-700 mb-2">今日使用统计</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-blue-600">0</div>
                  <div className="text-gray-500">大纲生成</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">0</div>
                  <div className="text-gray-500">内容生成</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">0</div>
                  <div className="text-gray-500">文本润色</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showOutlineGenerator && (
        <AIOutlineGenerator
          onClose={() => setShowOutlineGenerator(false)}
          onInsertOutline={handleInsertContent}
        />
      )}

      {showContentGenerator && (
        <AIContentGenerator
          onClose={() => setShowContentGenerator(false)}
          onInsertContent={handleInsertContent}
        />
      )}

      {showLanguagePolisher && (
        <AILanguagePolisher
          onClose={() => setShowLanguagePolisher(false)}
          onInsertPolishedText={handleInsertContent}
        />
      )}
    </div>
  )
}
