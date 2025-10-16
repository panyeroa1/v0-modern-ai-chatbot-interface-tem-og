"use client"

import React, { useEffect, useRef, useState } from "react"
import { Copy, Download, Play, RefreshCw, FileCode } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import Message from "../Message"

export default function CodeStreamPanel({ 
  code, 
  language, 
  isStreaming, 
  conversation,
  onSendMessage 
}) {
  const [theme, setTheme] = useState("light")
  const [copied, setCopied] = useState(false)
  const codeRef = useRef(null)
  const streamRef = useRef(null)

  // Detect theme from document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && streamRef.current) {
      streamRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [code, isStreaming])

  const handleCopy = async () => {
    if (!code) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const handleDownload = () => {
    if (!code) return
    
    const extension = getFileExtension(language)
    const filename = `code.${extension}`
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: "js",
      typescript: "ts",
      jsx: "jsx",
      tsx: "tsx",
      python: "py",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      yaml: "yml",
      markdown: "md"
    }
    return extensions[lang] || "txt"
  }

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case "javascript":
      case "jsx":
        return "📝"
      case "typescript":
      case "tsx":
        return "🔷"
      case "python":
        return "🐍"
      case "html":
        return "🌐"
      case "css":
      case "scss":
        return "🎨"
      case "json":
        return "📄"
      default:
        return "💻"
    }
  }

  const messages = conversation?.messages || []

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Code Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-zinc-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Code Stream</span>
          {language && (
            <span className="flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {getLanguageIcon(language)}
              {language}
            </span>
          )}
          {isStreaming && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!code}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Messages and Code Content */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !code && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <FileCode className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ready to Code
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Ask me to build something and watch the code stream in real-time. 
                I'll create complete, working code that you can copy, download, or preview.
              </p>
            </div>
          </div>
        )}

        {/* Conversation Messages */}
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <Message key={message.id} role={message.role}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.content}
              </div>
            </Message>
          ))}
        </div>

        {/* Current Streaming Code */}
        {code && (
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="p-4">
              <div className="rounded-lg border border-zinc-200 overflow-hidden dark:border-zinc-800">
                <div className="flex items-center justify-between bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Generated Code
                  </span>
                  {isStreaming && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      Streaming...
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <SyntaxHighlighter
                    language={language || "javascript"}
                    style={theme === "dark" ? oneDark : oneLight}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      background: theme === "dark" ? "#0a0a0a" : "#ffffff"
                    }}
                    codeTagProps={{
                      style: {
                        fontSize: "14px",
                        lineHeight: "1.5"
                      }
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                  
                  {/* Streaming cursor effect */}
                  {isStreaming && (
                    <div 
                      ref={streamRef}
                      className="absolute bottom-2 right-2 h-4 w-0.5 animate-pulse bg-emerald-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}