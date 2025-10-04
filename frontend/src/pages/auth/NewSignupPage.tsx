import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  companyId: z.string().min(1, 'Please select a company'),
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const companies = [
  'Acme Corporation',
  'Tech Solutions Inc',
  'Global Enterprises',
  'Innovation Labs',
  'Digital Dynamics',
  'Future Systems',
  'Other'
];

const passwordRequirements = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'One uppercase letter', regex: /[A-Z]/ },
  { label: 'One lowercase letter', regex: /[a-z]/ },
  { label: 'One number', regex: /\d/ },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register: registerUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        companyId: data.companyId,
      });
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'email']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="mx-auto h-20 w-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <UserPlusIcon className="h-12 w-12 text-white" />
        </div>
        <h2 className="mt-8 text-center text-4xl font-bold tracking-tight text-gray-900">
          Join SwiftExpense
        </h2>
        <p className="mt-3 text-center text-lg text-gray-600">
          Create your account to start managing expenses
        </p>
        
        {/* Progress indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white/80 backdrop-blur-lg py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-700">
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('firstName')}
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        placeholder="John"
                        className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-700">
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('lastName')}
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        placeholder="Doe"
                        className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

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
                      placeholder="john.doe@company.com"
                      className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
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
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex w-full justify-center items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-sm font-bold text-white shadow-2xl hover:from-emerald-500 hover:to-teal-500 transition-all transform hover:scale-105"
                  >
                    Continue to Step 2
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <label htmlFor="companyId" className="block text-sm font-bold text-gray-700">
                    Company
                  </label>
                  <div className="mt-2">
                    <select
                      {...register('companyId')}
                      id="companyId"
                      name="companyId"
                      className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
                    >
                      <option value="">Select your company</option>
                      {companies.map((company, index) => (
                        <option key={company} value={`company-${index + 1}`}>
                          {company}
                        </option>
                      ))}
                    </select>
                    {errors.companyId && (
                      <p className="mt-2 text-sm text-red-600">{errors.companyId.message}</p>
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
                      autoComplete="new-password"
                      required
                      placeholder="Create a strong password"
                      className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 pr-12 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password requirements */}
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.regex.test(watchedPassword) ? (
                          <CheckIcon className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-gray-300"></div>
                        )}
                        <span className={req.regex.test(watchedPassword) ? 'text-emerald-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Confirm your password"
                      className="block w-full appearance-none rounded-2xl border-0 bg-white/50 px-4 py-4 pr-12 text-gray-900 placeholder-gray-400 shadow-lg ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm backdrop-blur-sm transition-all"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('agreeTerms')}
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label htmlFor="agreeTerms" className="ml-3 block text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-sm text-red-600">{errors.agreeTerms.message}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 justify-center items-center gap-2 rounded-2xl bg-gray-100 px-4 py-4 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-sm font-bold text-white shadow-2xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        Create Account
                        <UserPlusIcon className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign in here →
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