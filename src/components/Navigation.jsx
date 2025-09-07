import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  HashtagIcon,
  GlobeAltIcon,
  CommandLineIcon,
  SwatchIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const tools = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'JSONify', href: '/jsonify', icon: CodeBracketIcon, description: 'JSON Formatter' },
  { name: 'RegexLab', href: '/regexlab', icon: MagnifyingGlassIcon, description: 'Regex Tester' },
  { name: 'TokenPeek', href: '/tokenpeek', icon: KeyIcon, description: 'JWT Debugger' },
  { name: 'HashHub', href: '/hashhub', icon: HashtagIcon, description: 'Hash Generator' },
  { name: 'APIBox', href: '/apibox', icon: GlobeAltIcon, description: 'API Tester' },
  { name: 'GitWizard', href: '/gitwizard', icon: CommandLineIcon, description: 'Git Commands' },
  { name: 'Colorly', href: '/colorly', icon: SwatchIcon, description: 'Color Tools' },
  { name: 'Markee', href: '/markee', icon: DocumentTextIcon, description: 'Markdown Editor' },
]

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-1">
          {tools.map((tool) => {
            const isActive = location.pathname === tool.href
            return (
              <Link
                key={tool.name}
                to={tool.href}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-dark-100'
                )}
              >
                <tool.icon 
                  className={clsx(
                    'mr-3 h-5 w-5',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-dark-400 group-hover:text-gray-700 dark:group-hover:text-dark-200'
                  )}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{tool.name}</div>
                  {tool.description && (
                    <div className="text-xs text-gray-500 dark:text-dark-400">
                      {tool.description}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
