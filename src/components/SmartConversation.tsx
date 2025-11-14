import React, { useState, useEffect, useRef } from 'react'
import { useAIStore } from '../store/aiStore'
import { useFileSystemStore } from '../store/fileSystemStore'
import { IntentType } from '../services/intentUnderstandingService'
import { AIPlanningService, AIThinkingProcess } from '../services/aiPlanningService'
// Cursor风格：不需要规划面板
// import { AIPlanningPanel } from './AIPlanningPanel'

interface SmartConversationProps {
  onInsertContent?: (content: string) => void
}

export const SmartConversation: React.FC<SmartConversationProps> = ({ onInsertContent }) => {
  const { 
    isProcessingIntent,
    currentIntent,
    aiResponse,
    conversationHistory,
    proactiveSuggestions,
    documentIssues,
    error,
    clearError,
    processUserInput,
    updateDocumentContext,
    generateProactiveSuggestions,
    detectDocumentIssues,
    setFileSystemStore,
    addToConversationHistory
  } = useAIStore()

  const { getCurrentFile } = useFileSystemStore()
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isAutoExecuting, setIsAutoExecuting] = useState(false)
  const [thinkingProcess, setThinkingProcess] = useState<AIThinkingProcess | null>(null)
  // Cursor风格：不显示规划面板，自动执行
  // const [showPlanningPanel, setShowPlanningPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 简化的状态管理
  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationHistory])

  // 简化的同步逻辑
  useEffect(() => {
    // 暂时禁用全局协调功能
  }, [currentIntent, aiResponse, conversationHistory, isGlobalSyncEnabled]);

  // 更新文档上下文
  useEffect(() => {
    const currentFile = getCurrentFile()
    if (currentFile) {
      updateDocumentContext({
        content: currentFile.content,
        type: 'research', // 可以根据文件内容自动检测
        field: 'computer science', // 可以从用户偏好获取
        stage: 'writing',
        wordCount: currentFile.content.length,
        lastModified: new Date()
      })
      
      // 生成主动建议和检测问题
      generateProactiveSuggestions()
      detectDocumentIssues()
    } else {
      // 如果没有当前文件，创建一个默认的文档上下文
      updateDocumentContext({
        content: '',
        type: 'research',
        field: 'computer science',
        stage: 'outline',
        wordCount: 0,
        lastModified: new Date()
      })
    }
  }, [getCurrentFile, updateDocumentContext, generateProactiveSuggestions, detectDocumentIssues])

  // 初始化文件系统store
  useEffect(() => {
    setFileSystemStore(useFileSystemStore.getState())
  }, [setFileSystemStore])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessingIntent || isAutoExecuting) return

    const userInput = inputValue.trim()
    setInputValue('')
    
    try {
      // 显示思考过程
      addToConversationHistory(userInput, '🧠 正在分析你的需求...')
      
      // 生成AI规划
      const planning = await AIPlanningService.analyzeAndPlan(userInput)
      setThinkingProcess(planning)
      
      // 更新对话历史 - 显示思考过程
      addToConversationHistory('', `📋 ${planning.plan.title}`)
      
      // Cursor风格：自动执行，不需要用户批准！
      setIsAutoExecuting(true)
      
      try {
        // 自动执行所有步骤
        for (const step of planning.plan.steps) {
          // 执行步骤
          const result = await AIPlanningService.executePlanStep(step)
          
          // 如果生成了大纲内容，显示在对话中
          if (result.success && result.result && step.action === 'generate_outline') {
            addToConversationHistory('', `\n${result.result}`)
          }
        }
        
        addToConversationHistory('', `\n✅ 完成！`)
        
      } catch (executeError) {
        console.error('执行失败:', executeError)
        addToConversationHistory('', `❌ 执行失败: ${executeError instanceof Error ? executeError.message : '未知错误'}`)
      } finally {
        setIsAutoExecuting(false)
      }
      
    } catch (error) {
      console.error('Error processing user input:', error)
      addToConversationHistory('', `❌ 处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleQuickAction = async (action: string) => {
    setInputValue(action)
    await processUserInput(action)
  }

  // Cursor风格：移除复杂的规划面板处理函数
  // 现在是自动执行，不需要手动批准和执行

  const getIntentIcon = (intentType: IntentType) => {
    const icons = {
      [IntentType.GENERATE]: '✨',
      [IntentType.MODIFY]: '✏️',
      [IntentType.FORMAT]: '📝',
      [IntentType.CITE]: '📚',
      [IntentType.COLLABORATE]: '👥',
      [IntentType.ANALYZE]: '🔍',
      [IntentType.SUGGEST]: '💡',
      [IntentType.HELP]: '❓'
    }
    return icons[intentType] || '💬'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <h2 className="text-sm font-medium text-gray-800">智能写作助手</h2>
          {isProcessingIntent && (
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>正在思考...</span>
            </div>
          )}
          {isAutoExecuting && (
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>正在自动执行...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {showSuggestions ? '隐藏建议' : '显示建议'}
          </button>
        </div>
      </div>

      {/* 主动建议和问题检测 */}
      {showSuggestions && (
        <div className="border-b border-gray-200 p-4 bg-gray-50 max-h-40 overflow-y-auto">
          {/* 主动建议 */}
          {proactiveSuggestions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">💡 主动建议</h4>
              <div className="space-y-1">
                {proactiveSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${getPriorityColor(suggestion.priority)} cursor-pointer hover:opacity-80`}
                    onClick={() => handleQuickAction(suggestion.action)}
                  >
                    <div className="font-medium">{suggestion.message}</div>
                    <div className="text-xs opacity-75">{suggestion.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 文档问题 */}
          {documentIssues.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">⚠️ 检测到问题</h4>
              <div className="space-y-1">
                {documentIssues.slice(0, 3).map((issue, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${getSeverityColor(issue.severity)} cursor-pointer hover:opacity-80`}
                    onClick={() => handleQuickAction(`帮我${issue.suggestion}`)}
                  >
                    <div className="font-medium">{issue.message}</div>
                    <div className="text-xs opacity-75">{issue.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 对话历史 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* 简化的状态显示 */}
        {isGlobalSyncEnabled && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">全局协调已启用</span>
              </div>
              <button
                onClick={() => setIsGlobalSyncEnabled(!isGlobalSyncEnabled)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {isGlobalSyncEnabled ? '禁用' : '启用'}
              </button>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              <div>当前任务: 无</div>
              <div>当前文件: 无</div>
              <div>项目阶段: planning</div>
            </div>
          </div>
        )}
        
        {/* 欢迎消息 */}
        {conversationHistory.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-medium text-blue-800">AI助手</span>
            </div>
            <p className="text-sm text-blue-700">
              你好！我是你的AI科研写作助手。我可以帮助你：
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• 生成论文大纲和内容</li>
              <li>• 润色和修改文本</li>
              <li>• 检查格式和引用</li>
              <li>• 提供写作建议</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              直接告诉我你想要做什么，比如"帮我写一个关于深度学习的引言"。
            </p>
          </div>
        )}

        {/* 对话消息 */}
        {conversationHistory.map((message, index) => (
          <div key={index} className="space-y-2">
            {/* 用户消息 */}
            <div className="flex justify-end">
              <div className="max-w-xs lg:max-w-md px-3 py-2 bg-blue-500 text-white rounded-lg text-sm">
                {message.user}
              </div>
            </div>

            {/* AI回复 */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  {message.intent && (
                    <span className="text-xs text-gray-500">
                      {getIntentIcon(message.intent.type)} {message.intent.type}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800">
                  {message.ai}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 当前AI响应 */}
        {aiResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                {currentIntent && (
                  <span className="text-xs text-gray-500">
                    {getIntentIcon(currentIntent.type)} {currentIntent.type}
                  </span>
                )}
              </div>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800">
                {aiResponse.message}
              </div>
              
              {/* 建议的行动 */}
              {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {aiResponse.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(suggestion)}
                      className="block w-full text-left text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 插入内容按钮 */}
              {aiResponse.message && aiResponse.message.length > 100 && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      if (onInsertContent) {
                        onInsertContent(aiResponse.message)
                      }
                    }}
                    className="w-full text-xs px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    📝 插入到编辑器
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

        <div ref={messagesEndRef} />
      </div>

      {/* Cursor风格：移除规划面板，自动执行 */}

      {/* 输入框 */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="告诉我你想要做什么..."
            disabled={isProcessingIntent || isAutoExecuting}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isProcessingIntent || isAutoExecuting}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingIntent ? '思考中...' : isAutoExecuting ? '执行中...' : '发送'}
          </button>
        </form>
        
        {/* 快速操作按钮 */}
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            '帮我生成论文大纲',
            '润色这段文字',
            '检查引用格式',
            '改进段落结构',
            '添加相关引用'
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action)}
              disabled={isProcessingIntent || isAutoExecuting}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
