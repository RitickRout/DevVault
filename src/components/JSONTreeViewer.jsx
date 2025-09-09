import React, { useState, useMemo } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const JSONTreeViewer = ({ data, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  const getTypeColor = (value) => {
    if (value === null) return 'text-gray-500 dark:text-gray-400'
    if (typeof value === 'string') return 'text-green-600 dark:text-green-400'
    if (typeof value === 'number') return 'text-blue-600 dark:text-blue-400'
    if (typeof value === 'boolean') return 'text-purple-600 dark:text-purple-400'
    if (Array.isArray(value)) return 'text-orange-600 dark:text-orange-400'
    if (typeof value === 'object') return 'text-indigo-600 dark:text-indigo-400'
    return 'text-gray-600 dark:text-gray-300'
  }

  const getTypeBadge = (value) => {
    if (value === null) return 'null'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return `array[${value.length}]`
    if (typeof value === 'object') return `object{${Object.keys(value).length}}`
    return 'unknown'
  }

  const renderValue = (value, path, key = null, level = 0) => {
    const isExpandable = (typeof value === 'object' && value !== null)
    const isExpanded = expandedNodes.has(path)
    const hasKey = key !== null

    return (
      <div key={path} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
            level > 0 ? 'ml-4' : ''
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          {/* Expand/Collapse Button */}
          {isExpandable && (
            <button
              onClick={() => toggleNode(path)}
              className="mr-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
          
          {/* Key */}
          {hasKey && (
            <span className="text-gray-800 dark:text-gray-200 font-medium mr-2">
              "{key}":
            </span>
          )}
          
          {/* Value or Type Badge */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-600 ${getTypeColor(value)}`}>
              {getTypeBadge(value)}
            </span>
            
            {!isExpandable && (
              <span className={`font-mono text-sm ${getTypeColor(value)}`}>
                {typeof value === 'string' ? `"${value}"` : String(value)}
              </span>
            )}
          </div>
        </div>

        {/* Nested Content */}
        {isExpandable && isExpanded && (
          <div className="border-l-2 border-gray-200 dark:border-dark-600 ml-2">
            {Array.isArray(value) ? (
              value.map((item, index) => 
                renderValue(item, `${path}.${index}`, index, level + 1)
              )
            ) : (
              Object.entries(value).map(([objKey, objValue]) =>
                renderValue(objValue, `${path}.${objKey}`, objKey, level + 1)
              )
            )}
          </div>
        )}
      </div>
    )
  }

  const parsedData = useMemo(() => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return null
    }
  }, [data])

  if (!parsedData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg mb-2">📄</div>
          <p>No valid JSON to display</p>
          <p className="text-sm mt-1">Enter valid JSON to see the visual tree</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full overflow-auto ${className}`}>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            JSON Tree Structure
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedNodes(new Set(['root']))}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
            >
              Collapse All
            </button>
            <button
              onClick={() => {
                const allPaths = new Set(['root'])
                const addPaths = (obj, currentPath) => {
                  if (typeof obj === 'object' && obj !== null) {
                    if (Array.isArray(obj)) {
                      obj.forEach((_, index) => {
                        const path = `${currentPath}.${index}`
                        allPaths.add(path)
                        addPaths(obj[index], path)
                      })
                    } else {
                      Object.keys(obj).forEach(key => {
                        const path = `${currentPath}.${key}`
                        allPaths.add(path)
                        addPaths(obj[key], path)
                      })
                    }
                  }
                }
                addPaths(parsedData, 'root')
                setExpandedNodes(allPaths)
              }}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
            >
              Expand All
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3">
          {renderValue(parsedData, 'root')}
        </div>
      </div>
    </div>
  )
}

export default JSONTreeViewer
