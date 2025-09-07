import React from 'react'
import { Link } from 'react-router-dom'
import {
  CodeBracketIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  HashtagIcon,
  GlobeAltIcon,
  CommandLineIcon,
  SwatchIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import SEO from '../components/SEO'

const tools = [
  { 
    name: 'JSONify', 
    href: '/jsonify', 
    icon: CodeBracketIcon, 
    description: 'Format, validate, and prettify JSON data',
    color: 'bg-blue-500'
  },
  { 
    name: 'RegexLab', 
    href: '/regexlab', 
    icon: MagnifyingGlassIcon, 
    description: 'Test and experiment with regular expressions',
    color: 'bg-green-500'
  },
  { 
    name: 'TokenPeek', 
    href: '/tokenpeek', 
    icon: KeyIcon, 
    description: 'Decode and debug JWT tokens',
    color: 'bg-purple-500'
  },
  { 
    name: 'HashHub', 
    href: '/hashhub', 
    icon: HashtagIcon, 
    description: 'Generate UUIDs and hash strings',
    color: 'bg-orange-500'
  },
  { 
    name: 'APIBox', 
    href: '/apibox', 
    icon: GlobeAltIcon, 
    description: 'Test and build API requests',
    color: 'bg-red-500'
  },
  { 
    name: 'GitWizard', 
    href: '/gitwizard', 
    icon: CommandLineIcon, 
    description: 'Git commands cheatsheet and reference',
    color: 'bg-yellow-500'
  },
  { 
    name: 'Colorly', 
    href: '/colorly', 
    icon: SwatchIcon, 
    description: 'Color palette extraction and conversion',
    color: 'bg-pink-500'
  },
  {
    name: 'Markee',
    href: '/markee',
    icon: DocumentTextIcon,
    description: 'Live Markdown editor and previewer',
    color: 'bg-indigo-500'
  },
  {
    name: 'QueryForge',
    href: '/queryforge',
    icon: SparklesIcon,
    description: 'AI-powered SQL query generator using Gemini',
    color: 'bg-purple-500'
  },
]

const Home = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DevVault",
    "description": "Free online developer toolkit with 8 essential tools for developers",
    "url": "https://devvault.dev",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "JSON Formatter and Validator",
      "Regular Expression Tester",
      "JWT Token Decoder",
      "Hash Generator",
      "API Request Builder",
      "Git Commands Cheatsheet",
      "Color Palette Extractor",
      "Markdown Editor",
      "AI-powered SQL Query Generator"
    ]
  }

  return (
    <>
      <SEO
        title="Free Developer Toolkit"
        description="Free online developer toolkit with 8 essential tools: JSON formatter, Regex tester, JWT decoder, Hash generator, API tester, Git commands, Color tools, and Markdown editor. No signup required!"
        keywords="developer tools, JSON formatter, regex tester, JWT decoder, hash generator, API tester, git commands, color tools, markdown editor, free developer toolkit"
        canonical="/"
        structuredData={structuredData}
      />
      <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
            DevVault
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
          Your comprehensive developer toolkit with 8 essential utilities.
          Built with modern web technologies for the best developer experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.href}
            className="group relative bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-dark-400 mt-2">
                {tool.description}
              </p>
              
              <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300">
                Try it out
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </>
  )
}

export default Home
