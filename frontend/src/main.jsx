import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import { AuthProvider } from './hooks/useAuth'

import './index.css'
// Global styles for form controls and shared components
import './components/LoginPage.css'
import './components/SignupPage.css'

console.log('Main.jsx loaded')
const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
  console.log('React app rendered')
} else {
  console.error('Root element not found!')
}
