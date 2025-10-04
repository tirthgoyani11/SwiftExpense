import React, { useState } from 'react'
import { Eye, EyeOff, Building2, Mail, Lock, User, Globe, Briefcase } from 'lucide-react'
import '../styles/odoo-auth.css'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface SignupFormData {
  fullName: string
  email: string
  password: string
  companyName: string
  country: string
  role: string
}

interface FormErrors {
  [key: string]: string
}

const countries = [
  { value: '', label: 'Select Country' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'SG', label: 'Singapore' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'CH', label: 'Switzerland' },
]

const roles = [
  { value: '', label: 'Select Role' },
  { value: 'CEO', label: 'CEO / Founder' },
  { value: 'Director', label: 'Director' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Team Lead', label: 'Team Lead' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Accountant', label: 'Accountant' },
  { value: 'HR', label: 'HR Specialist' },
]

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [signupData, setSignupData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    country: '',
    role: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!loginData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSignupForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!signupData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (signupData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!signupData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(signupData.password)) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (!signupData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!signupData.country) {
      newErrors.country = 'Country is required'
    }

    if (!signupData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateLoginForm()) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        console.log('Login data:', loginData)
        // Add your login logic here
      }, 1500)
    }
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateSignupForm()) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        console.log('Signup data:', signupData)
        // Add your signup logic here
      }, 1500)
    }
  }

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab)
    setErrors({})
    setShowPassword(false)
  }

  return (
    <div className="odoo-auth-page">
        {/* Animated Bubbles Background */}
        <div className="bubbles-container">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>

        {/* Blur Overlay */}
        <div className="blur-overlay"></div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="auth-logo">
              <Building2 className="auth-logo-icon" />
              <h1>SwiftExpense</h1>
            </div>
            <p className="auth-subtitle">Enterprise Expense Management Platform</p>
          </div>

          {/* Tab Navigation */}
          <div className="odoo-tabs">
            <button
              className={`odoo-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>
            <button
              className={`odoo-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your corporate email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="checkbox-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  Keep me signed in
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="odoo-button" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  />
                </div>
                {errors.fullName && <div className="error-message">{errors.fullName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your corporate email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a secure password (8+ characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.companyName ? 'error' : ''}`}
                    placeholder="Enter your company name"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                  />
                </div>
                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-wrapper">
                  <Globe className="input-icon" />
                  <select
                    className={`form-select ${errors.country ? 'error' : ''}`}
                    value={signupData.country}
                    onChange={(e) => setSignupData({ ...signupData, country: e.target.value })}
                  >
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country && <div className="error-message">{errors.country}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Job Role</label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon" />
                  <select
                    className={`form-select ${errors.role ? 'error' : ''}`}
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && <div className="error-message">{errors.role}</div>}
              </div>

              <button type="submit" className="odoo-button" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login