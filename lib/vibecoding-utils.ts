// Enhanced utilities for the vibecoding system

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function for limiting API calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Enhanced code language detection
 */
export function detectLanguage(code: string): string {
  // Remove comments and strings for better analysis
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
    .replace(/\/\/.*$/gm, '')         // Remove // comments
    .replace(/".*?"|'.*?'|`.*?`/g, '') // Remove strings

  // Language detection patterns
  const patterns = {
    html: [/<\/?[a-z][\s\S]*>/i, /<!DOCTYPE/i],
    css: [/\{[^{}]*:[^{}]*\}/g, /@media|@import|@keyframes/i],
    javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/],
    jsx: [/<\w+.*?>/g, /React\./g, /useState|useEffect|useContext/g],
    typescript: [/interface\s+\w+/, /type\s+\w+\s*=/, /:\s*(string|number|boolean)/g],
    tsx: [/<\w+.*?>/g, /interface\s+\w+/, /React\./g],
    python: [/def\s+\w+\s*\(/, /import\s+\w+/, /from\s+\w+\s+import/, /if\s+__name__\s*==\s*["']__main__["']/],
    json: [/^\s*\{[\s\S]*\}\s*$/, /^\s*\[[\s\S]*\]\s*$/],
    yaml: [/^\s*\w+:\s*/, /^\s*-\s+/m],
    markdown: [/^#+\s/, /\*\*.*\*\*/, /\[.*\]\(.*\)/],
    scss: [/\$\w+\s*:/, /@mixin|@include|@extend/i, /&\s*\{/],
    sql: [/SELECT\s+.*\s+FROM/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i, /UPDATE\s+.*\s+SET/i]
  }

  // Check each language pattern
  for (const [lang, langPatterns] of Object.entries(patterns)) {
    const matches = langPatterns.reduce((count, pattern) => {
      const regexPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g')
      const found = cleanCode.match(regexPattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 0) {
      // Special case: distinguish between JS and JSX/TS and TSX
      if (lang === 'javascript' && cleanCode.includes('<')) {
        if (cleanCode.includes('interface') || cleanCode.includes(': string')) {
          return 'tsx'
        }
        return 'jsx'
      }
      if (lang === 'typescript' && cleanCode.includes('<')) {
        return 'tsx'
      }
      return lang
    }
  }

  return 'text'
}

/**
 * Extract code blocks from markdown-formatted text
 */
export function extractCodeBlocks(text: string): Array<{
  language: string
  code: string
  startIndex: number
  endIndex: number
}> {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const blocks = []
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || detectLanguage(match[2]),
      code: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    })
  }

  return blocks
}

/**
 * Format code with basic indentation
 */
export function formatCode(code: string, language: string): string {
  if (!code.trim()) return code

  switch (language.toLowerCase()) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(code), null, 2)
      } catch {
        return code
      }
    
    case 'html':
      return formatHtml(code)
    
    case 'css':
    case 'scss':
      return formatCss(code)
    
    default:
      return formatGeneric(code)
  }
}

/**
 * Basic HTML formatting
 */
function formatHtml(html: string): string {
  let formatted = html
  let indent = 0
  const indentSize = 2

  // Basic HTML formatting
  formatted = formatted.replace(/>\s*</g, '><')
  formatted = formatted.replace(/></g, '>\\n<')
  
  const lines = formatted.split('\\n')
  const formattedLines = lines.map(line => {
    line = line.trim()
    if (!line) return ''

    if (line.startsWith('</')) {
      indent -= indentSize
    }

    const indentedLine = ' '.repeat(Math.max(0, indent)) + line

    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
      indent += indentSize
    }

    return indentedLine
  })

  return formattedLines.join('\\n')
}

/**
 * Basic CSS formatting
 */
function formatCss(css: string): string {
  let formatted = css
  
  // Add newlines after braces and semicolons
  formatted = formatted.replace(/\{/g, ' {\\n  ')
  formatted = formatted.replace(/\}/g, '\\n}\\n')
  formatted = formatted.replace(/;/g, ';\\n  ')
  
  // Clean up extra whitespace
  formatted = formatted.replace(/\\n\\s*\\n/g, '\\n')
  formatted = formatted.replace(/^\\s+/gm, (match) => match.replace(/ /g, '  '))

  return formatted.trim()
}

/**
 * Generic code formatting (basic indentation)
 */
function formatGeneric(code: string): string {
  const lines = code.split('\\n')
  let indent = 0
  const indentSize = 2

  const formattedLines = lines.map(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return ''

    // Decrease indent for closing braces
    if (trimmedLine.includes('}') && !trimmedLine.includes('{')) {
      indent = Math.max(0, indent - indentSize)
    }

    const indentedLine = ' '.repeat(indent) + trimmedLine

    // Increase indent for opening braces
    if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
      indent += indentSize
    }

    return indentedLine
  })

  return formattedLines.join('\\n')
}

/**
 * Validate code syntax for basic errors
 */
export function validateCode(code: string, language: string): {
  isValid: boolean
  errors: Array<{ line: number; message: string }>
} {
  const errors: Array<{ line: number; message: string }> = []

  switch (language.toLowerCase()) {
    case 'json':
      try {
        JSON.parse(code)
      } catch (error: any) {
        errors.push({
          line: 1,
          message: `JSON Parse Error: ${error.message}`
        })
      }
      break

    case 'javascript':
    case 'jsx':
    case 'typescript':
    case 'tsx':
      // Basic JS/TS validation
      const lines = code.split('\\n')
      lines.forEach((line, index) => {
        // Check for unmatched braces/brackets/parentheses
        const openBraces = (line.match(/\{/g) || []).length
        const closeBraces = (line.match(/\}/g) || []).length
        const openParens = (line.match(/\(/g) || []).length
        const closeParens = (line.match(/\)/g) || []).length
        
        if (openBraces !== closeBraces) {
          errors.push({
            line: index + 1,
            message: `Unmatched braces: ${openBraces} open, ${closeBraces} close`
          })
        }
        
        if (openParens !== closeParens) {
          errors.push({
            line: index + 1,
            message: `Unmatched parentheses: ${openParens} open, ${closeParens} close`
          })
        }
      })
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Generate a color for a language
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    jsx: '#61dafb',
    tsx: '#61dafb',
    html: '#e34f26',
    css: '#1572b6',
    scss: '#cf649a',
    python: '#3776ab',
    json: '#292929',
    yaml: '#cb171e',
    markdown: '#083fa1',
    sql: '#e38c00',
    text: '#6b7280'
  }
  
  return colors[language.toLowerCase()] || colors.text
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()
  
  static start(label: string): void {
    this.timers.set(label, performance.now())
  }
  
  static end(label: string): number {
    const start = this.timers.get(label)
    if (!start) return 0
    
    const duration = performance.now() - start
    this.timers.delete(label)
    
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    return duration
  }
  
  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }
}

/**
 * Cache utilities for improved performance
 */
export class CodeCache {
  private static cache = new Map<string, any>()
  private static readonly MAX_CACHE_SIZE = 100
  
  static set(key: string, value: any, ttl: number = 5 * 60 * 1000): void {
    // Clear old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }
  
  static get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  static clear(): void {
    this.cache.clear()
  }
}

export default {
  debounce,
  throttle,
  detectLanguage,
  extractCodeBlocks,
  formatCode,
  validateCode,
  generateSessionId,
  formatFileSize,
  getFileExtension,
  getLanguageColor,
  PerformanceMonitor,
  CodeCache
}