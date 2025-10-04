import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="mx-auto h-20 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <SparklesIcon className="h-12 w-12 text-white" />
        </div>
        <h2 className="mt-8 text-center text-4xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-lg text-gray-600">
          Sign in to your SwiftExpense account
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white/80 backdrop-blur-lg py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Email address
              </label>
              <div className="mt-2">
                <input
                  {...register('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 backdrop-blur-sm transition-all"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  {...register('password')}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 pr-12 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 backdrop-blur-sm transition-all"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 hover:bg-gray-100 rounded-full p-1 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full justify-center items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 text-sm font-bold text-white shadow-2xl hover:from-indigo-500 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing you in...
                  </div>
                ) : (
                  <>
                    Sign in to SwiftExpense
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm font-bold">
                <span className="bg-white px-4 py-1 rounded-full text-gray-500 shadow-sm">Try Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@company.com', 'password123')}
                className="group flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 text-sm font-semibold text-red-700 hover:from-red-100 hover:to-pink-100 border border-red-200 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <span>Admin Demo</span>
                </div>
                <div className="text-xs text-red-500 opacity-60">Full Access</div>
              </button>
              
              <button
                type="button"
                onClick={() => fillDemoCredentials('manager@company.com', 'password123')}
                className="group flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <span>Manager Demo</span>
                </div>
                <div className="text-xs text-blue-500 opacity-60">Approver</div>
              </button>
              
              <button
                type="button"
                onClick={() => fillDemoCredentials('employee@company.com', 'password123')}
                className="group flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-sm font-semibold text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span>Employee Demo</span>
                </div>
                <div className="text-xs text-green-500 opacity-60">Standard User</div>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create your account →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          © 2025 SwiftExpense. Built with React & TypeScript.
        </p>
      </div>
    </div>
  );
}