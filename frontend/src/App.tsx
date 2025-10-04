import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

// Layout
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages
import Dashboard from '@/pages/Dashboard'
import ExpenseForm from '@/pages/ExpenseForm'
import ExpenseList from '@/pages/ExpenseList'
import Approvals from '@/pages/Approvals'
import Analytics from '@/pages/Analytics'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'

// Hooks
import { useAuthStore } from '@/store/authStore'

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore()

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Initialize authentication
    initializeAuth()

    return () => {
      lenis.destroy()
    }
  }, [initializeAuth])

  if (!isAuthenticated) {
    return (
      <>
        <AuthLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </AuthLayout>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </>
  )
}

export default App