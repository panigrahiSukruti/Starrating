import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginFormData } from '../schemas/validation';
import { useAuth, getDefaultRouteForRole } from '../context/AuthContext';
import { Store, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      setIsSubmitting(true);
      const user = await login(data.email, data.password);
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to log in. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to RateSphere
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your role-specific dashboard
          </p>
        </div>

        {/* Quick Demo Logins */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs">
          <div className="flex items-center text-indigo-900 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            Quick Demo Autofill Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@storerating.com', 'Admin@12345')}
              className="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-100/50 transition-colors shadow-sm text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('a.harrison@corporate.org', 'Owner@12345')}
              className="py-1.5 px-2 bg-white rounded-lg border border-amber-200 text-amber-800 font-medium hover:bg-amber-100/50 transition-colors shadow-sm text-center"
            >
              🏪 Store Owner
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('user@storerating.com', 'User@12345')}
              className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-blue-800 font-medium hover:bg-blue-100/50 transition-colors shadow-sm text-center"
            >
              👤 Normal User
            </button>
          </div>
        </div>

        {serverError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>{serverError}</div>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign up as a User
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

