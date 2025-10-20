import React, { useState } from 'react'
import { DocumentTemplate, getTemplatesByCategory } from '../data/templates'
import { useFileSystemStore } from '../store/fileSystemStore'

interface TemplateSelectorProps {
  onClose: () => void
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onClose }) => {
  const { createFile } = useFileSystemStore()
  const [selectedCategory, setSelectedCategory] = useState<DocumentTemplate['category']>('academic')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { key: 'academic', label: '学术论文', icon: '📄' },
    { key: 'thesis', label: '学位论文', icon: '🎓' },
    { key: 'report', label: '报告', icon: '📊' },
    { key: 'presentation', label: '演示文稿', icon: '📽️' },
    { key: 'letter', label: '信件', icon: '✉️' }
  ] as const

  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTemplateSelect = (template: DocumentTemplate) => {
    createFile(`${template.name}.tex`, template.content)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">选择文档模板</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 搜索和分类 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {categories.find(c => c.key === template.category)?.label}
                  </span>
                  <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                    使用模板 →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到匹配的模板</h3>
              <p className="text-gray-500">尝试使用不同的搜索词或选择其他分类</p>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              选择模板后，将创建一个新的LaTeX文件
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
