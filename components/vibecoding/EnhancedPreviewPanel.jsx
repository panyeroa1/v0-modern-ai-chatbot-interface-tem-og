"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { RefreshCw, ExternalLink, AlertTriangle, Loader2, Eye, Maximize2, Minimize2, Smartphone, Tablet, Monitor, Download, Share2 } from "lucide-react"

export default function EnhancedPreviewPanel({ 
  content, 
  deviceMode, 
  error, 
  isLoading,
  onDeviceChange,
  language = "html" 
}) {
  const iframeRef = useRef(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Enhanced hot reloading with debouncing
  const updatePreview = useCallback(
    debounce((newContent, lang) => {
      if (!newContent && !error) return
      
      try {
        const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document
        if (!iframeDoc) return

        const enhancedHtml = generateEnhancedHtml(newContent, lang, deviceMode)
        
        iframeDoc.open()
        iframeDoc.write(enhancedHtml)
        iframeDoc.close()
        
        setLastUpdate(Date.now())
        setPreviewUrl(null) // Clear any external URL
      } catch (err) {
        console.error("Error updating preview:", err)
      }
    }, 300),
    [deviceMode, error]
  )

  // Update preview when content changes
  useEffect(() => {
    updatePreview(content, language)
  }, [content, language, updatePreview])

  const generateEnhancedHtml = (code, lang, device) => {
    const deviceStyles = getDeviceSpecificStyles(device)
    
    // Enhanced HTML template with better error handling and features
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EBURON Live Preview</title>
    <style>
        ${deviceStyles}
        
        /* Enhanced base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            min-height: 100vh;
        }
        
        /* Error display styles */
        .preview-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            margin: 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }
        
        /* Loading indicator */
        .preview-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            color: #6b7280;
        }
        
        /* Enhanced demo styles for better previews */
        .demo-content {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .demo-content h1, .demo-content h2, .demo-content h3 {
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .demo-content p {
            margin-bottom: 16px;
            color: #374151;
        }
        
        .demo-content button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        
        .demo-content button:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        
        .demo-content input, .demo-content textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
            transition: border-color 0.2s;
        }
        
        .demo-content input:focus, .demo-content textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        /* Grid and layout utilities */
        .grid { display: grid; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-4 { gap: 16px; }
        .p-4 { padding: 16px; }
        .rounded { border-radius: 8px; }
        .shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    </style>
    
    <!-- Enhanced JavaScript libraries -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${generatePreviewContent(code, lang)}
    
    <script>
        // Enhanced error handling
        window.addEventListener('error', (e) => {
            console.error('Preview Error:', e.error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'preview-error';
            errorDiv.innerHTML = \`<strong>JavaScript Error:</strong><br>\${e.error.message}<br><small>Line: \${e.lineno}, Column: \${e.colno}</small>\`;
            document.body.insertBefore(errorDiv, document.body.firstChild);
        });
        
        // Enhanced React error boundary
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            class ErrorBoundary extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { hasError: false, error: null };
                }
                
                static getDerivedStateFromError(error) {
                    return { hasError: true, error };
                }
                
                componentDidCatch(error, errorInfo) {
                    console.error('React Error:', error, errorInfo);
                }
                
                render() {
                    if (this.state.hasError) {
                        return React.createElement('div', {
                            className: 'preview-error'
                        }, [
                            React.createElement('strong', null, 'React Error:'),
                            React.createElement('br'),
                            this.state.error?.message || 'Unknown error occurred',
                            React.createElement('br'),
                            React.createElement('small', null, 'Check the console for more details')
                        ]);
                    }
                    return this.props.children;
                }
            }
            
            window.ErrorBoundary = ErrorBoundary;
        }
        
        // Auto-resize for mobile
        if (window.innerWidth < 768) {
            document.body.style.fontSize = '14px';
        }
        
        // Enhanced console logging
        console.log('EBURON Live Preview loaded at:', new Date().toISOString());
    </script>
</body>
</html>`
  }

  const generatePreviewContent = (code, lang) => {
    if (!code) {
      return `<div class="preview-loading">
        <p>Waiting for code generation...</p>
      </div>`
    }

    switch (lang) {
      case "html":
        return code
        
      case "javascript":
      case "jsx":
        return `<div id="react-root"></div>
        <script type="text/babel">
          try {
            ${code}
          } catch (error) {
            console.error('JSX Error:', error);
          }
        </script>`
        
      case "css":
        return `<style>${code}</style>
        <div class="demo-content">
          <h1>CSS Styles Applied</h1>
          <p>Your custom styles are now active. This demo content shows how they look.</p>
          <button>Sample Button</button>
          <input type="text" placeholder="Sample Input" />
          <div class="sample-card" style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0;">
            <h3>Sample Card</h3>
            <p>This is a sample card to showcase your styles.</p>
          </div>
        </div>`
        
      case "json":
        try {
          const parsed = JSON.parse(code)
          return `<div class="demo-content">
            <h2>JSON Data Preview</h2>
            <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; overflow: auto; font-size: 14px;">${JSON.stringify(parsed, null, 2)}</pre>
          </div>`
        } catch (e) {
          return `<div class="preview-error">
            <strong>Invalid JSON:</strong><br>${e.message}
          </div>`
        }
        
      default:
        return `<div class="demo-content">
          <h2>${lang.toUpperCase()} Code Preview</h2>
          <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; overflow: auto; font-size: 14px;"><code>${escapeHtml(code)}</code></pre>
        </div>`
    }
  }

  const getDeviceSpecificStyles = (device) => {
    switch (device) {
      case "mobile":
        return `
          @media (max-width: 767px) {
            body { font-size: 16px; }
            .demo-content { padding: 16px; }
            button { width: 100%; margin-bottom: 12px; }
          }
        `
      case "tablet":
        return `
          @media (min-width: 768px) and (max-width: 1023px) {
            .demo-content { padding: 20px; }
            .grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
          }
        `
      case "web":
      default:
        return `
          .demo-content { padding: 24px; }
          .grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        `
    }
  }

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setPreviewKey(prev => prev + 1)
    updatePreview(content, language)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleOpenInNewTab = () => {
    if (!content) return
    
    const newWindow = window.open()
    if (newWindow) {
      const html = generateEnhancedHtml(content, language, "web")
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleDownloadHtml = () => {
    if (!content) return
    
    const html = generateEnhancedHtml(content, language, "web")
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eburon-preview-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getDeviceStyles = () => {
    if (isFullscreen) {
      return {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999
      }
    }

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
        return "iPhone (375×667)"
      case "tablet":
        return "iPad (768×1024)"
      case "web":
      default:
        return "Desktop"
    }
  }

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-zinc-950 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Preview Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-zinc-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Live Preview</span>
          
          {/* Device Mode Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
            {[
              { mode: "web", icon: Monitor, label: "Desktop" },
              { mode: "tablet", icon: Tablet, label: "Tablet" },
              { mode: "mobile", icon: Smartphone, label: "Mobile" }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onDeviceChange?.(mode)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  deviceMode === mode
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
                title={label}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Updated {new Date(lastUpdate).toLocaleTimeString()}
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
            title="Refresh preview"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handleDownloadHtml}
            disabled={!content}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Download HTML"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            disabled={!content}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Enhanced Preview Content */}
      <div className="flex-1 overflow-auto bg-zinc-100 p-4 dark:bg-zinc-800">
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Preview Error</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-xs text-red-600 hover:text-red-800 mt-2 underline dark:text-red-400"
              >
                Try refreshing the preview
              </button>
            </div>
          </div>
        )}

        {!content && !error && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Eye className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600 mb-6" />
              <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Preview Ready
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Your code will appear here as it's generated. Watch your creations come to life in real-time
                with enhanced error handling and device previews.
              </p>
            </div>
          </div>
        )}

        {isLoading && !content && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500 mb-6" />
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Generating Preview
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Processing your code for the best preview experience...
              </p>
            </div>
          </div>
        )}

        {content && !error && (
          <div className="h-full">
            <div 
              className="bg-white rounded-lg shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
              style={getDeviceStyles()}
            >
              {/* Device frame decoration */}
              {deviceMode !== "web" && !isFullscreen && (
                <div className="bg-zinc-900 p-3 flex items-center gap-3 border-b border-zinc-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-zinc-300 font-medium">
                      {getDeviceLabel()}
                    </span>
                  </div>
                  <div className="w-16"></div>
                </div>
              )}
              
              <iframe
                key={previewKey}
                ref={iframeRef}
                title="Enhanced Code Preview"
                className="w-full h-full border-0"
                style={{ 
                  minHeight: deviceMode === "web" || isFullscreen ? "600px" : "auto"
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}