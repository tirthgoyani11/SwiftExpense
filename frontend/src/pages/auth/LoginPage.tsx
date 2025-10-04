import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import type { LoginCredentials } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data as LoginCredentials);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-odoo-primary/10 to-odoo-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-odoo-primary rounded-xl flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H4.5m2.25 0v3m0 0v.375c0 .621.504 1.125 1.125 1.125h.75m0 0H9m-7.5-7.5h.375c.621 0 1.125.504 1.125 1.125v.375m1.5-1.5H5.625c.621 0 1.125.504 1.125 1.125v.375m0 0v6.75V9m1.5-4.125C7.125 4.504 7.629 4 8.25 4h1.875c.621 0 1.125.504 1.125 1.125v.375M9 9l.375.375" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-odoo-gray-700">Welcome back</h2>
          <p className="mt-2 text-sm text-odoo-gray-500">
            Sign in to your SwiftExpense account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-odoo-lg rounded-odoo border border-odoo-border">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="appearance-none relative block w-full px-3 py-3 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-odoo-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-odoo-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-odoo-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-odoo-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-odoo-primary focus:ring-odoo-primary border-odoo-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-odoo-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-odoo-primary hover:text-odoo-primary-dark transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-odoo-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-odoo-primary hover:text-odoo-primary-dark transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-odoo-info/10 border border-odoo-info/20 rounded-odoo p-4">
          <p className="text-sm text-odoo-info font-medium mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-odoo-info">
            <p><strong>Admin:</strong> admin@company.com / password123</p>
            <p><strong>Manager:</strong> manager@company.com / password123</p>
            <p><strong>Employee:</strong> employee@company.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}