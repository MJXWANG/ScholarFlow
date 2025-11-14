import { useState } from 'react'
import { Layout } from './components/Layout'
import { DocumentAnalysisPanel } from './components/DocumentAnalysisPanel'

function App() {
  const [showTestPanel, setShowTestPanel] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* 测试面板切换按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
          title="切换测试面板"
        >
          {showTestPanel ? '📝 返回编辑器' : '🧪 测试面板'}
        </button>
      </div>
      
      {showTestPanel ? <DocumentAnalysisPanel /> : <Layout />}
    </div>
  )
}

export default App
