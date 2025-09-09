import { create } from 'zustand'

const useStore = create((set, get) => ({
  // App State
  currentTool: 'home',
  darkMode: true,
  
  // Tool States
  tools: {
    jsonify: {
      input: '',
      output: '',
      indent: 2,
      isValid: null,
      stats: null,
      viewMode: 'text' // 'text', 'visual', 'graph', 'split'
    },
    regexlab: {
      pattern: '',
      testString: '',
      flags: 'g',
      matches: [],
      explanation: ''
    },
    tokenpeek: {
      token: '',
      decoded: null,
      isValid: null
    },
    hashhub: {
      input: '',
      algorithm: 'sha256',
      output: ''
    },
    apibox: {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      response: null,
      loading: false
    },
    colorly: {
      imageData: null,
      colors: [],
      selectedColor: null
    },
    markee: {
      markdown: '# Welcome to Markee\n\nStart writing your markdown here...',
      preview: ''
    },
    queryforge: {
      userRequest: '',
      schema: '',
      dbType: 'MySQL',
      generatedQuery: '',
      explanation: '',
      optimizedQuery: '',
      apiKey: '',
      isLoading: false,
      error: null,
      history: []
    }
  },
  
  // Actions
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  updateTool: (toolName, updates) => set((state) => ({
    tools: {
      ...state.tools,
      [toolName]: {
        ...state.tools[toolName],
        ...updates
      }
    }
  })),
  
  resetTool: (toolName) => set((state) => {
    const initialStates = {
      jsonify: {
        input: '',
        output: '',
        indent: 2,
        isValid: null,
        stats: null
      },
      regexlab: {
        pattern: '',
        testString: '',
        flags: 'g',
        matches: [],
        explanation: ''
      },
      tokenpeek: {
        token: '',
        decoded: null,
        isValid: null
      },
      hashhub: {
        input: '',
        algorithm: 'sha256',
        output: ''
      },
      apibox: {
        method: 'GET',
        url: '',
        headers: {},
        body: '',
        response: null,
        loading: false
      },
      colorly: {
        imageData: null,
        colors: [],
        selectedColor: null
      },
      markee: {
        markdown: '# Welcome to Markee\n\nStart writing your markdown here...',
        preview: ''
      }
    }
    
    return {
      tools: {
        ...state.tools,
        [toolName]: initialStates[toolName]
      }
    }
  }),
  
  // Notifications
  notifications: [],
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        id: Date.now().toString(),
        type: 'info',
        ...notification,
        timestamp: new Date()
      }
    ]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] })
}))

export default useStore
