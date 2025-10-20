import React, { useState } from 'react'
import { useVersionControlStore } from '../store/versionControlStore'
import { VersionDiffDisplay } from './VersionDiffDisplay'
import { 
  ClockIcon, 
  ArrowUturnLeftIcon, 
  EyeIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface VersionHistoryProps {
  onRevert: (content: string) => void
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ onRevert }) => {
  const { 
    versions, 
    currentVersionId, 
    revertToVersion, 
    deleteVersion,
    getVersionChanges
  } = useVersionControlStore()
  
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const handleRevert = (versionId: string) => {
    const content = revertToVersion(versionId)
    if (content !== null) {
      onRevert(content)
    }
  }

  const handleShowDiff = (versionId: string) => {
    setSelectedVersion(versionId)
    setShowDiff(true)
  }

  const getSelectedVersionData = () => {
    if (!selectedVersion) return null
    return versions.find(v => v.id === selectedVersion)
  }

  const getVersionDiffData = () => {
    if (!selectedVersion) return null
    return getVersionChanges(selectedVersion)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h2 className="text-sm font-medium text-foreground">版本历史</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {versions.length} 个版本
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {versions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无版本历史</p>
            <p className="text-xs text-gray-400">开始编辑文档后会自动创建版本</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-3 ${
                  version.id === currentVersionId 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {version.description}
                      </span>
                      {version.id === currentVersionId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          当前版本
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {version.timestamp.toLocaleString('zh-CN')}
                    </div>
                    {version.changes && version.changes.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {version.changes.length} 处变化
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleShowDiff(version.id)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="查看差异"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {version.id !== currentVersionId && (
                      <button
                        onClick={() => handleRevert(version.id)}
                        className="p-1 text-gray-400 hover:text-green-500"
                        title="回退到此版本"
                      >
                        <ArrowUturnLeftIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteVersion(version.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="删除版本"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 全文差异显示模态框 */}
      {showDiff && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                版本差异对比 - {getSelectedVersionData()?.description}
              </h3>
              <button
                onClick={() => setShowDiff(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="h-[70vh]">
              <VersionDiffDisplay
                versionData={getSelectedVersionData()}
                diffData={getVersionDiffData()}
              />
            </div>
            <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  handleRevert(selectedVersion)
                  setShowDiff(false)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
              >
                回退到此版本
              </button>
              <button
                onClick={() => setShowDiff(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
