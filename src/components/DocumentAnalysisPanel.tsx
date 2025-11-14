import React, { useState } from 'react'
import DocumentAnalysisService, { DocumentStructure, FieldDetection, QualityScore } from '../services/documentAnalysisService'
import IntentUnderstandingService from '../services/intentUnderstandingService'
import { DocumentContext, UserContext } from '../types'

export const DocumentAnalysisPanel: React.FC = () => {
  const [content, setContent] = useState<string>(`# 深度学习在计算机视觉中的应用研究

## 1. 引言

深度学习是机器学习的一个分支，近年来在计算机视觉领域取得了突破性进展。

## 2. 相关工作

### 2.1 卷积神经网络

卷积神经网络（CNN）是深度学习中最重要的模型之一。

### 2.2 迁移学习

迁移学习允许模型在一个任务上学到的知识应用到另一个任务。

## 3. 方法

本研究提出了一种新的深度学习框架。

## 4. 实验

## 5. 结论

本文证明了深度学习在计算机视觉中的有效性。`)
  
  const [structure, setStructure] = useState<DocumentStructure | null>(null)
  const [fieldDetection, setFieldDetection] = useState<FieldDetection | null>(null)
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null)
  const [issues, setIssues] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'structure' | 'issues' | 'suggestions' | 'quality' | 'field'>('structure')

  const analyzeDocument = async () => {
    setIsAnalyzing(true)
    try {
      // 1. 结构分析（本地，快速）
      console.time('结构分析')
      const structureResult = DocumentAnalysisService.analyzeStructure(content)
      setStructure(structureResult)
      console.timeEnd('结构分析')
      
      // 2. 问题检测（混合：本地+AI）
      console.time('问题检测')
      const documentContext: DocumentContext = {
        content,
        type: 'research',
        field: 'Computer Science',
        stage: 'writing',
        wordCount: content.length,
        lastModified: new Date()
      }
      const issuesResult = await IntentUnderstandingService.detectDocumentIssues(documentContext)
      setIssues(issuesResult)
      console.timeEnd('问题检测')
      
      // 3. 主动建议（混合：本地+AI）
      console.time('建议生成')
      const userContext: UserContext = {
        expertise: 'intermediate',
        preferences: {
          language: 'chinese',
          citationStyle: 'APA',
          style: 'academic'
        },
        workingHours: {
          preferredTime: 'morning',
          timezone: 'Asia/Shanghai'
        }
      }
      const suggestionsResult = await IntentUnderstandingService.generateProactiveSuggestions(
        documentContext,
        userContext
      )
      setSuggestions(suggestionsResult)
      console.timeEnd('建议生成')
      
      // 4. 领域识别（AI，可选）
      if (content.length > 200) {
        console.time('领域识别')
        try {
          const fieldResult = await DocumentAnalysisService.detectField(content)
          setFieldDetection(fieldResult)
          console.timeEnd('领域识别')
        } catch (e) {
          console.warn('领域识别跳过')
        }
      }
      
      // 5. 质量评估（AI，可选）
      if (content.length > 200) {
        console.time('质量评估')
        try {
          const qualityResult = await DocumentAnalysisService.evaluateQuality(content, structureResult)
          setQualityScore(qualityResult)
          console.timeEnd('质量评估')
        } catch (e) {
          console.warn('质量评估跳过')
        }
      }
      
    } catch (error) {
      console.error('分析失败:', error)
      alert('分析失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* 标题 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">📊 深度文档理解与分析</h1>
        <p className="text-sm text-gray-600 mt-1">测试AI驱动的文档分析功能</p>
      </div>

      {/* 内容编辑区 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          测试文档内容（支持Markdown）
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="在这里输入或编辑文档内容..."
        />
      </div>

      {/* 分析按钮 */}
      <button
        onClick={analyzeDocument}
        disabled={isAnalyzing || !content.trim()}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isAnalyzing || !content.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isAnalyzing ? '⏳ 分析中...' : '🚀 开始深度分析'}
      </button>

      {/* 结果区域 */}
      {structure && (
        <div className="mt-6 flex-1 overflow-hidden flex flex-col">
          {/* Tab导航 */}
          <div className="flex space-x-2 border-b border-gray-200 mb-4">
            {[
              { id: 'structure', label: '📐 结构分析', count: structure.statistics.totalSections },
              { id: 'issues', label: '⚠️ 问题检测', count: issues?.issues?.length || 0 },
              { id: 'suggestions', label: '💡 智能建议', count: suggestions?.suggestions?.length || 0 },
              { id: 'quality', label: '⭐ 质量评分', count: qualityScore ? 1 : 0 },
              { id: 'field', label: '🎓 领域识别', count: fieldDetection ? 1 : 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab内容 */}
          <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 border border-gray-200">
            {/* 结构分析 */}
            {activeTab === 'structure' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {structure.statistics.totalSections}
                    </div>
                    <div className="text-sm text-gray-600">总章节数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {structure.statistics.totalWordCount}
                    </div>
                    <div className="text-sm text-gray-600">总字数</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(structure.statistics.averageWordsPerSection)}
                    </div>
                    <div className="text-sm text-gray-600">平均字数/章节</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {structure.statistics.emptySections}
                    </div>
                    <div className="text-sm text-gray-600">空章节数</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">文档大纲</h3>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    {structure.outline.map((line, idx) => (
                      <div key={idx} className="py-1">{line}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">章节详情</h3>
                  <div className="space-y-2">
                    {structure.sections.map((section, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          section.hasContent ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">
                              {'#'.repeat(section.level)} {section.title}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              (行 {section.startLine}-{section.endLine})
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className={section.hasContent ? 'text-green-600' : 'text-red-600'}>
                              {section.wordCount} 字
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 问题检测 */}
            {activeTab === 'issues' && issues && (
              <div className="space-y-4">
                {issues.criticalCount !== undefined && (
                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span className="text-sm">严重 {issues.criticalCount}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                      <span className="text-sm">警告 {issues.warningCount}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-sm">提示 {issues.infoCount || 0}</span>
                    </div>
                  </div>
                )}

                {issues.issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.issues.map((issue: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm uppercase">{issue.type}</span>
                          {issue.location && (
                            <span className="text-xs text-gray-500">{issue.location}</span>
                          )}
                        </div>
                        <div className="text-gray-800 mb-2">{issue.message}</div>
                        <div className="text-sm text-gray-600">
                          💡 建议: {issue.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    ✅ 未发现明显问题
                  </div>
                )}

                {issues.suggestions && issues.suggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">整体建议</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {issues.suggestions.map((sugg: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">{sugg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 智能建议 */}
            {activeTab === 'suggestions' && suggestions && (
              <div className="space-y-4">
                {suggestions.suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.suggestions.map((sugg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${getPriorityColor(sugg.priority)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm uppercase">{sugg.type}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            sugg.priority === 'high' ? 'bg-red-200 text-red-800' :
                            sugg.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {sugg.priority === 'high' ? '高优先级' : 
                             sugg.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                        </div>
                        <div className="text-gray-800 font-medium mb-2">{sugg.message}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          🎯 行动: {sugg.action}
                        </div>
                        <div className="text-xs text-gray-500">
                          📌 理由: {sugg.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无建议
                  </div>
                )}

                {suggestions.nextSteps && suggestions.nextSteps.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 下一步行动</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {suggestions.nextSteps.map((step: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {suggestions.fieldInfo && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🎓 识别领域信息</h4>
                    <p className="text-sm">
                      <strong>领域:</strong> {suggestions.fieldInfo.detectedField}
                      <span className="ml-2 text-gray-600">
                        (置信度: {(suggestions.fieldInfo.confidence * 100).toFixed(0)}%)
                      </span>
                    </p>
                    {suggestions.fieldInfo.suggestedCitations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">建议引用:</p>
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                          {suggestions.fieldInfo.suggestedCitations.map((cite: string, idx: number) => (
                            <li key={idx}>{cite}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 质量评分 */}
            {activeTab === 'quality' && qualityScore && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="text-6xl font-bold text-blue-600">
                    {qualityScore.overall.toFixed(1)}
                  </div>
                  <div className="text-gray-600 mt-2">总体评分</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '结构完整性', value: qualityScore.structure, color: 'blue' },
                    { label: '清晰度', value: qualityScore.clarity, color: 'green' },
                    { label: '连贯性', value: qualityScore.coherence, color: 'purple' },
                    { label: '学术性', value: qualityScore.academic, color: 'orange' }
                  ].map(metric => (
                    <div key={metric.label} className={`p-4 rounded-lg bg-${metric.color}-50`}>
                      <div className={`text-3xl font-bold text-${metric.color}-600`}>
                        {metric.value.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${metric.color}-600 h-2 rounded-full transition-all`}
                          style={{ width: `${metric.value * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {qualityScore.feedback && qualityScore.feedback.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">详细反馈</h4>
                    <ul className="space-y-2">
                      {qualityScore.feedback.map((fb: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-sm text-gray-700">{fb}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 领域识别 */}
            {activeTab === 'field' && fieldDetection && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {fieldDetection.primaryField}
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600">置信度:</div>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${fieldDetection.confidence * 100}%` }}
                      />
                    </div>
                    <div className="ml-2 text-sm font-medium">
                      {(fieldDetection.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {fieldDetection.subFields.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">子领域</h4>
                    <div className="flex flex-wrap gap-2">
                      {fieldDetection.subFields.map((field: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {fieldDetection.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">关键词</h4>
                    <div className="flex flex-wrap gap-2">
                      {fieldDetection.keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {fieldDetection.suggestedCitations.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold mb-3">📚 建议引用的经典文献</h4>
                    <ul className="space-y-2">
                      {fieldDetection.suggestedCitations.map((citation: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-yellow-600 mr-2">{idx + 1}.</span>
                          <span className="text-sm text-gray-700">{citation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentAnalysisPanel

