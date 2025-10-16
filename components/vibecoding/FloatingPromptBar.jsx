"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Loader2, Sparkles, Zap } from "lucide-react"

export default function FloatingPromptBar({
  onSendMessage,
  isStreaming,
  selectedModel,
  onModelChange
}) {
  const [prompt, setPrompt] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const textareaRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setPrompt(prev => prev + finalTranscript)
        }
      }
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || isStreaming) return
    
    const currentPrompt = prompt.trim()
    setPrompt("")
    
    // Auto-resize textarea back to single line
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    
    await onSendMessage(currentPrompt)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceToggle = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser")
      return
    }
    
    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [prompt])

  const getModelIcon = () => {
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel?.model || ""
    
    if (modelName.includes("coder")) return "💻"
    if (modelName.includes("deepseek")) return "🎯" 
    if (modelName.includes("20b")) return "⚡"
    return "🚀"
  }

  const getModelLabel = () => {
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel?.model || ""
    const isThinking = typeof selectedModel === "object" && selectedModel.thinking
    
    if (modelName.includes("coder")) return `Alex-Coder${isThinking ? " (Thinking)" : ""}`
    if (modelName.includes("deepseek")) return "Aquilles-V3.1"
    if (modelName.includes("20b")) return "Emilio-flash"
    return `Emilio${isThinking ? "-Thinking" : ""}`
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4">
      <div className="mx-auto rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Model Indicator */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span>{getModelIcon()}</span>
            <span>{getModelLabel()}</span>
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3">
            {/* Voice Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isStreaming}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                isListening
                  ? "bg-red-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              } disabled:opacity-50`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to build..."
                disabled={isStreaming}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                rows={1}
                style={{ minHeight: "48px" }}
              />
              
              {/* Floating hint */}
              {!prompt && !isStreaming && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">
                  <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">↵</kbd> to send
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isStreaming}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <QuickPromptButton
              icon="🌐"
              text="Build a web app"
              onClick={() => setPrompt("Build a modern web application with React, featuring responsive design and clean UI components")}
            />
            <QuickPromptButton
              icon="🎨"
              text="Create UI design"
              onClick={() => setPrompt("Create a beautiful, modern UI design with Tailwind CSS that's responsive and accessible")}
            />
            <QuickPromptButton
              icon="🔧"
              text="Debug code"
              onClick={() => setPrompt("Help me debug and optimize this code, identifying issues and suggesting improvements")}
            />
            <QuickPromptButton
              icon="📱"
              text="Mobile app"
              onClick={() => setPrompt("Create a mobile-responsive application with touch-friendly interface and modern design patterns")}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

function QuickPromptButton({ icon, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      <span className="text-xs">{icon}</span>
      <span>{text}</span>
    </button>
  )
}