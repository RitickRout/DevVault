import React, { useState, useMemo } from 'react'
import { CommandLineIcon, MagnifyingGlassIcon, DocumentDuplicateIcon, TagIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'

const GitWizard = () => {
  const { addNotification } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const gitCommands = [
    // Basic Commands
    {
      category: 'basic',
      command: 'git init',
      description: 'Initialize a new Git repository',
      example: 'git init',
      tags: ['initialize', 'new', 'repository']
    },
    {
      category: 'basic',
      command: 'git clone',
      description: 'Clone a repository from remote',
      example: 'git clone https://github.com/user/repo.git',
      tags: ['clone', 'download', 'remote']
    },
    {
      category: 'basic',
      command: 'git status',
      description: 'Show the working tree status',
      example: 'git status',
      tags: ['status', 'changes', 'working tree']
    },
    {
      category: 'basic',
      command: 'git add',
      description: 'Add file contents to the index',
      example: 'git add . # Add all files\ngit add file.txt # Add specific file',
      tags: ['add', 'stage', 'index']
    },
    {
      category: 'basic',
      command: 'git commit',
      description: 'Record changes to the repository',
      example: 'git commit -m "Your commit message"\ngit commit -am "Add and commit"',
      tags: ['commit', 'save', 'record']
    },
    {
      category: 'basic',
      command: 'git push',
      description: 'Update remote refs along with associated objects',
      example: 'git push origin main\ngit push -u origin feature-branch',
      tags: ['push', 'upload', 'remote']
    },
    {
      category: 'basic',
      command: 'git pull',
      description: 'Fetch from and integrate with another repository',
      example: 'git pull origin main\ngit pull --rebase',
      tags: ['pull', 'fetch', 'merge']
    },

    // Branching
    {
      category: 'branching',
      command: 'git branch',
      description: 'List, create, or delete branches',
      example: 'git branch # List branches\ngit branch new-feature # Create branch\ngit branch -d old-branch # Delete branch',
      tags: ['branch', 'list', 'create', 'delete']
    },
    {
      category: 'branching',
      command: 'git checkout',
      description: 'Switch branches or restore working tree files',
      example: 'git checkout main\ngit checkout -b new-feature\ngit checkout -- file.txt',
      tags: ['checkout', 'switch', 'restore']
    },
    {
      category: 'branching',
      command: 'git switch',
      description: 'Switch branches (newer alternative to checkout)',
      example: 'git switch main\ngit switch -c new-feature',
      tags: ['switch', 'branch', 'new']
    },
    {
      category: 'branching',
      command: 'git merge',
      description: 'Join two or more development histories together',
      example: 'git merge feature-branch\ngit merge --no-ff feature-branch',
      tags: ['merge', 'combine', 'join']
    },

    // History
    {
      category: 'history',
      command: 'git log',
      description: 'Show commit logs',
      example: 'git log\ngit log --oneline\ngit log --graph --all',
      tags: ['log', 'history', 'commits']
    },
    {
      category: 'history',
      command: 'git diff',
      description: 'Show changes between commits, commit and working tree, etc',
      example: 'git diff\ngit diff HEAD~1\ngit diff branch1..branch2',
      tags: ['diff', 'changes', 'compare']
    },
    {
      category: 'history',
      command: 'git show',
      description: 'Show various types of objects',
      example: 'git show HEAD\ngit show commit-hash',
      tags: ['show', 'commit', 'details']
    },

    // Remote
    {
      category: 'remote',
      command: 'git remote',
      description: 'Manage set of tracked repositories',
      example: 'git remote -v\ngit remote add origin url\ngit remote remove origin',
      tags: ['remote', 'repository', 'manage']
    },
    {
      category: 'remote',
      command: 'git fetch',
      description: 'Download objects and refs from another repository',
      example: 'git fetch origin\ngit fetch --all',
      tags: ['fetch', 'download', 'remote']
    },

    // Undoing
    {
      category: 'undoing',
      command: 'git reset',
      description: 'Reset current HEAD to the specified state',
      example: 'git reset HEAD~1\ngit reset --hard HEAD~1\ngit reset --soft HEAD~1',
      tags: ['reset', 'undo', 'head']
    },
    {
      category: 'undoing',
      command: 'git revert',
      description: 'Revert some existing commits',
      example: 'git revert HEAD\ngit revert commit-hash',
      tags: ['revert', 'undo', 'commit']
    },
    {
      category: 'undoing',
      command: 'git restore',
      description: 'Restore working tree files',
      example: 'git restore file.txt\ngit restore --staged file.txt',
      tags: ['restore', 'undo', 'working tree']
    },

    // Stashing
    {
      category: 'stashing',
      command: 'git stash',
      description: 'Stash the changes in a dirty working directory away',
      example: 'git stash\ngit stash push -m "message"\ngit stash pop\ngit stash list',
      tags: ['stash', 'save', 'temporary']
    },

    // Configuration
    {
      category: 'config',
      command: 'git config',
      description: 'Get and set repository or global options',
      example: 'git config --global user.name "Your Name"\ngit config --global user.email "email@example.com"',
      tags: ['config', 'settings', 'user']
    }
  ]

  const categories = [
    { value: 'all', name: 'All Commands', color: 'bg-gray-500' },
    { value: 'basic', name: 'Basic', color: 'bg-blue-500' },
    { value: 'branching', name: 'Branching', color: 'bg-green-500' },
    { value: 'history', name: 'History', color: 'bg-purple-500' },
    { value: 'remote', name: 'Remote', color: 'bg-orange-500' },
    { value: 'undoing', name: 'Undoing', color: 'bg-red-500' },
    { value: 'stashing', name: 'Stashing', color: 'bg-yellow-500' },
    { value: 'config', name: 'Config', color: 'bg-indigo-500' }
  ]

  const filteredCommands = useMemo(() => {
    return gitCommands.filter(cmd => {
      const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory
      const matchesSearch = searchTerm === '' ||
        cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory])

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addNotification('Command copied to clipboard!', 'success')
    } catch (error) {
      addNotification('Failed to copy to clipboard', 'error')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <CommandLineIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          GitWizard
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Searchable Git commands cheatsheet with examples and explanations
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search commands, descriptions, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? `${category.color} text-white`
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-dark-400">
          Showing {filteredCommands.length} of {gitCommands.length} commands
        </div>
      </div>

      {/* Commands List */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCommands.map((cmd, index) => {
            const category = categories.find(c => c.value === cmd.category)
            return (
              <div
                key={index}
                className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-900 rounded text-sm font-mono text-primary-600 dark:text-primary-400">
                      {cmd.command}
                    </code>
                    <span className={`px-2 py-1 rounded text-xs text-white ${category?.color || 'bg-gray-500'}`}>
                      {category?.name || cmd.category}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cmd.command)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy command"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-700 dark:text-dark-300 text-sm mb-3">
                  {cmd.description}
                </p>

                <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3 mb-3">
                  <h4 className="text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">Example:</h4>
                  <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                    {cmd.example}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cmd.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400 text-xs rounded"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center py-12">
            <CommandLineIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Commands Found</h3>
            <p className="text-gray-600 dark:text-dark-400 max-w-md mx-auto">
              Try adjusting your search terms or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GitWizard
