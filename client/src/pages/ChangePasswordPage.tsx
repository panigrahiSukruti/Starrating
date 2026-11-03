import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/client';
import { useAuth, getDefaultRouteForRole } from '../context/AuthContext';
import { ChangePasswordSchema, ChangePasswordFormData } from '../schemas/validation';
import { KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema)
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setServerError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      const response = await api.patch('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });

      setSuccessMessage(response.data?.message || 'Password updated successfully!');
      reset();

      setTimeout(() => {
        navigate(getDefaultRouteForRole(user?.role));
      }, 1500);
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to change password. Please verify your current password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Securely update your credentials for {user?.email}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                {...register('oldPassword')}
                placeholder="Enter existing password"
                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.oldPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.oldPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                {...register('newPassword')}
                placeholder="Enter new strong password"
                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.newPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.newPassword ? (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.newPassword.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                8 to 16 characters, at least 1 uppercase letter and 1 special symbol.
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Re-type new password"
                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(getDefaultRouteForRole(user?.role))}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

