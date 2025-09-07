import React, { useState, useEffect } from 'react'
import { KeyIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, CheckIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'

const TokenPeek = () => {
  const { tools, updateTool, addNotification } = useStore()
  const tokenState = tools.tokenpeek

  const [isValid, setIsValid] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    decodeToken()
  }, [tokenState.token])

  const decodeToken = () => {
    if (!tokenState.token.trim()) {
      updateTool('tokenpeek', { decoded: null, isValid: null })
      setIsValid(null)
      setError('')
      return
    }

    try {
      const parts = tokenState.token.split('.')

      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.')
      }

      const [headerB64, payloadB64, signature] = parts

      // Decode header
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))

      // Decode payload
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

      // Validate common claims
      const now = Math.floor(Date.now() / 1000)
      const isExpired = payload.exp && payload.exp < now
      const isNotYetValid = payload.nbf && payload.nbf > now

      const decoded = {
        header,
        payload,
        signature,
        isExpired,
        isNotYetValid,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        notBefore: payload.nbf ? new Date(payload.nbf * 1000) : null
      }

      updateTool('tokenpeek', { decoded, isValid: true })
      setIsValid(true)
      setError('')
    } catch (err) {
      setIsValid(false)
      setError(err.message)
      updateTool('tokenpeek', { decoded: null, isValid: false })
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

  const clearToken = () => {
    updateTool('tokenpeek', { token: '', decoded: null, isValid: null })
    addNotification('Cleared token', 'info')
  }

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
  }

  const getTokenStatus = () => {
    if (!tokenState.decoded) return null

    const { isExpired, isNotYetValid } = tokenState.decoded

    if (isExpired) {
      return { type: 'error', message: 'Token has expired', icon: ExclamationTriangleIcon }
    }

    if (isNotYetValid) {
      return { type: 'warning', message: 'Token is not yet valid', icon: ClockIcon }
    }

    return { type: 'success', message: 'Token is valid', icon: CheckIcon }
  }

  const sampleTokens = [
    {
      name: 'Sample JWT',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <KeyIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          TokenPeek
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Decode and debug JWT tokens with detailed information and validation
        </p>
      </div>

      {/* Token Input */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">JWT Token</h3>
          <div className="flex items-center space-x-2">
            {isValid === true && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">Valid JWT</span>
              </div>
            )}
            {isValid === false && (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">Invalid JWT</span>
              </div>
            )}
            <button
              onClick={clearToken}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              value={tokenState.token}
              onChange={(e) => updateTool('tokenpeek', { token: e.target.value })}
              placeholder="Paste your JWT token here..."
              className="w-full h-32 resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Sample Tokens
            </label>
            <select
              onChange={(e) => {
                const sample = sampleTokens.find(s => s.name === e.target.value)
                if (sample) {
                  updateTool('tokenpeek', { token: sample.token })
                }
              }}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a sample token</option>
              {sampleTokens.map((sample) => (
                <option key={sample.name} value={sample.name}>
                  {sample.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Token Status */}
      {tokenState.decoded && (
        <div className="mb-6">
          {(() => {
            const status = getTokenStatus()
            if (!status) return null

            const StatusIcon = status.icon
            const colorClasses = {
              success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
              warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
              error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }

            return (
              <div className={`border rounded-xl p-4 ${colorClasses[status.type]}`}>
                <div className="flex items-center">
                  <StatusIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{status.message}</span>
                </div>
                {tokenState.decoded.expiresAt && (
                  <div className="mt-2 text-sm">
                    <div>Expires: {tokenState.decoded.expiresAt.toLocaleString()}</div>
                    {tokenState.decoded.issuedAt && (
                      <div>Issued: {tokenState.decoded.issuedAt.toLocaleString()}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Decoded Sections */}
      {tokenState.decoded && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Header */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Header</h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">Algorithm and token type</p>
              </div>
              <button
                onClick={() => copyToClipboard(formatJson(tokenState.decoded.header))}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                {formatJson(tokenState.decoded.header)}
              </pre>
            </div>
          </div>

          {/* Payload */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payload</h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">Claims and user data</p>
              </div>
              <button
                onClick={() => copyToClipboard(formatJson(tokenState.decoded.payload))}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                {formatJson(tokenState.decoded.payload)}
              </pre>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Signature
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">Verification signature</p>
              </div>
              <button
                onClick={() => copyToClipboard(tokenState.decoded.signature)}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-600 rounded-lg p-3">
                <div className="text-sm text-gray-900 dark:text-white font-mono break-all">
                  {tokenState.decoded.signature}
                </div>
                <div className="mt-3 text-xs text-gray-600 dark:text-dark-400">
                  <p><strong>Note:</strong> The signature is used to verify that the token hasn't been tampered with. To verify the signature, you need the secret key or public key used to sign the token.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!tokenState.decoded && tokenState.token && isValid === false && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Invalid JWT Token</h3>
            <p className="text-gray-600 dark:text-dark-400 max-w-md">
              The token you entered is not a valid JWT. Please check the format and try again.
            </p>
          </div>
        </div>
      )}

      {!tokenState.token && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <KeyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Token Provided</h3>
            <p className="text-gray-600 dark:text-dark-400 max-w-md">
              Enter a JWT token above to decode and inspect its contents.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenPeek
