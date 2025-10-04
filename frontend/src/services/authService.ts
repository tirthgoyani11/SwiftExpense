import axios from 'axios'
import { User, LoginFormData, RegisterFormData, ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed')
    }

    const { token } = response.data.data
    localStorage.setItem('auth-token', token)
    
    return response.data.data
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed')
    }

    const { token } = response.data.data
    localStorage.setItem('auth-token', token)
    
    return response.data.data
  },

  async verifyToken(token: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!response.data.success || !response.data.data) {
      throw new Error('Token verification failed')
    }
    
    return response.data.data
  },

  async refreshToken(): Promise<string> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh')
    
    if (!response.data.success || !response.data.data) {
      throw new Error('Token refresh failed')
    }
    
    const { token } = response.data.data
    localStorage.setItem('auth-token', token)
    
    return token
  },

  logout(): void {
    localStorage.removeItem('auth-token')
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Profile update failed')
    }
    
    return response.data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed')
    }
  },
}

export { api }