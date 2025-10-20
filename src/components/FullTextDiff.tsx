import React from 'react'
import { DiffLine, calculateFullDiff } from '../store/versionControlStore'

interface FullTextDiffProps {
  oldContent: string
  newContent: string
  title?: string
}

export const FullTextDiff: React.FC<FullTextDiffProps> = ({ 
  oldContent, 
  newContent, 
  title = "版本差异对比" 
}) => {
  const diffLines = calculateFullDiff(oldContent, newContent)
  
  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-800'
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-800'
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800'
      default:
        return 'bg-white text-gray-900'
    }
  }
  
  const getLineIcon = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+'
      case 'removed':
        return '-'
      case 'modified':
        return '~'
      default:
        return ' '
    }
  }
  
  const getLineIconColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'text-green-600'
      case 'removed':
        return 'text-red-600'
      case 'modified':
        return 'text-yellow-600'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            <span>新增</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            <span>删除</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-yellow-500 rounded"></span>
            <span>修改</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="font-mono text-sm">
          {diffLines.map((line, index) => (
            <div
              key={index}
              className={`flex items-start px-4 py-1 ${getLineStyle(line.type)}`}
            >
              <div className={`w-6 text-center font-bold ${getLineIconColor(line.type)}`}>
                {getLineIcon(line.type)}
              </div>
              <div className="w-16 text-right text-gray-500 pr-2 select-none">
                {line.lineNumber}
              </div>
              <div className="flex-1 whitespace-pre-wrap">
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-border bg-gray-50 px-4 py-2">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            共 {diffLines.length} 行
          </div>
          <div className="flex space-x-4">
            <span>
              新增: {diffLines.filter(l => l.type === 'added').length} 行
            </span>
            <span>
              删除: {diffLines.filter(l => l.type === 'removed').length} 行
            </span>
            <span>
              修改: {diffLines.filter(l => l.type === 'modified').length} 行
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
