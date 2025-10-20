import React, { useState, useRef, useCallback } from 'react'

interface ResizableLayoutProps {
  leftPanel: React.ReactNode  // File tree
  centerPanel: React.ReactNode  // Editor (main content area)
  rightPanel: React.ReactNode  // AI assistant overlay
  leftPanelWidth?: number
  rightPanelWidth?: number
  showRightPanel?: boolean
  onLeftPanelResize?: (width: number) => void
  onRightPanelResize?: (width: number) => void
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelWidth = 300,
  rightPanelWidth = 350,
  showRightPanel = false,
  onLeftPanelResize,
  onRightPanelResize
}) => {
  const [leftWidth, setLeftWidth] = useState(leftPanelWidth)
  const [rightWidth, setRightWidth] = useState(rightPanelWidth)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLeftResize = useCallback((width: number) => {
    setLeftWidth(width)
    onLeftPanelResize?.(width)
  }, [onLeftPanelResize])

  const handleRightResize = useCallback((width: number) => {
    setRightWidth(width)
    onRightPanelResize?.(width)
  }, [onRightPanelResize])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return

    if (isResizingLeft) {
      const newLeftWidth = Math.max(200, Math.min(600, e.clientX))
      handleLeftResize(newLeftWidth)
    } else if (isResizingRight) {
      const containerWidth = containerRef.current.offsetWidth
      const newRightWidth = Math.max(250, Math.min(700, containerWidth - e.clientX))
      handleRightResize(newRightWidth)
    }
  }, [isResizingLeft, isResizingRight, handleLeftResize, handleRightResize])

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  React.useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Left Panel */}
      <div
        className="border-r border-border bg-card flex-shrink-0"
        style={{ width: `${leftWidth}px` }}
      >
        {leftPanel}
      </div>

      {/* Left Resizer */}
      <div
        className="w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors flex-shrink-0"
        onMouseDown={() => setIsResizingLeft(true)}
      />

      {/* Right Panel - Editor + AI Overlay */}
      <div className="flex-1 flex flex-col min-w-0 relative w-full">
        {centerPanel}
        
        {/* AI Panel - Overlay on top of editor */}
        {showRightPanel && (
          <>
            {/* AI Panel Resizer */}
            <div
              className="absolute top-0 right-0 w-1 h-full bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-20"
              style={{ right: `${rightWidth}px` }}
              onMouseDown={() => setIsResizingRight(true)}
            />
            
            {/* AI Panel */}
            <div
              className="absolute top-0 right-0 h-full border-l border-border bg-card shadow-lg z-10"
              style={{ width: `${rightWidth}px` }}
            >
              {rightPanel}
            </div>
          </>
        )}
      </div>
    </div>
  )
}