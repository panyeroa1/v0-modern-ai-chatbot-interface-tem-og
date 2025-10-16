"use client"

import React, { useState } from "react"
import { X, Plus, Search, MessageCircle, Folder, Moon, Sun } from "lucide-react"

export default function ConversationPanel({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  isOpen,
  onClose,
  theme,
  setTheme
}) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentConversations = filteredConversations
    .filter(conv => !conv.pinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20)

  const pinnedConversations = filteredConversations.filter(conv => conv.pinned)

  const handleConversationClick = (conv) => {
    onSelect(conv.id)
    // Close on mobile after selection
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900 md:relative md:translate-x-0 md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Sessions
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* New Session Button */}
          <div className="p-4">
            <button
              onClick={onCreateNew}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-zinc-300 p-3 text-left text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Start New Coding Session
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Pinned
                </h3>
                <div className="space-y-1">
                  {pinnedConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={conv.id === selectedId}
                      onClick={() => handleConversationClick(conv)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Conversations */}
            {recentConversations.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Recent
                </h3>
                <div className="space-y-1">
                  {recentConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={conv.id === selectedId}
                      onClick={() => handleConversationClick(conv)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <MessageCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {searchQuery ? "No sessions match your search" : "No coding sessions yet"}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                  {searchQuery ? "Try a different search term" : "Create your first session to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ConversationItem({ conversation, isSelected, onClick, formatTime }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-lg p-3 text-left transition-colors
        ${isSelected 
          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' 
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm leading-tight line-clamp-1">
            {conversation.title}
          </h4>
          <p className="text-xs opacity-70 mt-1 line-clamp-2">
            {conversation.preview}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs opacity-60">
            {formatTime(conversation.updatedAt)}
          </span>
          {conversation.messageCount > 0 && (
            <span className="text-xs opacity-60">
              {conversation.messageCount} msgs
            </span>
          )}
        </div>
      </div>
    </button>
  )
}