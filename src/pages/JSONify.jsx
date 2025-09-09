import React, { useState, useEffect } from 'react'
import { CodeBracketIcon, DocumentDuplicateIcon, ArrowPathIcon, CheckIcon, ExclamationTriangleIcon, EyeIcon, DocumentTextIcon, Squares2X2Icon, ShareIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import { formatJson, validateJson, minifyJson } from '../utils/jsonUtils'
import SEO from '../components/SEO'
import JSONTreeViewer from '../components/JSONTreeViewer'
import JSONGraphViewer from '../components/JSONGraphViewer'

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
    <>
      <SEO
        title="JSON Formatter & Validator"
        description="Free online JSON formatter, validator, and prettifier. Format, validate, and minify JSON data with real-time validation, syntax highlighting, and detailed statistics."
        keywords="JSON formatter, JSON validator, JSON prettifier, JSON minifier, format JSON online, validate JSON, JSON syntax checker"
        canonical="/jsonify"
      />
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
            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
              View:
            </label>
            <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => updateTool('jsonify', { viewMode: 'text' })}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  jsonifyState.viewMode === 'text'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Text
              </button>
              <button
                onClick={() => updateTool('jsonify', { viewMode: 'visual' })}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  jsonifyState.viewMode === 'visual'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Tree
              </button>
              <button
                onClick={() => updateTool('jsonify', { viewMode: 'graph' })}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  jsonifyState.viewMode === 'graph'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShareIcon className="w-4 h-4 mr-1" />
                Graph
              </button>
              <button
                onClick={() => updateTool('jsonify', { viewMode: 'split' })}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  jsonifyState.viewMode === 'split'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4 mr-1" />
                Split
              </button>
            </div>
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

            <button
              onClick={() => {
                const sampleData = {
                  "squadName": "Super hero squad",
                  "homeTown": "Metro City",
                  "formed": 2016,
                  "secretBase": "Super tower",
                  "active": true,
                  "members": [
                    {
                      "name": "Molecule Man",
                      "age": 29,
                      "secretIdentity": "Dan Jukes",
                      "powers": [
                        "Radiation resistance",
                        "Turning tiny",
                        "Radiation blast"
                      ]
                    },
                    {
                      "name": "Madame Uppercut",
                      "age": 39,
                      "secretIdentity": "Jane Wilson",
                      "powers": [
                        "Million tonne punch",
                        "Damage resistance",
                        "Superhuman reflexes"
                      ]
                    },
                    {
                      "name": "Eternal Flame",
                      "age": 1000000,
                      "secretIdentity": "Unknown",
                      "powers": [
                        "Immortality",
                        "Heat Immunity",
                        "Inferno",
                        "Teleportation",
                        "Interdimensional travel"
                      ]
                    }
                  ]
                }
                updateTool('jsonify', { input: JSON.stringify(sampleData, null, 2) })
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Load Sample
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
      <div className={`flex-1 gap-6 min-h-0 ${
        jsonifyState.viewMode === 'split'
          ? 'grid grid-cols-1 xl:grid-cols-3'
          : jsonifyState.viewMode === 'graph' || jsonifyState.viewMode === 'visual'
          ? 'grid grid-cols-1 lg:grid-cols-2'
          : 'grid grid-cols-1 lg:grid-cols-2'
      }`}>
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

        {/* Output Section - Text View */}
        {(jsonifyState.viewMode === 'text' || jsonifyState.viewMode === 'split') && (
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
        )}

        {/* Visual Tree View */}
        {(jsonifyState.viewMode === 'visual' || jsonifyState.viewMode === 'split') && (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Tree</h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">Interactive JSON structure visualization</p>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <JSONTreeViewer
                data={jsonifyState.input}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Graph View */}
        {jsonifyState.viewMode === 'graph' && (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Graph Visualization</h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">Node-based JSON structure diagram</p>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <JSONGraphViewer
                data={jsonifyState.input}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {jsonifyState.stats && (
        <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">JSON Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {jsonifyState.stats.size}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-dark-400">Bytes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {jsonifyState.stats.keys}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-dark-400">Keys</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {jsonifyState.stats.depth}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-dark-400">Depth</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {jsonifyState.stats.arrayItems}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-dark-400">Array Items</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {jsonifyState.stats.type}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-dark-400">Type</div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default JSONify
