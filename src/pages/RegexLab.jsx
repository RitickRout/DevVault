import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, DocumentDuplicateIcon, ExclamationTriangleIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'
import SEO from '../components/SEO'

const RegexLab = () => {
  const { tools, updateTool, addNotification } = useStore()
  const regexState = tools.regexlab

  const [isValid, setIsValid] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    testRegex()
  }, [regexState.pattern, regexState.testString, regexState.flags])

  const testRegex = () => {
    if (!regexState.pattern) {
      updateTool('regexlab', { matches: [] })
      setIsValid(null)
      setError('')
      return
    }

    try {
      const regex = new RegExp(regexState.pattern, regexState.flags)
      setIsValid(true)
      setError('')

      if (!regexState.testString) {
        updateTool('regexlab', { matches: [] })
        return
      }

      const matches = []
      let match

      if (regexState.flags.includes('g')) {
        while ((match = regex.exec(regexState.testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          })

          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        match = regex.exec(regexState.testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          })
        }
      }

      updateTool('regexlab', { matches })
    } catch (err) {
      setIsValid(false)
      setError(err.message)
      updateTool('regexlab', { matches: [] })
    }
  }

  const highlightMatches = (text, matches) => {
    if (!matches.length) return text

    let result = []
    let lastIndex = 0

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        result.push(
          <span key={`before-${i}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        )
      }

      // Add highlighted match
      result.push(
        <span
          key={`match-${i}`}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
          title={`Match ${i + 1}: "${match.match}"`}
        >
          {match.match}
        </span>
      )

      lastIndex = match.index + match.match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="after">
          {text.slice(lastIndex)}
        </span>
      )
    }

    return result
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
    updateTool('regexlab', {
      pattern: '',
      testString: '',
      matches: []
    })
    addNotification('Cleared all content', 'info')
  }

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'Phone', pattern: '\\+?[1-9]\\d{1,14}' },
    { name: 'IPv4', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: 'Time (HH:MM)', pattern: '\\d{2}:\\d{2}' },
    { name: 'Hex Color', pattern: '#[a-fA-F0-9]{6}' },
    { name: 'Credit Card', pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}' }
  ]

  return (
    <>
      <SEO
        title="Regex Tester & Pattern Matcher"
        description="Free online regular expression tester with live highlighting, match details, and common pattern presets. Test regex patterns with real-time validation and detailed match information."
        keywords="regex tester, regular expression tester, regex validator, pattern matcher, regex online, test regex, regex tool"
        canonical="/regexlab"
      />
      <div className="h-full flex flex-col">
        <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <MagnifyingGlassIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          RegexLab
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Test and experiment with regular expressions in real-time
        </p>
      </div>

      {/* Pattern Input */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Regular Expression</h3>
          <div className="flex items-center space-x-2">
            {isValid === true && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">Valid</span>
              </div>
            )}
            {isValid === false && (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">Invalid</span>
              </div>
            )}
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-dark-400 mr-2 font-mono">/</span>
              <input
                type="text"
                value={regexState.pattern}
                onChange={(e) => updateTool('regexlab', { pattern: e.target.value })}
                placeholder="Enter your regex pattern..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-500 dark:text-dark-400 ml-2 font-mono">/</span>
              <input
                type="text"
                value={regexState.flags}
                onChange={(e) => updateTool('regexlab', { flags: e.target.value })}
                placeholder="flags"
                className="w-16 px-2 py-2 ml-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <div>
            <select
              onChange={(e) => {
                const pattern = commonPatterns.find(p => p.name === e.target.value)
                if (pattern) {
                  updateTool('regexlab', { pattern: pattern.pattern })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Common Patterns</option>
              {commonPatterns.map((pattern) => (
                <option key={pattern.name} value={pattern.name}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-dark-400">
          <p><strong>Flags:</strong> g (global), i (ignore case), m (multiline), s (dotall), u (unicode), y (sticky)</p>
        </div>
      </div>

      {/* Test String and Results */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Test String */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test String</h3>
            <p className="text-sm text-gray-600 dark:text-dark-400">Enter text to test your regex against</p>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={regexState.testString}
              onChange={(e) => updateTool('regexlab', { testString: e.target.value })}
              placeholder="Enter your test string here..."
              className="w-full h-full resize-none border border-gray-300 dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Results</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {regexState.matches.length} match{regexState.matches.length !== 1 ? 'es' : ''} found
              </p>
            </div>
            {regexState.testString && regexState.matches.length > 0 && (
              <button
                onClick={() => copyToClipboard(regexState.pattern)}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-300 rounded-lg transition-colors text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Copy Regex
              </button>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {regexState.testString ? (
              <div className="font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                {highlightMatches(regexState.testString, regexState.matches)}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-dark-400 text-center py-8">
                Enter a test string to see matches highlighted
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Details */}
      {regexState.matches.length > 0 && (
        <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            Match Details
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {regexState.matches.map((match, index) => (
              <div key={index} className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-300">
                    Match {index + 1}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-dark-400">
                    Position: {match.index}-{match.index + match.match.length}
                  </span>
                </div>
                <div className="font-mono text-sm">
                  <div className="text-gray-900 dark:text-white">
                    <strong>Full Match:</strong> "{match.match}"
                  </div>
                  {match.groups.length > 0 && (
                    <div className="text-gray-700 dark:text-dark-300 mt-1">
                      <strong>Groups:</strong> {match.groups.map((group, i) => (
                        <span key={i} className="ml-2">
                          ${i + 1}: "{group || ''}"
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(match.namedGroups).length > 0 && (
                    <div className="text-gray-700 dark:text-dark-300 mt-1">
                      <strong>Named Groups:</strong> {Object.entries(match.namedGroups).map(([name, value]) => (
                        <span key={name} className="ml-2">
                          {name}: "{value || ''}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default RegexLab
