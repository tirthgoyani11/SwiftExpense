import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, LoginFormData, RegisterFormData, User } from '@/types'
import { authService } from '@/services/authService'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (credentials: LoginFormData) => {
        try {
          const response = await authService.login(credentials)
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },

      register: async (data: RegisterFormData) => {
        try {
          const response = await authService.register(data)
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      initializeAuth: () => {
        const token = localStorage.getItem('auth-token')
        if (token) {
          // Verify token and get user data
          authService.verifyToken(token)
            .then((user: User) => {
              set({
                user,
                token,
                isAuthenticated: true,
              })
            })
            .catch(() => {
              // Token invalid, clear auth
              get().logout()
            })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
)