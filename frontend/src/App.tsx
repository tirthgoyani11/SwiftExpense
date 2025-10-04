import { useEffect } from 'react'
import { useAuthStore } from './store/auth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    // The auth store will automatically load from localStorage
    // due to the persist middleware
  }, [])

  if (!isAuthenticated || !user) {
    return <AuthPage />
  }

  return <Dashboard />
}

export default App
