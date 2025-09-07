import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import JSONify from './pages/JSONify'
import RegexLab from './pages/RegexLab'
import TokenPeek from './pages/TokenPeek'
import HashHub from './pages/HashHub'
import APIBox from './pages/APIBox'
import GitWizard from './pages/GitWizard'
import Colorly from './pages/Colorly'
import Markee from './pages/Markee'
import NotificationContainer from './components/NotificationContainer'
import './App.css'

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
    <Router>
      <div className="h-screen w-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Navigation />

          <main className="flex-1 p-6 overflow-auto">
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        
        <NotificationContainer />
      </div>
    </Router>
  )
}

export default App
