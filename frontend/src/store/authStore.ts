import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import type { AuthState, LoginCredentials, RegisterData, User } from '../types';
import { toast } from 'react-hot-toast';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          const response = await apiClient.post<{
            token: string;
            user: User;
            message: string;
          }>('/auth/login', credentials);

          const { token, user } = response;
          
          // Store in localStorage for persistence
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
          });

          toast.success('Login successful!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await apiClient.post<{
            token: string;
            user: User;
            message: string;
          }>('/auth/register', data);

          const { token, user } = response;
          
          // Store in localStorage for persistence
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
          });

          toast.success('Registration successful!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        toast.success('Logged out successfully!');
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await apiClient.put<{ user: User }>('/auth/profile', data);
          const { user } = response;

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(user));

          set({ user });
          toast.success('Profile updated successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state from localStorage on app start
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Call on module load
initializeAuth();