import { useState } from 'react'
import { Layout } from './components/Layout'
import { DocumentAnalysisPanel } from './components/DocumentAnalysisPanel'

function App() {
  const [showTestPanel, setShowTestPanel] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {showTestPanel ? (
        <DocumentAnalysisPanel />
      ) : (
        <Layout onToggleTestPanel={() => setShowTestPanel(!showTestPanel)} showTestPanel={showTestPanel} />
      )}
    </div>
  )
}

export default App
