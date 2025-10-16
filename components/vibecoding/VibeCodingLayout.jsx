"use client"

import React, { useState, useEffect } from "react"
import { Code, Eye, Columns, Smartphone, Tablet, Monitor } from "lucide-react"
import CodeStreamPanel from "./CodeStreamPanel"
import LivePreviewPanel from "./LivePreviewPanel"
import ConversationPanel from "./ConversationPanel"
import FloatingPromptBar from "./FloatingPromptBar"

export default function VibeCodingLayout({
  userId,
  conversations,
  selectedId,
  onConversationSelect,
  onCreateNewChat,
  onSendMessage,
  isThinking,
  selectedModel,
  onModelChange,
  theme,
  setTheme
}) {
  // Layout state
  const [viewMode, setViewMode] = useState("split") // 'code', 'preview', 'split'
  const [deviceMode, setDeviceMode] = useState("web") // 'web', 'tablet', 'mobile'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Code streaming state
  const [streamingCode, setStreamingCode] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("javascript")
  
  // Preview state
  const [previewContent, setPreviewContent] = useState("")
  const [previewError, setPreviewError] = useState(null)

  const selectedConversation = conversations.find(c => c.id === selectedId)

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile: force single panel view
        if (viewMode === "split") {
          setViewMode("code")
        }
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [viewMode])

  // Handle message sending with enhanced streaming
  const handleSendMessage = async (prompt) => {
    if (!selectedId) {
      await onCreateNewChat()
      // Wait a bit for the new conversation to be created
      setTimeout(() => {
        const newConv = conversations[0]
        if (newConv) {
          handleStreamingMessage(newConv.id, prompt)
        }
      }, 100)
    } else {
      handleStreamingMessage(selectedId, prompt)
    }
  }

  const handleStreamingMessage = async (convId, prompt) => {
    setIsStreaming(true)
    setStreamingCode("")
    setPreviewError(null)

    try {
      // Enhanced message sending with real-time code streaming
      await onSendMessage(convId, prompt, {
        onCodeStream: (code, language) => {
          setStreamingCode(code)
          setCurrentLanguage(language || "javascript")
          
          // Update preview in real-time for certain languages
          if (language === "html" || language === "javascript" || language === "css") {
            updatePreview(code, language)
          }
        },
        onComplete: (finalCode, language) => {
          setStreamingCode(finalCode)
          setIsStreaming(false)
          updatePreview(finalCode, language)
        },
        onError: (error) => {
          setIsStreaming(false)
          setPreviewError(error.message)
        }
      })
    } catch (error) {
      setIsStreaming(false)
      setPreviewError(error.message)
    }
  }

  const updatePreview = (code, language) => {
    try {
      // Simple preview generation based on language
      if (language === "html") {
        setPreviewContent(code)
      } else if (language === "javascript" || language === "jsx") {
        // For React/JS, we'd need a more sophisticated preview system
        setPreviewContent(`
          <div style="padding: 20px; font-family: system-ui;">
            <h3>JavaScript Code Preview</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto;">
              <code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
            </pre>
          </div>
        `)
      } else if (language === "css") {
        setPreviewContent(`
          <style>${code}</style>
          <div style="padding: 20px;">
            <h3>CSS Preview Applied</h3>
            <div class="demo-content">
              <p>This is a demo paragraph with your CSS applied.</p>
              <button>Demo Button</button>
            </div>
          </div>
        `)
      } else {
        setPreviewContent(`
          <div style="padding: 20px; font-family: system-ui;">
            <h3>${language.toUpperCase()} Code</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto;">
              <code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
            </pre>
          </div>
        `)
      }
      setPreviewError(null)
    } catch (error) {
      setPreviewError("Preview generation failed: " + error.message)
    }
  }

  // View mode controls
  const ViewModeToggle = () => (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        onClick={() => setViewMode("code")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "code"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Code className="h-4 w-4" />
        <span className="hidden sm:inline">Code</span>
      </button>
      <button
        onClick={() => setViewMode("preview")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "preview"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Preview</span>
      </button>
      <button
        onClick={() => setViewMode("split")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "split"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Columns className="h-4 w-4" />
        <span className="hidden sm:inline">Split</span>
      </button>
    </div>
  )

  // Device mode controls
  const DeviceModeToggle = () => (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        onClick={() => setDeviceMode("web")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          deviceMode === "web"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeviceMode("tablet")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          deviceMode === "tablet"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Tablet className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeviceMode("mobile")}
        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          deviceMode === "mobile"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <Smartphone className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-sm px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Left: Brand + Conversation Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-light.png" alt="EBURON" className="h-8 w-auto dark:hidden" />
            <img src="/logo-dark.png" alt="EBURON" className="hidden h-8 w-auto dark:block" />
            <span className="text-lg font-semibold">Coder</span>
          </div>
          {selectedConversation && (
            <div className="hidden md:block text-sm text-zinc-600 dark:text-zinc-400">
              {selectedConversation.title}
            </div>
          )}
        </div>

        {/* Center: View Mode Toggle */}
        <ViewModeToggle />

        {/* Right: Device Mode + Controls */}
        <div className="flex items-center gap-3">
          {(viewMode === "preview" || viewMode === "split") && <DeviceModeToggle />}
          
          {/* Model Selector */}
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {typeof selectedModel === "string" 
              ? selectedModel.split(":")[0] 
              : selectedModel?.model?.split(":")[0] || "Model"}
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Conversation Sidebar (Mobile: Overlay, Desktop: Fixed) */}
        <ConversationPanel
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onConversationSelect}
          onCreateNew={onCreateNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Panel */}
          {(viewMode === "code" || viewMode === "split") && (
            <div className={`${
              viewMode === "split" ? "w-1/2 border-r border-zinc-200 dark:border-zinc-800" : "w-full"
            } overflow-hidden`}>
              <CodeStreamPanel
                code={streamingCode}
                language={currentLanguage}
                isStreaming={isStreaming}
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} overflow-hidden`}>
              <LivePreviewPanel
                content={previewContent}
                deviceMode={deviceMode}
                error={previewError}
                isLoading={isStreaming}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Prompt Bar */}
      <FloatingPromptBar
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  )
}