"use client"

import React, { useState, useRef } from "react"
import { Download, Copy, Share2, FileCode, Folder, Plus, Trash2, Edit3 } from "lucide-react"

export default function CodeManager({ 
  projects = [], 
  currentProject, 
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  onFileCreate,
  onFileDelete,
  onFileSelect,
  currentFile 
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [isAddingFile, setIsAddingFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    
    const project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      created: new Date().toISOString(),
      files: []
    }
    
    onProjectCreate?.(project)
    setNewProjectName("")
    setIsCreating(false)
  }

  const handleAddFile = (projectId) => {
    if (!newFileName.trim()) return
    
    const file = {
      id: Date.now().toString(),
      name: newFileName.trim(),
      content: "",
      language: getLanguageFromExtension(newFileName),
      created: new Date().toISOString()
    }
    
    onFileCreate?.(projectId, file)
    setNewFileName("")
    setIsAddingFile(null)
  }

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'jsx', 
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    }
    return languageMap[ext] || 'text'
  }

  const handleExportProject = (project) => {
    const projectData = {
      name: project.name,
      created: project.created,
      files: project.files
    }
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleShareProject = async (project) => {
    const shareData = {
      name: project.name,
      files: project.files.map(f => ({
        name: f.name,
        content: f.content,
        language: f.language
      }))
    }
    
    try {
      const shareText = `# ${project.name}\\n\\n${project.files.map(f => 
        `## ${f.name}\\n\\n\`\`\`${f.language}\\n${f.content}\\n\`\`\``
      ).join('\\n\\n')}`
      
      if (navigator.share) {
        await navigator.share({
          title: `EBURON Coder Project: ${project.name}`,
          text: shareText
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        alert('Project copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Projects</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-md dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {/* Create Project */}
      {isCreating && (
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateProject}
              className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewProjectName("")
              }}
              className="px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 rounded-md dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isSelected={currentProject?.id === project.id}
                onSelect={() => onProjectSelect?.(project)}
                onDelete={() => onProjectDelete?.(project.id)}
                onExport={() => handleExportProject(project)}
                onShare={() => handleShareProject(project)}
                onAddFile={() => setIsAddingFile(project.id)}
                isAddingFile={isAddingFile === project.id}
                newFileName={newFileName}
                setNewFileName={setNewFileName}
                onConfirmAddFile={() => handleAddFile(project.id)}
                onCancelAddFile={() => {
                  setIsAddingFile(null)
                  setNewFileName("")
                }}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
                currentFile={currentFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectItem({ 
  project, 
  isSelected, 
  onSelect, 
  onDelete, 
  onExport, 
  onShare,
  onAddFile,
  isAddingFile,
  newFileName,
  setNewFileName,
  onConfirmAddFile,
  onCancelAddFile,
  onFileSelect,
  onFileDelete,
  currentFile
}) {
  const [isExpanded, setIsExpanded] = useState(isSelected)

  React.useEffect(() => {
    if (isSelected) setIsExpanded(true)
  }, [isSelected])

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const iconMap = {
      'js': '📝',
      'jsx': '⚛️', 
      'ts': '🔷',
      'tsx': '⚛️',
      'py': '🐍',
      'html': '🌐',
      'css': '🎨',
      'json': '📄',
      'md': '📋'
    }
    return iconMap[ext] || '📄'
  }

  return (
    <div className={`rounded-lg border mb-2 ${
      isSelected 
        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' 
        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
    }`}>
      {/* Project Header */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => {
            onSelect()
            setIsExpanded(!isExpanded)
          }}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <Folder className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {project.name}
          </span>
          <span className="text-xs text-zinc-500">
            ({project.files.length} files)
          </span>
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onAddFile}
            className="p-1 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950"
            title="Add file"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={onExport}
            className="p-1 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-950"
            title="Export project"
          >
            <Download className="h-3 w-3" />
          </button>
          <button
            onClick={onShare}
            className="p-1 text-zinc-500 hover:text-green-600 hover:bg-green-50 rounded dark:text-zinc-400 dark:hover:text-green-400 dark:hover:bg-green-950"
            title="Share project"
          >
            <Share2 className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950"
            title="Delete project"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Files List */}
      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          {/* Add File Input */}
          {isAddingFile && (
            <div className="p-3 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.ext"
                className="w-full px-2 py-1 text-xs border border-zinc-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => e.key === 'Enter' && onConfirmAddFile()}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onConfirmAddFile}
                  className="px-2 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Add
                </button>
                <button
                  onClick={onCancelAddFile}
                  className="px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 rounded dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Files */}
          {project.files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2 px-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                currentFile?.id === file.id 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                  : ''
              }`}
            >
              <button
                onClick={() => onFileSelect?.(file)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <span className="text-xs">{getFileIcon(file.name)}</span>
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {file.name}
                </span>
              </button>
              <button
                onClick={() => onFileDelete?.(project.id, file.id)}
                className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-950"
                title="Delete file"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {project.files.length === 0 && !isAddingFile && (
            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
              <p className="text-xs">No files yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}