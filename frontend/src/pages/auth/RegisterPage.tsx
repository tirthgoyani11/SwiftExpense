import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import type { RegisterData } from '../../types';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  companyId: z.string().min(1, 'Company selection is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterData);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125L9.375 3C8.339 2.75 7.259 2.75 6.223 3L2.625 4.125C1.875 4.375 1.5 5.125 1.5 5.875v6.75c0 .75.375 1.5 1.125 1.75l3.598 1.125c1.036.25 2.116.25 3.153 0l3.598-1.125c.75-.25 1.125-1 1.125-1.75V5.875c0-.75-.375-1.5-1.125-1.75z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-odoo-gray-700">Create Account</h2>
          <p className="mt-2 text-sm text-odoo-gray-500">
            Join SwiftExpense and manage your expenses
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white py-8 px-6 shadow-odoo-lg rounded-odoo border border-odoo-border">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  className="appearance-none relative block w-full px-3 py-3 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-odoo-danger">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  className="appearance-none relative block w-full px-3 py-3 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-odoo-danger">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            {/* Company Selection */}
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                Company
              </label>
              <select
                {...register('companyId')}
                className="appearance-none relative block w-full px-3 py-3 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
              >
                <option value="">Select your company</option>
                <option value="cm2p8t5ny0001kwq8i8u0a8jz">Acme Corporation</option>
                <option value="cm2p8t5ny0002kwq8r9s1b7ks">TechStart Inc</option>
                <option value="cm2p8t5ny0003kwq8m5f2c6nt">Global Enterprises</option>
              </select>
              {errors.companyId && (
                <p className="mt-1 text-sm text-odoo-danger">{errors.companyId.message}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="appearance-none relative block w-full px-3 py-3 pr-10 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                    placeholder="Enter password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-odoo-gray-600 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="appearance-none relative block w-full px-3 py-3 pr-10 border border-odoo-border placeholder-odoo-gray-400 text-odoo-gray-700 rounded-odoo focus:outline-none focus:ring-2 focus:ring-odoo-primary focus:border-odoo-primary focus:z-10 sm:text-sm transition-colors"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-odoo-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-odoo-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-odoo-danger">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-odoo-primary focus:ring-odoo-primary border-odoo-border rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-odoo-gray-600">
                I agree to the{' '}
                <a href="#" className="text-odoo-primary hover:text-odoo-primary-dark">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-odoo-primary hover:text-odoo-primary-dark">
                  Privacy Policy
                </a>
              </label>
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-odoo-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-odoo-primary hover:text-odoo-primary-dark transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}