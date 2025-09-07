import React, { useState, useEffect } from 'react'
import { 
  CommandLineIcon, 
  DocumentDuplicateIcon, 
  SparklesIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  KeyIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import { generateSQLQuery, explainSQLQuery, optimizeSQLQuery } from '../utils/geminiApi'
import SEO from '../components/SEO'

const QueryForge = () => {
  const { tools, updateTool, addNotification } = useStore()
  const queryforgeState = tools.queryforge

  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  useEffect(() => {
    // Check if API key is available
    if (!queryforgeState.apiKey) {
      setShowApiKeyInput(true)
    }
  }, [queryforgeState.apiKey])

  const handleGenerateQuery = async () => {
    if (!queryforgeState.userRequest.trim()) {
      addNotification('Please enter a request to generate SQL query', 'error')
      return
    }

    if (!queryforgeState.apiKey.trim()) {
      addNotification('Please provide your Gemini API key', 'error')
      setShowApiKeyInput(true)
      return
    }

    updateTool('queryforge', { isLoading: true, error: null })

    try {
      const result = await generateSQLQuery(
        queryforgeState.userRequest,
        queryforgeState.schema,
        queryforgeState.dbType,
        queryforgeState.apiKey
      )

      if (result.success) {
        const historyEntry = {
          id: Date.now(),
          request: queryforgeState.userRequest,
          query: result.query,
          dbType: queryforgeState.dbType,
          timestamp: new Date().toISOString()
        }

        updateTool('queryforge', {
          generatedQuery: result.query,
          history: [historyEntry, ...queryforgeState.history.slice(0, 9)], // Keep last 10
          isLoading: false,
          error: null
        })
        addNotification('SQL query generated successfully!', 'success')
      } else {
        updateTool('queryforge', {
          isLoading: false,
          error: result.error
        })
        addNotification(result.error, 'error')
      }
    } catch (error) {
      updateTool('queryforge', {
        isLoading: false,
        error: error.message
      })
      addNotification('Failed to generate SQL query', 'error')
    }
  }

  const handleExplainQuery = async () => {
    if (!queryforgeState.generatedQuery.trim()) {
      addNotification('No query to explain', 'error')
      return
    }

    updateTool('queryforge', { isLoading: true })

    try {
      const result = await explainSQLQuery(queryforgeState.generatedQuery, queryforgeState.apiKey)
      
      if (result.success) {
        updateTool('queryforge', {
          explanation: result.explanation,
          isLoading: false
        })
        addNotification('Query explanation generated!', 'success')
      } else {
        updateTool('queryforge', { isLoading: false })
        addNotification(result.error, 'error')
      }
    } catch (error) {
      updateTool('queryforge', { isLoading: false })
      addNotification('Failed to explain query', 'error')
    }
  }

  const handleOptimizeQuery = async () => {
    if (!queryforgeState.generatedQuery.trim()) {
      addNotification('No query to optimize', 'error')
      return
    }

    updateTool('queryforge', { isLoading: true })

    try {
      const result = await optimizeSQLQuery(queryforgeState.generatedQuery, queryforgeState.apiKey)
      
      if (result.success) {
        updateTool('queryforge', {
          optimizedQuery: result.optimizedQuery,
          isLoading: false
        })
        addNotification('Query optimized!', 'success')
      } else {
        updateTool('queryforge', { isLoading: false })
        addNotification(result.error, 'error')
      }
    } catch (error) {
      updateTool('queryforge', { isLoading: false })
      addNotification('Failed to optimize query', 'error')
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
    updateTool('queryforge', {
      userRequest: '',
      generatedQuery: '',
      explanation: '',
      optimizedQuery: '',
      error: null
    })
    addNotification('Cleared all content', 'info')
  }

  const loadFromHistory = (historyItem) => {
    updateTool('queryforge', {
      userRequest: historyItem.request,
      generatedQuery: historyItem.query,
      dbType: historyItem.dbType,
      explanation: '',
      optimizedQuery: '',
      error: null
    })
    addNotification('Loaded from history', 'info')
  }

  const dbTypes = ['MySQL', 'PostgreSQL', 'SQLite', 'SQL Server', 'Oracle']

  return (
    <>
      <SEO 
        title="QueryForge - AI SQL Generator"
        description="Generate SQL queries from natural language using AI. Convert plain English to optimized SQL with Gemini AI integration. Supports MySQL, PostgreSQL, and more."
        keywords="SQL generator, AI SQL, natural language to SQL, query generator, Gemini AI, database queries, SQL optimization"
        canonical="/queryforge"
      />
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
            QueryForge
          </h1>
          <p className="text-gray-600 dark:text-dark-400 mt-2">
            AI-powered SQL query generator using Gemini API. Convert natural language to optimized SQL queries.
          </p>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <KeyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Gemini API Key Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  To use QueryForge, you need a Gemini API key. Get one free at{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={queryforgeState.apiKey}
                    onChange={(e) => updateTool('queryforge', { apiKey: e.target.value })}
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    disabled={!queryforgeState.apiKey.trim()}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Input */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Natural Language Request</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={queryforgeState.dbType}
                    onChange={(e) => updateTool('queryforge', { dbType: e.target.value })}
                    className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {dbTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={queryforgeState.userRequest}
                onChange={(e) => updateTool('queryforge', { userRequest: e.target.value })}
                placeholder="Describe what you want to query in plain English... 
Example: 'Get all users who registered in the last 30 days and have made at least 3 orders'"
                className="w-full h-32 resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handleGenerateQuery}
                  disabled={queryforgeState.isLoading || !queryforgeState.apiKey}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {queryforgeState.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <SparklesIcon className="w-4 h-4 mr-2" />
                  )}
                  Generate SQL
                </button>
                {!queryforgeState.apiKey && (
                  <button
                    onClick={() => setShowApiKeyInput(true)}
                    className="flex items-center px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors text-sm"
                  >
                    <KeyIcon className="w-4 h-4 mr-1" />
                    Add API Key
                  </button>
                )}
              </div>
            </div>

            {/* Schema Input */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Schema (Optional)</h3>
              <textarea
                value={queryforgeState.schema}
                onChange={(e) => updateTool('queryforge', { schema: e.target.value })}
                placeholder="Provide your database schema for better query generation...
Example:
users (id, name, email, created_at)
orders (id, user_id, total, created_at)
products (id, name, price, category_id)"
                className="w-full h-24 resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* History Sidebar */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Recent Queries
            </h3>
            {queryforgeState.history.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {queryforgeState.history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 border border-gray-200 dark:border-dark-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {item.request}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-400 flex items-center justify-between">
                      <span>{item.dbType}</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-dark-400 py-8">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No queries generated yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {(queryforgeState.generatedQuery || queryforgeState.error) && (
          <div className="mt-6 space-y-6">
            {/* Error Display */}
            {queryforgeState.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">{queryforgeState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Query */}
            {queryforgeState.generatedQuery && (
              <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <CommandLineIcon className="w-5 h-5 mr-2" />
                    Generated SQL Query
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExplainQuery}
                      disabled={queryforgeState.isLoading}
                      className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                    >
                      <InformationCircleIcon className="w-4 h-4 mr-1" />
                      Explain
                    </button>
                    <button
                      onClick={handleOptimizeQuery}
                      disabled={queryforgeState.isLoading}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                    >
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      Optimize
                    </button>
                    <button
                      onClick={() => copyToClipboard(queryforgeState.generatedQuery)}
                      className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                    {queryforgeState.generatedQuery}
                  </pre>
                </div>
              </div>
            )}

            {/* Explanation */}
            {queryforgeState.explanation && (
              <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Query Explanation
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-gray-700 dark:text-dark-300 whitespace-pre-wrap">
                    {queryforgeState.explanation}
                  </div>
                </div>
              </div>
            )}

            {/* Optimized Query */}
            {queryforgeState.optimizedQuery && (
              <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Optimized Query
                  </h3>
                  <button
                    onClick={() => copyToClipboard(queryforgeState.optimizedQuery)}
                    className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                    {queryforgeState.optimizedQuery}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        {!queryforgeState.generatedQuery && !queryforgeState.error && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Tips for Better Results
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Be specific about what data you want to retrieve</li>
              <li>• Mention table names and column names if you know them</li>
              <li>• Include conditions like date ranges, limits, or filters</li>
              <li>• Provide your database schema for more accurate queries</li>
              <li>• Use natural language - no need for technical SQL terms</li>
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

export default QueryForge
