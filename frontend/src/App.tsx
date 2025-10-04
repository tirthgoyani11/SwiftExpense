import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/NewLoginPage';
import RegisterPage from './pages/auth/NewSignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import './App.css'

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryProvider>
      <Router>
        <div className="min-h-screen bg-odoo-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard/*"
              element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
              <Route index element={<Dashboard />} />
            </Route>
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#343A40',
              border: '1px solid #E9ECEF',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#28A745',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC3545',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </Router>
    </QueryProvider>
  )
}

export default App
