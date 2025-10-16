"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import VibeCodingLayout from "./vibecoding/VibeCodingLayout"

export default function VibeCodingApp() {
  const [userId] = useState(() => {
    if (typeof window === "undefined") return null
    let id = localStorage.getItem("eburon-user-id")
    if (!id) {
      id = `user-${Math.random().toString(36).slice(2)}`
      localStorage.setItem("eburon-user-id", id)
    }
    return id
  })

  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme")
    if (saved) return saved
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark"
    return "light"
  })

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.style.colorScheme = theme
      localStorage.setItem("theme", theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    try {
      const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      if (!media) return
      const listener = (e) => {
        const saved = localStorage.getItem("theme")
        if (!saved) setTheme(e.matches ? "dark" : "light")
      }
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } catch {}
  }, [])

  const [selectedModel, setSelectedModel] = useState("qwen3-coder:480b-cloud")

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingConvId, setThinkingConvId] = useState(null)

  useEffect(() => {
    if (!userId) return
    loadConversations()
  }, [userId])

  async function loadConversations() {
    if (!userId) return
    setIsLoadingConversations(true)
    try {
      const response = await fetch(`/api/conversations?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversations && data.conversations.length > 0) {
          const formattedConvs = data.conversations.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updated_at,
            messageCount: 0,
            preview: "Loading messages...",
            pinned: false,
            folder: "Coding Sessions",
            messages: [],
            model: c.model,
          }))
          setConversations(formattedConvs)
        }
      }
    } catch (error) {
      console.error("[VibeCoding] Error loading conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  useEffect(() => {
    if (!selectedId) return
    loadMessages(selectedId)
  }, [selectedId])

  async function loadMessages(convId) {
    try {
      const response = await fetch(`/api/messages?conversationId=${convId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages) {
          const formattedMsgs = data.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.created_at,
            }))

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== convId) return c
              return {
                ...c,
                messages: formattedMsgs,
                messageCount: formattedMsgs.length,
                preview: formattedMsgs[formattedMsgs.length - 1]?.content?.slice(0, 80) || "Start coding...",
              }
            }),
          )
        }
      }
    } catch (error) {
      console.error("[VibeCoding] Error loading messages:", error)
    }
  }

  async function createNewChat() {
    if (!userId) return

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: "New Coding Session",
          model: selectedModel,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const conv = data.conversation
        const item = {
          id: conv.id,
          title: conv.title,
          updatedAt: conv.updated_at,
          messageCount: 0,
          preview: "Ready to start coding...",
          pinned: false,
          folder: "Coding Sessions",
          messages: [],
          model: conv.model,
        }
        setConversations((prev) => [item, ...prev])
        setSelectedId(conv.id)
        return conv.id
      }
    } catch (error) {
      console.error("[VibeCoding] Error creating conversation:", error)
    }
  }

  async function sendMessage(convId, content, options = {}) {
    if (!content.trim()) return

    const now = new Date().toISOString()
    const userMsg = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = [...(c.messages || []), userMsg]
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        }
      }),
    )

    setIsThinking(true)
    setThinkingConvId(convId)

    try {
      const conv = conversations.find((c) => c.id === convId)
      const messages = [...(conv?.messages || []), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const actualModel = typeof selectedModel === "string" ? selectedModel : selectedModel.model
      const isThinkingMode = typeof selectedModel === "object" && selectedModel.thinking === true
      const isCodingAgent = actualModel === "qwen3-coder:480b-cloud"

      console.log("[VibeCoding] Sending message...")
      console.log("[VibeCoding] Model:", actualModel)
      console.log("[VibeCoding] Coding mode:", isCodingAgent)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          model: actualModel,
          conversationId: convId,
          userId,
          enableTools: isCodingAgent,
          enableThinking: isThinkingMode,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[VibeCoding] API error response:", errorText)
        throw new Error(`API error: ${response.statusText}`)
      }

      if (!response.body) {
        console.error("[VibeCoding] No response body received")
        throw new Error("No response body")
      }

      const assistantMsgId = Math.random().toString(36).slice(2)
      let assistantContent = ""
      let assistantThinking = ""
      let toolExecutions = []
      let currentCode = ""
      let currentLanguage = "javascript"

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const asstMsg = {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            thinking: "",
            createdAt: new Date().toISOString(),
            toolExecutions: [],
          }
          const msgs = [...(c.messages || []), asstMsg]
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
          }
        }),
      )

      setIsThinking(false)
      setThinkingConvId(null)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log("[VibeCoding] Stream complete")
          // Notify completion
          if (options.onComplete) {
            options.onComplete(currentCode, currentLanguage)
          }
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              break
            }

            try {
              const json = JSON.parse(data)

              if (json.message?.thinking) {
                assistantThinking += json.message.thinking
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c
                    const msgs = (c.messages || []).map((m) =>
                      m.id === assistantMsgId ? { ...m, thinking: assistantThinking } : m,
                    )
                    return { ...c, messages: msgs }
                  }),
                )
              }

              if (json.type === "tool_call") {
                toolExecutions.push({
                  name: json.tool,
                  status: "executing",
                  args: json.args,
                })

                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c
                    const msgs = (c.messages || []).map((m) =>
                      m.id === assistantMsgId ? { ...m, toolExecutions: [...toolExecutions] } : m,
                    )
                    return { ...c, messages: msgs }
                  }),
                )
              }

              if (json.type === "tool_result") {
                toolExecutions = toolExecutions.map((t) =>
                  t.name === json.tool ? { ...t, status: "completed", result: json.result } : t,
                )

                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c
                    const msgs = (c.messages || []).map((m) =>
                      m.id === assistantMsgId ? { ...m, toolExecutions: [...toolExecutions] } : m,
                    )
                    return { ...c, messages: msgs }
                  }),
                )
              }

              if (json.message?.content) {
                assistantContent += json.message.content
                
                // Extract code blocks for streaming
                const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
                const matches = [...assistantContent.matchAll(codeBlockRegex)]
                
                if (matches.length > 0) {
                  const lastMatch = matches[matches.length - 1]
                  currentLanguage = lastMatch[1] || "javascript"
                  currentCode = lastMatch[2]
                  
                  // Stream code updates
                  if (options.onCodeStream) {
                    options.onCodeStream(currentCode, currentLanguage)
                  }
                }

                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c
                    const msgs = (c.messages || []).map((m) =>
                      m.id === assistantMsgId ? { ...m, content: assistantContent } : m,
                    )
                    return {
                      ...c,
                      messages: msgs,
                      preview: assistantContent.slice(0, 80),
                    }
                  }),
                )
              }
            } catch (e) {
              console.error("[VibeCoding] Error parsing stream line:", e, "Line:", line)
            }
          }
        }
      }

      // Generate title for new conversations
      const currentConv = conversations.find((c) => c.id === convId)
      if (currentConv && currentConv.title === "New Coding Session" && assistantContent) {
        generateAndUpdateTitle(convId, [
          { role: "user", content },
          { role: "assistant", content: assistantContent },
        ])
      }
    } catch (error) {
      console.error("[VibeCoding] Error sending message:", error)
      setIsThinking(false)
      setThinkingConvId(null)

      if (options.onError) {
        options.onError(error)
      }

      const errorMsg = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: "I encountered an error. Please check the server connection and try again.",
        createdAt: new Date().toISOString(),
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const msgs = [...(c.messages || []), errorMsg]
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: errorMsg.content.slice(0, 80),
          }
        }),
      )
    }
  }

  async function generateAndUpdateTitle(convId, messages) {
    try {
      const response = await fetch("/api/conversations/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          model: "gpt-oss:20b-cloud",
        }),
      })

      if (!response.ok) {
        console.error("[VibeCoding] Failed to generate title")
        return
      }

      const data = await response.json()
      const newTitle = data.title

      const updateResponse = await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          title: newTitle,
        }),
      })

      if (updateResponse.ok) {
        setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title: newTitle } : c)))
      }
    } catch (error) {
      console.error("[VibeCoding] Error generating/updating title:", error)
    }
  }

  return (
    <VibeCodingLayout
      userId={userId}
      conversations={conversations}
      selectedId={selectedId}
      onConversationSelect={setSelectedId}
      onCreateNewChat={createNewChat}
      onSendMessage={sendMessage}
      isThinking={isThinking && thinkingConvId === selectedId}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      theme={theme}
      setTheme={setTheme}
    />
  )
}