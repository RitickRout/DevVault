import React, { useState, useEffect } from 'react'
import { CodeBracketIcon, DocumentDuplicateIcon, ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import { formatJson, validateJson, minifyJson } from '../utils/jsonUtils'

const JSONify = () => {
  const { tools, updateTool, addNotification } = useStore()
  const jsonifyState = tools.jsonify

  const [isFormatting, setIsFormatting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (jsonifyState.input) {
      validateInput()
    }
  }, [jsonifyState.input])

  const validateInput = async () => {
    if (!jsonifyState.input.trim()) {
      updateTool('jsonify', { isValid: null, stats: null })
      return
    }

    setIsValidating(true)
    try {
      const result = await validateJson(jsonifyState.input)
      updateTool('jsonify', { isValid: result.valid })

      if (!result.valid) {
        updateTool('jsonify', { output: '', stats: null })
      }
    } catch (error) {
      updateTool('jsonify', { isValid: false, output: '', stats: null })
    } finally {
      setIsValidating(false)
    }
  }

  const handleFormat = async () => {
    if (!jsonifyState.input.trim()) {
      addNotification('Please enter some JSON to format', 'warning')
      return
    }

    setIsFormatting(true)
    try {
      const result = await formatJson(jsonifyState.input, jsonifyState.indent)
      updateTool('jsonify', {
        output: result.formatted,
        stats: result.stats,
        isValid: true
      })
      addNotification('JSON formatted successfully!', 'success')
    } catch (error) {
      updateTool('jsonify', {
        output: '',
        stats: null,
        isValid: false
      })
      addNotification(`Invalid JSON: ${error.message}`, 'error')
    } finally {
      setIsFormatting(false)
    }
  }

  const handleMinify = async () => {
    if (!jsonifyState.input.trim()) {
      addNotification('Please enter some JSON to minify', 'warning')
      return
    }

    setIsFormatting(true)
    try {
      const result = await minifyJson(jsonifyState.input)
      updateTool('jsonify', {
        output: result.minified,
        stats: result.stats,
        isValid: true
      })
      addNotification('JSON minified successfully!', 'success')
    } catch (error) {
      updateTool('jsonify', {
        output: '',
        stats: null,
        isValid: false
      })
      addNotification(`Invalid JSON: ${error.message}`, 'error')
    } finally {
      setIsFormatting(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addNotification('Copied to clipboard!', 'success')
    } catch (error) {
      addNotification('Failed to copy to clipboard', 'error')
    }
  }

  const clearAll = () => {
    updateTool('jsonify', {
      input: '',
      output: '',
      isValid: null,
      stats: null
    })
    addNotification('Cleared all content', 'info')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <CodeBracketIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          JSONify
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Format, validate, and prettify JSON data with real-time validation
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
              Indent:
            </label>
            <select
              value={jsonifyState.indent}
              onChange={(e) => updateTool('jsonify', { indent: parseInt(e.target.value) })}
              className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
              <option value={0}>Minified</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFormat}
              disabled={isFormatting || !jsonifyState.input.trim()}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isFormatting ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CodeBracketIcon className="w-4 h-4 mr-2" />
              )}
              Format
            </button>

            <button
              onClick={handleMinify}
              disabled={isFormatting || !jsonifyState.input.trim()}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Minify
            </button>

            <button
              onClick={clearAll}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>

          {/* Validation Status */}
          <div className="flex items-center ml-auto">
            {isValidating ? (
              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Validating...</span>
              </div>
            ) : jsonifyState.isValid === true ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">Valid JSON</span>
              </div>
            ) : jsonifyState.isValid === false ? (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">Invalid JSON</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input JSON</h3>
            <p className="text-sm text-gray-600 dark:text-dark-400">Paste your JSON data here</p>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={jsonifyState.input}
              onChange={(e) => updateTool('jsonify', { input: e.target.value })}
              placeholder="Paste your JSON here..."
              className="w-full h-full resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ minHeight: '300px' }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Formatted JSON</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">Formatted and validated output</p>
            </div>
            {jsonifyState.output && (
              <button
                onClick={() => copyToClipboard(jsonifyState.output)}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
            )}
          </div>
          <div className="flex-1 p-4">
            <pre className="w-full h-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-600 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap" style={{ minHeight: '300px' }}>
              {jsonifyState.output || 'Formatted JSON will appear here...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {jsonifyState.stats && (
        <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">JSON Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {jsonifyState.stats.size}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Bytes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {jsonifyState.stats.keys}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {jsonifyState.stats.depth}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {jsonifyState.stats.arrayItems}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Array Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {jsonifyState.stats.type}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Type</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JSONify
