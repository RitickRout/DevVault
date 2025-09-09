import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const JSONGraphViewer = ({ data, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))
  const [selectedNode, setSelectedNode] = useState(null)
  const containerRef = useRef(null)

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  const getNodeStyle = (value, isSelected = false) => {
    let baseStyle = "relative inline-block px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md "
    
    if (isSelected) {
      baseStyle += "ring-2 ring-primary-500 ring-offset-2 "
    }

    if (value === null) {
      return baseStyle + "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
    }
    if (typeof value === 'string') {
      return baseStyle + "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300"
    }
    if (typeof value === 'number') {
      return baseStyle + "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
    }
    if (typeof value === 'boolean') {
      return baseStyle + "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
    }
    if (Array.isArray(value)) {
      return baseStyle + "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300"
    }
    if (typeof value === 'object') {
      return baseStyle + "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300"
    }
    return baseStyle + "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
  }

  const getValueDisplay = (value) => {
    if (value === null) return 'null'
    if (typeof value === 'string') return `"${value.length > 20 ? value.substring(0, 20) + '...' : value}"`
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return `Array[${value.length}]`
    if (typeof value === 'object') return `Object{${Object.keys(value).length}}`
    return String(value)
  }

  const renderGraphNode = (value, path, key = null, level = 0, parentPath = null) => {
    const isExpandable = (typeof value === 'object' && value !== null)
    const isExpanded = expandedNodes.has(path)
    const isSelected = selectedNode === path
    const nodeId = `node-${path.replace(/\./g, '-')}`

    return (
      <div key={path} className="relative flex flex-col items-center">
        {/* Connection Line to Parent */}
        {parentPath && level > 0 && (
          <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-gray-400 dark:bg-gray-500 transform -translate-x-1/2 z-0"></div>
        )}

        {/* Node */}
        <div className="relative z-10 mb-8">
          <div
            id={nodeId}
            className={getNodeStyle(value, isSelected)}
            onClick={() => {
              setSelectedNode(isSelected ? null : path)
              if (isExpandable) {
                toggleNode(path)
              }
            }}
          >
            <div className="flex items-center space-x-2">
              {/* Expand/Collapse Icon */}
              {isExpandable && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </div>
              )}

              {/* Key Label */}
              {key !== null && (
                <span className="font-semibold text-sm">
                  {typeof key === 'number' ? `[${key}]` : key}:
                </span>
              )}

              {/* Value */}
              <span className="text-sm font-mono">
                {getValueDisplay(value)}
              </span>
            </div>
          </div>
        </div>

        {/* Children */}
        {isExpandable && isExpanded && (
          <div className="relative">
            {/* Vertical line down from parent */}
            <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gray-400 dark:bg-gray-500 transform -translate-x-1/2 z-0"></div>

            {/* Horizontal connector line */}
            {(Array.isArray(value) ? value.length : Object.keys(value).length) > 1 && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400 dark:bg-gray-500 z-0"></div>
            )}

            <div className="flex flex-wrap justify-center gap-12 pt-4">
              {Array.isArray(value) ? (
                value.map((item, index) => (
                  <div key={index} className="relative">
                    {/* Vertical line to child */}
                    <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-gray-400 dark:bg-gray-500 transform -translate-x-1/2 z-0"></div>
                    {renderGraphNode(item, `${path}.${index}`, index, level + 1, path)}
                  </div>
                ))
              ) : (
                Object.entries(value).map(([objKey, objValue]) => (
                  <div key={objKey} className="relative">
                    {/* Vertical line to child */}
                    <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-gray-400 dark:bg-gray-500 transform -translate-x-1/2 z-0"></div>
                    {renderGraphNode(objValue, `${path}.${objKey}`, objKey, level + 1, path)}
                  </div>
                ))
              )}
            </div>
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
          <div className="text-4xl mb-4">🌳</div>
          <p className="text-lg font-medium">No valid JSON to visualize</p>
          <p className="text-sm mt-2">Enter valid JSON to see the interactive graph</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full overflow-auto ${className}`} ref={containerRef}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              JSON Graph Visualization
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click nodes to expand/collapse • Click again to select/deselect
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedNodes(new Set(['root']))}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
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
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
            >
              Expand All
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-900 rounded-xl p-12 min-h-96 overflow-auto">
          <div className="flex justify-center items-start">
            <div className="min-w-max">
              {renderGraphNode(parsedData, 'root')}
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-6 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Selected Node Details</h5>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Path:</strong> {selectedNode}</p>
              <p><strong>Type:</strong> {typeof parsedData === 'object' ? 'object' : typeof parsedData}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JSONGraphViewer
