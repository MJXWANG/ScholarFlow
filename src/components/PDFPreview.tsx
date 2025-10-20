import React, { useState, useEffect, useRef } from 'react'
import { CompilationResult } from '../services/latexCompiler'
import { 
  DocumentIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface PDFPreviewProps {
  compilationResult: CompilationResult | null
  isCompiling: boolean
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  compilationResult, 
  isCompiling 
}) => {
  const [showLog, setShowLog] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [customScale, setCustomScale] = useState('100')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // const [pdfDoc, setPdfDoc] = useState<any>(null)
  const renderTimeoutRef = useRef<number | null>(null)

  // 加载PDF.js
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        // 动态导入PDF.js
        const pdfjsLib = await import('pdfjs-dist')
        // 使用3.11.174版本的worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        console.log('PDF.js 3.11.174 loaded')
      } catch (error) {
        console.error('Failed to load PDF.js:', error)
      }
    }
    loadPDFJS()
  }, [])

  // 渲染PDF页面
  useEffect(() => {
    const renderPDF = async () => {
      if (!compilationResult?.pdfBlob) {
        console.log('PDF render skipped: no blob')
        return
      }

      try {
        console.log('Starting PDF render...')
        const pdfjsLib = await import('pdfjs-dist')
        const arrayBuffer = await compilationResult.pdfBlob.arrayBuffer()
        console.log('PDF arrayBuffer size:', arrayBuffer.byteLength)
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        console.log('PDF loaded, pages:', pdf.numPages)
        
        // setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        
        // 等待DOM更新后再渲染所有页面
        setTimeout(async () => {
          if (!canvasRef.current) {
            console.log('Canvas not ready, retrying...')
            setTimeout(() => renderPDF(), 100)
            return
          }
          
          // 渲染所有页面到连续视图
          await renderAllPages(pdf)
        }, 0)
      } catch (error) {
        console.error('Failed to render PDF:', error)
      }
    }

    // 清除之前的定时器
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    // 防抖渲染
    renderTimeoutRef.current = setTimeout(() => {
      renderPDF()
    }, 100)

    // 清理函数
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
    }
  }, [compilationResult, scale])

  const renderAllPages = async (pdf: any) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    
    // 页面间距
    const pageSpacing = 20
    
    // 计算总高度和最大宽度
    let totalHeight = 0
    let maxWidth = 0
    const pageViewports: any[] = []
    
    // 获取所有页面的viewport信息
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: scale })
      pageViewports.push({ page, viewport })
      totalHeight += viewport.height
      maxWidth = Math.max(maxWidth, viewport.width)
      
      // 添加页面间距（除了最后一页）
      if (i < pdf.numPages) {
        totalHeight += pageSpacing
      }
    }
    
    // 设置canvas尺寸
    canvas.width = maxWidth
    canvas.height = totalHeight
    
    // 设置canvas的CSS尺寸
    canvas.style.width = maxWidth + 'px'
    canvas.style.height = totalHeight + 'px'
    
    // 清除canvas背景
    context.fillStyle = '#f5f5f5'
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    console.log('Canvas dimensions:', { width: maxWidth, height: totalHeight })
    console.log('Number of pages to render:', pageViewports.length)
    console.log('Scale factor:', scale)
    console.log('Canvas element:', canvas)
    console.log('Canvas computed style:', {
      width: canvas.style.width,
      height: canvas.style.height,
      offsetWidth: canvas.offsetWidth,
      offsetHeight: canvas.offsetHeight
    })
    
    // 诊断滚动问题
    setTimeout(() => {
      const container = canvas.parentElement?.parentElement?.parentElement
      if (container) {
        console.log('滚动容器信息:', {
          element: container,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          scrollTop: container.scrollTop,
          overflow: getComputedStyle(container).overflow,
          height: getComputedStyle(container).height,
          maxHeight: getComputedStyle(container).maxHeight
        })
        
        // 检查是否可以滚动
        const canScroll = container.scrollHeight > container.clientHeight
        console.log('是否可以滚动:', canScroll)
        
        if (!canScroll) {
          console.warn('⚠️ 滚动问题诊断:')
          console.warn('- 容器高度:', container.clientHeight)
          console.warn('- 内容高度:', container.scrollHeight)
          console.warn('- Canvas实际高度:', canvas.offsetHeight)
          console.warn('- Canvas样式高度:', canvas.style.height)
        }
      }
    }, 100)
    
    // 渲染所有页面
    let currentY = 0
    for (let i = 0; i < pageViewports.length; i++) {
      const { page, viewport } = pageViewports[i]
      
      console.log(`Rendering page ${i + 1} at Y position: ${currentY}`)
      
      // 保存当前context状态
      context.save()
      
      // 移动到当前页面的位置
      context.translate(0, currentY)
      
      // 渲染页面背景（白色）
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, viewport.width, viewport.height)
      
      // 渲染页面内容
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      // 恢复context状态
      context.restore()
      
      currentY += viewport.height
      
      // 添加页面间距（除了最后一页）
      if (i < pageViewports.length - 1) {
        currentY += pageSpacing
      }
      
      console.log(`Page ${i + 1} rendered, next Y position: ${currentY}`)
    }
    
    console.log('All PDF pages rendered successfully')
  }

  const downloadPDF = () => {
    if (compilationResult?.pdfBlob) {
      const url = URL.createObjectURL(compilationResult.pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }


  const zoomIn = () => {
    const newScale = Math.min(scale + 0.25, 5.0)
    setScale(newScale)
    setCustomScale(Math.round(newScale * 100).toString())
  }

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.1)
    setScale(newScale)
    setCustomScale(Math.round(newScale * 100).toString())
  }

  const resetZoom = () => {
    setScale(1.0)
    setCustomScale('100')
  }

  const handleCustomScaleChange = (value: string) => {
    setCustomScale(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 500) {
      setScale(numValue / 100)
    }
  }

  const handleCustomScaleSubmit = () => {
    const numValue = parseFloat(customScale)
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 500) {
      setScale(numValue / 100)
    } else {
      setCustomScale(Math.round(scale * 100).toString())
    }
  }


  const renderPDFContent = () => {
    console.log('renderPDFContent called:', { 
      hasBlob: !!compilationResult?.pdfBlob, 
      totalPages
    })
    
    if (compilationResult?.pdfBlob && totalPages > 0) {
      return (
        <div className="h-full flex flex-col">
          {/* PDF工具栏 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {totalPages} page{totalPages > 1 ? 's' : ''} - Continuous View
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* 缩放控制 */}
              <button
                onClick={zoomOut}
                className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                title="Zoom Out"
              >
                -
              </button>
              <input
                type="number"
                min="10"
                max="500"
                value={customScale}
                onChange={(e) => handleCustomScaleChange(e.target.value)}
                onBlur={handleCustomScaleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomScaleSubmit()
                  }
                }}
                className="w-16 px-1 py-1 text-sm border border-gray-300 rounded text-center"
                title="Custom zoom percentage"
              />
              <span className="text-sm text-gray-600">%</span>
              <button
                onClick={zoomIn}
                className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                title="Reset Zoom"
              >
                Reset
              </button>
              <button
                onClick={downloadPDF}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                title="Download PDF"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
              </button>
              
              {/* 调试按钮 */}
              <button
                onClick={() => {
                  const container = canvasRef.current?.parentElement?.parentElement?.parentElement
                  if (container) {
                    console.log('手动检查滚动:', {
                      scrollHeight: container.scrollHeight,
                      clientHeight: container.clientHeight,
                      canScroll: container.scrollHeight > container.clientHeight
                    })
                    // 尝试滚动
                    container.scrollTop = 100
                    setTimeout(() => {
                      console.log('滚动后位置:', container.scrollTop)
                    }, 100)
                  }
                }}
                className="px-2 py-1 text-xs bg-yellow-200 rounded hover:bg-yellow-300"
                title="调试滚动"
              >
                调试
              </button>
            </div>
          </div>
          
          {/* PDF画布 */}
          <div 
            className="flex-1 overflow-auto bg-gray-100 p-4"
            style={{ height: '100%' }}
          >
            <div 
              className="flex justify-center"
              style={{ 
                minHeight: '100%',
                padding: '20px 0'
              }}
            >
              <canvas
                ref={canvasRef}
                className="border border-gray-300 shadow-lg bg-white"
                style={{
                  display: 'block',
                  margin: '0 auto',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.1s ease'
                }}
              />
            </div>
          </div>
        </div>
      )
    }
    
    // 如果编译成功但没有PDF内容，显示提示
    if (compilationResult?.pdfBlob && totalPages === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <DocumentIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">PDF generated but no content to display</p>
            <p className="text-xs text-gray-400 mt-1">Check console for debugging info</p>
          </div>
        </div>
      )
    }
    
    return null
  }

  const renderCompilationStatus = () => {
    if (isCompiling) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Compiling LaTeX...</p>
          </div>
        </div>
      )
    }

    if (!compilationResult) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <DocumentIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Click "Compile" button to generate PDF preview</p>
          </div>
        </div>
      )
    }

    if (compilationResult.success) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-border bg-green-50 px-4 py-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-800">Compilation Successful</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={downloadPDF}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="Download PDF"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowLog(!showLog)}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="View Log"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {showLog ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Compilation Log</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {compilationResult.log}
                </pre>
              </div>
            ) : (
              renderPDFContent()
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-border bg-red-50 px-4 py-2">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-800">Compilation Failed</span>
            </div>
            <button
              onClick={() => setShowLog(!showLog)}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="View Error Log"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {showLog ? (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">编译日志</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {compilationResult.log}
                </pre>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">错误信息</h3>
                <ul className="space-y-1">
                  {compilationResult.errors?.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
                
                {compilationResult.warnings && compilationResult.warnings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">警告信息</h3>
                    <ul className="space-y-1">
                      {compilationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="h-full bg-white">
      {renderCompilationStatus()}
    </div>
  )
}
