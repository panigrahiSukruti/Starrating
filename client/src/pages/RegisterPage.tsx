import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRegistrationSchema, type UserRegistrationFormData } from '../schemas/validation';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, Mail, MapPin, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(UserRegistrationSchema),
    mode: 'onChange'
  });

  const nameValue = watch('name') || '';
  const addressValue = watch('address') || '';

  const onSubmit = async (data: UserRegistrationFormData) => {
    try {
      setServerError(null);
      setIsSubmitting(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address
      });
      setSuccess(true);

      // Auto sign-in
      setTimeout(async () => {
        try {
          await login(data.email, data.password);
          navigate('/stores', { replace: true });
        } catch {
          navigate('/login', { replace: true });
        }
      }, 1000);
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please check your information.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to discover and rate local stores
          </p>
        </div>

        {success && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center space-x-3 text-green-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>Registration successful! Logging you in...</div>
          </div>
        )}

        {serverError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>{serverError}</div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <span className="text-xs text-gray-400">
                {nameValue.length}/60 chars (min 20)
              </span>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Jonathan Robert Davenport"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.name ? (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Name must be between 20 and 60 characters.</p>
            )}
          </div>

          {/* Email */}
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
                placeholder="jonathan.davenport@example.com"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Residential Address
              </label>
              <span className="text-xs text-gray-400">
                {addressValue.length}/400 chars
              </span>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-gray-400">
                <MapPin className="h-5 w-5" />
              </div>
              <textarea
                rows={2}
                {...register('address')}
                placeholder="14 Elmwood Terrace, Residential Heights, Spring Valley"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.address
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.address.message}</p>
            )}
          </div>

          {/* Password */}
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
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none transition-colors ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Must be 8-16 characters with at least 1 uppercase letter and 1 special character.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full mt-6 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
