import React, { useState } from 'react'
import { AIPlanStep, AIThinkingProcess } from '../services/aiPlanningService'

interface AIPlanningPanelProps {
  thinkingProcess: AIThinkingProcess
  onApproveStep: (stepId: string) => void
  onSkipStep: (stepId: string) => void
  onExecutePlan: () => void
  onCancelPlan: () => void
}

export const AIPlanningPanel: React.FC<AIPlanningPanelProps> = ({
  thinkingProcess,
  onApproveStep,
  onSkipStep,
  onExecutePlan,
  onCancelPlan
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analysis', 'plan']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getStepStatusIcon = (status: AIPlanStep['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'executing': return '⚡'
      case 'completed': return '🎉'
      case 'skipped': return '⏭️'
      default: return '❓'
    }
  }

  const getStepStatusColor = (status: AIPlanStep['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'executing': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-700 bg-green-200'
      case 'skipped': return 'text-gray-500 bg-gray-50'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">🧠</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">AI规划</h3>
        </div>
        <div className="text-sm text-gray-500">
          预计时间: {thinkingProcess.plan.estimatedTime}
        </div>
      </div>

      {/* 分析过程 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('analysis')}
          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium text-gray-700">📊 分析过程</span>
          <span className="text-gray-500">
            {expandedSections.has('analysis') ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.has('analysis') && (
          <div className="px-4 pb-4 space-y-3">
            <div className="text-sm text-gray-600">
              <strong>分析结果:</strong> {thinkingProcess.analysis}
            </div>
            
            <div>
              <strong className="text-sm text-gray-700">推理过程:</strong>
              <ul className="mt-2 space-y-1">
                {thinkingProcess.reasoning.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 执行计划 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('plan')}
          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium text-gray-700">📋 执行计划</span>
          <span className="text-gray-500">
            {expandedSections.has('plan') ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.has('plan') && (
          <div className="px-4 pb-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-800">{thinkingProcess.plan.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{thinkingProcess.plan.description}</p>
            </div>
            
            <div className="space-y-3">
                {thinkingProcess.plan.steps.map((step) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">{getStepStatusIcon(step.status)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-800">{step.title}</h5>
                        <span className={`px-2 py-1 text-xs rounded ${getStepStatusColor(step.status)}`}>
                          {step.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      
                      {step.status === 'pending' && !step.autoApprove && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => onApproveStep(step.id)}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            ✅ 批准执行
                          </button>
                          <button
                            onClick={() => onSkipStep(step.id)}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            ⏭️ 跳过
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 替代方案 */}
      {thinkingProcess.alternatives.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('alternatives')}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">🔄 替代方案</span>
            <span className="text-gray-500">
              {expandedSections.has('alternatives') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('alternatives') && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {thinkingProcess.alternatives.map((alternative, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{alternative}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 风险评估 */}
      {thinkingProcess.risks.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('risks')}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">⚠️ 风险评估</span>
            <span className="text-gray-500">
              {expandedSections.has('risks') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('risks') && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {thinkingProcess.risks.map((risk, index) => (
                  <li key={index} className="text-sm text-orange-600 flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onExecutePlan}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          🚀 开始执行计划
        </button>
        <button
          onClick={onCancelPlan}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
        >
          ❌ 取消
        </button>
      </div>
    </div>
  )
}

export default AIPlanningPanel
