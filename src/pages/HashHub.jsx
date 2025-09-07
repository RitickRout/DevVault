import React, { useState, useEffect } from 'react'
import { HashtagIcon, DocumentDuplicateIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import CryptoJS from 'crypto-js'

const HashHub = () => {
  const { tools, updateTool, addNotification } = useStore()
  const hashState = tools.hashhub

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (hashState.input) {
      generateHash()
    } else {
      updateTool('hashhub', { output: '' })
    }
  }, [hashState.input, hashState.algorithm])

  const generateHash = () => {
    if (!hashState.input) {
      updateTool('hashhub', { output: '' })
      return
    }

    try {
      let hash = ''

      switch (hashState.algorithm) {
        case 'md5':
          hash = CryptoJS.MD5(hashState.input).toString()
          break
        case 'sha1':
          hash = CryptoJS.SHA1(hashState.input).toString()
          break
        case 'sha256':
          hash = CryptoJS.SHA256(hashState.input).toString()
          break
        case 'sha512':
          hash = CryptoJS.SHA512(hashState.input).toString()
          break
        case 'sha3':
          hash = CryptoJS.SHA3(hashState.input).toString()
          break
        case 'ripemd160':
          hash = CryptoJS.RIPEMD160(hashState.input).toString()
          break
        default:
          hash = CryptoJS.SHA256(hashState.input).toString()
      }

      updateTool('hashhub', { output: hash })
    } catch (error) {
      addNotification(`Error generating hash: ${error.message}`, 'error')
    }
  }

  const generateUUID = (version = 4) => {
    setIsGenerating(true)

    try {
      let uuid = ''

      if (version === 4) {
        // UUID v4 (random)
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      } else if (version === 1) {
        // UUID v1 (timestamp-based) - simplified version
        const timestamp = Date.now()
        const random = Math.random().toString(16).substring(2, 15)
        uuid = `${timestamp.toString(16)}-${random.substring(0, 4)}-1${random.substring(4, 7)}-${random.substring(7, 11)}-${random.substring(11, 23)}`
      }

      updateTool('hashhub', { input: uuid })
      addNotification(`UUID v${version} generated!`, 'success')
    } catch (error) {
      addNotification(`Error generating UUID: ${error.message}`, 'error')
    } finally {
      setTimeout(() => setIsGenerating(false), 500)
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
    updateTool('hashhub', { input: '', output: '' })
    addNotification('Cleared all content', 'info')
  }

  const algorithms = [
    { value: 'md5', name: 'MD5', description: '128-bit hash (not secure)' },
    { value: 'sha1', name: 'SHA-1', description: '160-bit hash (deprecated)' },
    { value: 'sha256', name: 'SHA-256', description: '256-bit hash (recommended)' },
    { value: 'sha512', name: 'SHA-512', description: '512-bit hash (very secure)' },
    { value: 'sha3', name: 'SHA-3', description: '256-bit hash (latest standard)' },
    { value: 'ripemd160', name: 'RIPEMD-160', description: '160-bit hash' }
  ]

  const sampleInputs = [
    'Hello, World!',
    'The quick brown fox jumps over the lazy dog',
    'Lorem ipsum dolor sit amet',
    'password123',
    'user@example.com'
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <HashtagIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          HashHub
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Generate hashes and UUIDs with multiple algorithms and formats
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
              Algorithm:
            </label>
            <select
              value={hashState.algorithm}
              onChange={(e) => updateTool('hashhub', { algorithm: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {algorithms.map((algo) => (
                <option key={algo.value} value={algo.value}>
                  {algo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateUUID(4)}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isGenerating ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4 mr-2" />
              )}
              UUID v4
            </button>

            <button
              onClick={() => generateUUID(1)}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              UUID v1
            </button>

            <button
              onClick={clearAll}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-dark-400">
          <p><strong>Selected:</strong> {algorithms.find(a => a.value === hashState.algorithm)?.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input</h3>
            <p className="text-sm text-gray-600 dark:text-dark-400">Enter text to hash or generate UUID</p>
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={hashState.input}
              onChange={(e) => updateTool('hashhub', { input: e.target.value })}
              placeholder="Enter text to hash..."
              className="flex-1 resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ minHeight: '200px' }}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Sample Inputs
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleInputs.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => updateTool('hashhub', { input: sample })}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
                  >
                    {sample.length > 20 ? `${sample.substring(0, 20)}...` : sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hash Output</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {hashState.algorithm.toUpperCase()} hash result
              </p>
            </div>
            {hashState.output && (
              <button
                onClick={() => copyToClipboard(hashState.output)}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="h-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-600 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-white overflow-auto break-all">
              {hashState.output || 'Hash will appear here...'}
            </div>
          </div>
        </div>
      </div>

      {/* Hash Information */}
      {hashState.output && (
        <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hash Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {hashState.algorithm.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Algorithm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hashState.output.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.ceil(hashState.output.length / 2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Bytes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {hashState.output.length * 4}
              </div>
              <div className="text-sm text-gray-600 dark:text-dark-400">Bits</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">About {hashState.algorithm.toUpperCase()}</h4>
            <p className="text-sm text-gray-600 dark:text-dark-400">
              {(() => {
                switch (hashState.algorithm) {
                  case 'md5':
                    return 'MD5 produces a 128-bit hash value. It is not cryptographically secure and should not be used for security purposes.'
                  case 'sha1':
                    return 'SHA-1 produces a 160-bit hash value. It is deprecated for cryptographic use due to vulnerabilities.'
                  case 'sha256':
                    return 'SHA-256 produces a 256-bit hash value and is part of the SHA-2 family. It is widely used and considered secure.'
                  case 'sha512':
                    return 'SHA-512 produces a 512-bit hash value and is part of the SHA-2 family. It offers higher security than SHA-256.'
                  case 'sha3':
                    return 'SHA-3 produces a 256-bit hash value and is the latest member of the Secure Hash Algorithm family.'
                  case 'ripemd160':
                    return 'RIPEMD-160 produces a 160-bit hash value and is used in some cryptocurrency applications.'
                  default:
                    return 'Hash algorithm information not available.'
                }
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HashHub
