import React, { useState, useEffect } from 'react'
import { DocumentTextIcon, EyeIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import { marked } from 'marked'

const Markee = () => {
  const { tools, updateTool, addNotification } = useStore()
  const markeeState = tools.markee

  const [viewMode, setViewMode] = useState('split') // 'edit', 'preview', 'split'
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    })

    // Update preview when markdown changes
    if (markeeState.markdown) {
      const html = marked(markeeState.markdown)
      updateTool('markee', { preview: html })
    }
  }, [markeeState.markdown])

  const copyToClipboard = async (text, type = 'content') => {
    try {
      await navigator.clipboard.writeText(text)
      addNotification(`${type} copied to clipboard!`, 'success')
    } catch (error) {
      addNotification('Failed to copy to clipboard', 'error')
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markeeState.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Markdown file downloaded', 'success')
  }

  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markee Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${markeeState.preview}
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
    addNotification('HTML file downloaded', 'success')
  }

  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('#markdown-editor')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markeeState.markdown.substring(start, end)

    let newText = ''
    let cursorOffset = 0

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        cursorOffset = selectedText ? 0 : -11
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        cursorOffset = selectedText ? 0 : -12
        break
      case 'code':
        newText = `\`${selectedText || 'code'}\``
        cursorOffset = selectedText ? 0 : -6
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        cursorOffset = selectedText ? -5 : -15
        break
      case 'image':
        newText = `![${selectedText || 'alt text'}](image-url)`
        cursorOffset = selectedText ? -12 : -22
        break
      case 'heading':
        newText = `# ${selectedText || 'Heading'}`
        cursorOffset = selectedText ? 0 : -7
        break
      case 'list':
        newText = `- ${selectedText || 'List item'}`
        cursorOffset = selectedText ? 0 : -9
        break
      case 'quote':
        newText = `> ${selectedText || 'Quote'}`
        cursorOffset = selectedText ? 0 : -5
        break
      case 'table':
        newText = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`
        cursorOffset = 0
        break
    }

    const newMarkdown = markeeState.markdown.substring(0, start) + newText + markeeState.markdown.substring(end)
    updateTool('markee', { markdown: newMarkdown })

    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + newText.length + cursorOffset
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const clearEditor = () => {
    updateTool('markee', {
      markdown: '# Welcome to Markee\n\nStart writing your markdown here...',
      preview: ''
    })
    addNotification('Editor cleared', 'info')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          Markee
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Live Markdown editor with real-time preview and export functionality
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* View Mode Buttons */}
          <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-dark-400'
              }`}
            >
              <PencilIcon className="w-4 h-4 inline mr-1" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-dark-400'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-dark-400'
              }`}
            >
              <EyeIcon className="w-4 h-4 inline mr-1" />
              Preview
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-dark-600"></div>

          {/* Formatting Buttons */}
          <div className="flex flex-wrap gap-1">
            {[
              { icon: 'B', action: 'bold', title: 'Bold' },
              { icon: 'I', action: 'italic', title: 'Italic' },
              { icon: '<>', action: 'code', title: 'Code' },
              { icon: 'H', action: 'heading', title: 'Heading' },
              { icon: '•', action: 'list', title: 'List' },
              { icon: '"', action: 'quote', title: 'Quote' },
              { icon: '🔗', action: 'link', title: 'Link' },
              { icon: '🖼️', action: 'image', title: 'Image' },
              { icon: '⊞', action: 'table', title: 'Table' }
            ].map((btn) => (
              <button
                key={btn.action}
                onClick={() => insertMarkdown(btn.action)}
                title={btn.title}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded transition-colors text-sm font-medium"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-dark-600"></div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => copyToClipboard(markeeState.markdown, 'Markdown')}
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Copy MD
            </button>
            <button
              onClick={() => copyToClipboard(markeeState.preview, 'HTML')}
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Copy HTML
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              .md
            </button>
            <button
              onClick={downloadHTML}
              className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              .html
            </button>
            <button
              onClick={clearEditor}
              className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-dark-400">
          <span className="font-medium">Tip:</span> Use the formatting buttons or type Markdown syntax directly.
          Supports GitHub Flavored Markdown including tables, code blocks, and more.
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col ${
            viewMode === 'split' ? 'lg:w-1/2' : 'w-full'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Markdown Editor</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">Write your markdown content here</p>
            </div>
            <div className="flex-1 p-4">
              <textarea
                id="markdown-editor"
                value={markeeState.markdown}
                onChange={(e) => updateTool('markee', { markdown: e.target.value })}
                placeholder="# Welcome to Markee

Start writing your markdown here...

## Features
- Live preview
- Syntax highlighting
- Export to HTML/MD
- GitHub Flavored Markdown support

**Bold text** and *italic text*

```javascript
console.log('Hello, World!');
```

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |"
                className="w-full h-full resize-none border-0 bg-transparent text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-0"
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col ${
            viewMode === 'split' ? 'lg:w-1/2' : 'w-full'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">Real-time rendered markdown</p>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                style={{
                  '--tw-prose-body': 'rgb(55 65 81)',
                  '--tw-prose-headings': 'rgb(17 24 39)',
                  '--tw-prose-lead': 'rgb(75 85 99)',
                  '--tw-prose-links': 'rgb(59 130 246)',
                  '--tw-prose-bold': 'rgb(17 24 39)',
                  '--tw-prose-counters': 'rgb(107 114 128)',
                  '--tw-prose-bullets': 'rgb(209 213 219)',
                  '--tw-prose-hr': 'rgb(229 231 235)',
                  '--tw-prose-quotes': 'rgb(17 24 39)',
                  '--tw-prose-quote-borders': 'rgb(229 231 235)',
                  '--tw-prose-captions': 'rgb(107 114 128)',
                  '--tw-prose-code': 'rgb(17 24 39)',
                  '--tw-prose-pre-code': 'rgb(229 231 235)',
                  '--tw-prose-pre-bg': 'rgb(17 24 39)',
                  '--tw-prose-th-borders': 'rgb(209 213 219)',
                  '--tw-prose-td-borders': 'rgb(229 231 235)'
                }}
                dangerouslySetInnerHTML={{ __html: markeeState.preview }}
              />
              {!markeeState.preview && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Content</h3>
                  <p className="text-gray-600 dark:text-dark-400 max-w-md mx-auto">
                    Start typing in the editor to see the live preview here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Markee
