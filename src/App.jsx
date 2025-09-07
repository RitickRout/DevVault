import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import useStore from './store/useStore'
import Header from './components/Header'
import Navigation from './components/Navigation'
import NotificationContainer from './components/NotificationContainer'
import './App.css'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const JSONify = lazy(() => import('./pages/JSONify'))
const RegexLab = lazy(() => import('./pages/RegexLab'))
const TokenPeek = lazy(() => import('./pages/TokenPeek'))
const HashHub = lazy(() => import('./pages/HashHub'))
const APIBox = lazy(() => import('./pages/APIBox'))
const GitWizard = lazy(() => import('./pages/GitWizard'))
const Colorly = lazy(() => import('./pages/Colorly'))
const Markee = lazy(() => import('./pages/Markee'))
const QueryForge = lazy(() => import('./pages/QueryForge'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

function App() {
  const { darkMode } = useStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <HelmetProvider>
      <Router>
        <div className="h-screen w-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Navigation />

          <main className="flex-1 p-4 sm:p-6 overflow-auto lg:ml-0">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jsonify" element={<JSONify />} />
                <Route path="/regexlab" element={<RegexLab />} />
                <Route path="/tokenpeek" element={<TokenPeek />} />
                <Route path="/hashhub" element={<HashHub />} />
                <Route path="/apibox" element={<APIBox />} />
                <Route path="/gitwizard" element={<GitWizard />} />
                <Route path="/colorly" element={<Colorly />} />
                <Route path="/markee" element={<Markee />} />
                <Route path="/queryforge" element={<QueryForge />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        
          <NotificationContainer />
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App
