import React, { useState } from 'react'
import { GlobeAltIcon, PaperAirplaneIcon, PlusIcon, TrashIcon, DocumentDuplicateIcon, ClockIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import axios from 'axios'

const APIBox = () => {
  const { tools, updateTool, addNotification } = useStore()
  const apiState = tools.apibox

  const [activeTab, setActiveTab] = useState('headers')
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

  const sendRequest = async () => {
    if (!apiState.url.trim()) {
      addNotification('Please enter a URL', 'warning')
      return
    }

    updateTool('apibox', { loading: true, response: null })

    try {
      const startTime = Date.now()

      const config = {
        method: apiState.method.toLowerCase(),
        url: apiState.url,
        headers: apiState.headers,
        timeout: 30000
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(apiState.method) && apiState.body) {
        try {
          // Try to parse as JSON first
          config.data = JSON.parse(apiState.body)
          config.headers['Content-Type'] = 'application/json'
        } catch {
          // If not JSON, send as text
          config.data = apiState.body
          config.headers['Content-Type'] = 'text/plain'
        }
      }

      const response = await axios(config)
      const endTime = Date.now()

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - startTime,
        size: JSON.stringify(response.data).length
      }

      updateTool('apibox', { response: responseData, loading: false })
      addNotification(`Request completed in ${responseData.time}ms`, 'success')
    } catch (error) {
      const endTime = Date.now()
      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || 'Network Error',
        headers: error.response?.headers || {},
        data: error.response?.data || { error: error.message },
        time: endTime - Date.now(),
        size: 0,
        isError: true
      }

      updateTool('apibox', { response: errorResponse, loading: false })
      addNotification(`Request failed: ${error.message}`, 'error')
    }
  }

  const addHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) {
      addNotification('Please enter both header key and value', 'warning')
      return
    }

    const updatedHeaders = {
      ...apiState.headers,
      [newHeaderKey]: newHeaderValue
    }

    updateTool('apibox', { headers: updatedHeaders })
    setNewHeaderKey('')
    setNewHeaderValue('')
    addNotification('Header added', 'success')
  }

  const removeHeader = (key) => {
    const updatedHeaders = { ...apiState.headers }
    delete updatedHeaders[key]
    updateTool('apibox', { headers: updatedHeaders })
    addNotification('Header removed', 'info')
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
    updateTool('apibox', {
      url: '',
      headers: {},
      body: '',
      response: null
    })
    addNotification('Cleared all data', 'info')
  }

  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <GlobeAltIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          APIBox
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Test and build API requests with full HTTP method support
        </p>
      </div>

      {/* Request Builder */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request</h3>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Clear All
          </button>
        </div>

        {/* URL and Method */}
        <div className="flex gap-2 mb-4">
          <select
            value={apiState.method}
            onChange={(e) => updateTool('apibox', { method: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {httpMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          <input
            type="url"
            value={apiState.url}
            onChange={(e) => updateTool('apibox', { url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          <button
            onClick={sendRequest}
            disabled={apiState.loading || !apiState.url.trim()}
            className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {apiState.loading ? (
              <>
                <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-700 mb-4">
          <nav className="flex space-x-8">
            {['headers', 'body'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Header key"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                placeholder="Header value"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={addHeader}
                className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(apiState.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-900 rounded-lg">
                  <span className="font-mono text-sm text-gray-900 dark:text-white flex-1">
                    <strong>{key}:</strong> {value}
                  </span>
                  <button
                    onClick={() => removeHeader(key)}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {Object.keys(apiState.headers).length === 0 && (
                <p className="text-gray-500 dark:text-dark-400 text-sm text-center py-4">
                  No headers added yet
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div>
            <textarea
              value={apiState.body}
              onChange={(e) => updateTool('apibox', { body: e.target.value })}
              placeholder="Request body (JSON, XML, text, etc.)"
              className="w-full h-40 resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 dark:text-dark-400 mt-2">
              Enter JSON, XML, or plain text. Content-Type header will be set automatically.
            </p>
          </div>
        )}
      </div>

      {/* Response */}
      {apiState.response && (
        <div className="flex-1 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response</h3>
              <div className="flex items-center space-x-2">
                <span className={`font-bold ${getStatusColor(apiState.response.status)}`}>
                  {apiState.response.status} {apiState.response.statusText}
                </span>
                <span className="text-sm text-gray-600 dark:text-dark-400">
                  {apiState.response.time}ms
                </span>
                <span className="text-sm text-gray-600 dark:text-dark-400">
                  {apiState.response.size} bytes
                </span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(formatJson(apiState.response.data))}
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Copy Response
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Response Headers */}
              <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Headers</h4>
                <div className="space-y-1 text-sm font-mono">
                  {Object.entries(apiState.response.headers).map(([key, value]) => (
                    <div key={key} className="text-gray-700 dark:text-dark-300">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              <div className="lg:col-span-2 bg-gray-50 dark:bg-dark-900 rounded-lg p-3 flex flex-col">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Body</h4>
                <pre className="flex-1 text-sm font-mono text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap">
                  {formatJson(apiState.response.data)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {!apiState.response && !apiState.loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GlobeAltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Response Yet</h3>
            <p className="text-gray-600 dark:text-dark-400 max-w-md">
              Enter a URL and click Send to make your first API request.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default APIBox
