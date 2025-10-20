import React from 'react'
import { DiffLine } from '../store/versionControlStore'

interface VersionDiffDisplayProps {
  versionData: any
  diffData: DiffLine[] | null
}

export const VersionDiffDisplay: React.FC<VersionDiffDisplayProps> = ({ 
  versionData, 
  diffData 
}) => {
  if (!versionData || !diffData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        加载中...
      </div>
    )
  }

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

  const addedCount = diffData.filter(l => l.type === 'added').length
  const removedCount = diffData.filter(l => l.type === 'removed').length
  const modifiedCount = diffData.filter(l => l.type === 'modified').length

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {versionData.description}
          </h3>
          <p className="text-sm text-gray-500">
            {versionData.timestamp.toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            <span>新增 {addedCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            <span>删除 {removedCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-yellow-500 rounded"></span>
            <span>修改 {modifiedCount}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="font-mono text-sm">
          {diffData.map((line, index) => (
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
            共 {diffData.length} 行
          </div>
          <div className="text-xs text-gray-500">
            相对于前一个版本的变化
          </div>
        </div>
      </div>
    </div>
  )
}
