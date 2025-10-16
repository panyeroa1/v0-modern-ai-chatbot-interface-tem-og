"use client"

import React, { useRef, useEffect, useState } from "react"
import { RefreshCw, ExternalLink, AlertTriangle, Loader2, Eye, Maximize2 } from "lucide-react"

export default function LivePreviewPanel({ 
  content, 
  deviceMode, 
  error, 
  isLoading 
}) {
  const iframeRef = useRef(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  // Update iframe content when content changes
  useEffect(() => {
    if (content && iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
        
        // Enhanced HTML template with responsive meta tags
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #ffffff;
        }
        .demo-content {
            padding: 20px;
        }
        .demo-content p {
            margin-bottom: 16px;
        }
        .demo-content button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        .demo-content button:hover {
            background: #0056b3;
        }
    </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    ${content}
    <script>
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Preview Error:', e.error);
        });
        
        // React error boundary for JSX previews
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            class ErrorBoundary extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { hasError: false };
                }
                
                static getDerivedStateFromError(error) {
                    return { hasError: true };
                }
                
                componentDidCatch(error, errorInfo) {
                    console.error('React Preview Error:', error, errorInfo);
                }
                
                render() {
                    if (this.state.hasError) {
                        return React.createElement('div', {
                            style: { padding: '20px', color: '#dc3545', background: '#f8d7da', borderRadius: '8px', margin: '20px' }
                        }, 'Something went wrong in the React preview.');
                    }
                    return this.props.children;
                }
            }
            
            window.ErrorBoundary = ErrorBoundary;
        }
    </script>
</body>
</html>
        `
        
        iframeDoc.open()
        iframeDoc.write(fullHtml)
        iframeDoc.close()
      } catch (err) {
        console.error("Error updating iframe:", err)
      }
    }
  }, [content])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setPreviewKey(prev => prev + 1)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleOpenInNewTab = () => {
    if (!content) return
    
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(content)
      newWindow.document.close()
    }
  }

  const getDeviceStyles = () => {
    switch (deviceMode) {
      case "mobile":
        return {
          width: "375px",
          height: "667px",
          maxWidth: "100%",
          margin: "0 auto"
        }
      case "tablet":
        return {
          width: "768px",
          height: "1024px",
          maxWidth: "100%",
          margin: "0 auto"
        }
      case "web":
      default:
        return {
          width: "100%",
          height: "100%"
        }
    }
  }

  const getDeviceLabel = () => {
    switch (deviceMode) {
      case "mobile":
        return "iPhone 12 (375×667)"
      case "tablet":
        return "iPad (768×1024)"
      case "web":
      default:
        return "Desktop"
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-zinc-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Live Preview</span>
          <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {getDeviceLabel()}
          </span>
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Updating...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !content}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenInNewTab}
            disabled={!content}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-zinc-100 p-4 dark:bg-zinc-800">
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Preview Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!content && !error && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Preview Ready
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Code will appear here as it's generated. Perfect for seeing your creations come to life in real-time.
              </p>
            </div>
          </div>
        )}

        {isLoading && !content && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500 mb-4" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Generating preview...
              </p>
            </div>
          </div>
        )}

        {content && !error && (
          <div className="h-full">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={getDeviceStyles()}
            >
              {/* Device frame decoration for mobile/tablet */}
              {deviceMode !== "web" && (
                <div className="bg-zinc-800 p-2 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-xs text-zinc-400">
                      {getDeviceLabel()}
                    </div>
                  </div>
                </div>
              )}
              
              <iframe
                key={previewKey}
                ref={iframeRef}
                title="Code Preview"
                className="w-full h-full border-0"
                style={{ 
                  minHeight: deviceMode === "web" ? "600px" : "auto"
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}