import React, { useState } from 'react'
import { Header } from './Header'
import { FileTree } from './FileTree'
import { Editor } from './Editor'
import { AIAssistant } from './AIAssistant'
import { ResizableLayout } from './ResizableLayout'
import { useLayoutStore } from '../store/layoutStore'

interface LayoutProps {
  onToggleTestPanel?: () => void
  showTestPanel?: boolean
}

export const Layout: React.FC<LayoutProps> = ({ onToggleTestPanel, showTestPanel }) => {
  const {
    leftPanelWidth,
    rightPanelWidth,
    setLeftPanelWidth,
    setRightPanelWidth
  } = useLayoutStore()

  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiContentToInsert, setAiContentToInsert] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <Header 
        onToggleAI={() => setShowAIPanel(!showAIPanel)} 
        showAI={showAIPanel}
        onToggleTestPanel={onToggleTestPanel}
        showTestPanel={showTestPanel}
      />
      <div className="flex flex-1 overflow-hidden">
        <ResizableLayout
          leftPanel={<FileTree />}
          centerPanel={<Editor contentToInsert={aiContentToInsert} onContentInserted={() => setAiContentToInsert(null)} />}
          rightPanel={<AIAssistant onInsertContent={(content) => {
            setAiContentToInsert(content)
          }} />}
          leftPanelWidth={leftPanelWidth}
          rightPanelWidth={rightPanelWidth}
          showRightPanel={showAIPanel}
          onLeftPanelResize={setLeftPanelWidth}
          onRightPanelResize={setRightPanelWidth}
        />
      </div>
    </div>
  )
}
