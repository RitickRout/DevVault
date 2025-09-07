import React, { useState, useEffect } from 'react'
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
  DocumentTextIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon
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
  { name: 'QueryForge', href: '/queryforge', icon: SparklesIcon, description: 'AI SQL Generator' },
]

const Navigation = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-lg"
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-dark-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-dark-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={clsx(
        'bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 overflow-y-auto transition-all duration-300 ease-in-out z-40',
        'lg:static lg:translate-x-0 lg:w-64',
        isMobile ? 'fixed top-0 left-0 h-full w-80 max-w-[80vw]' : 'w-64 h-screen sticky top-16',
        isMobile && isMobileMenuOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''
      )}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">DevVault</h2>
              <p className="text-xs text-gray-500 dark:text-dark-400">Developer Toolkit</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="space-y-1">
          {tools.map((tool) => {
            const isActive = location.pathname === tool.href
            return (
              <Link
                key={tool.name}
                to={tool.href}
                className={clsx(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-dark-100'
                )}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <tool.icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
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
    </>
  )
}

export default Navigation
