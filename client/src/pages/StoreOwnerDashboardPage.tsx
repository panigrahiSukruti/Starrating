import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { OwnerDashboardData } from '../types';
import { StarRating } from '../components/StarRating';
import {
  Store,
  MapPin,
  Mail,
  Star,
  Users,
  Calendar,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';

export const StoreOwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'userName'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await api.get('/owner/dashboard', {
        params: { sortBy, order }
      });
      setDashboardData(response.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error ||
        'Could not load store dashboard data. Please make sure a store is assigned to your account.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, order]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const toggleSort = (field: 'createdAt' | 'rating' | 'userName') => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder(field === 'userName' ? 'asc' : 'desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (errorMessage || !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-amber-900">Store Assignment Notice</h2>
          <p className="mt-2 text-sm text-amber-800 max-w-lg mx-auto">
            {errorMessage || 'No store information found.'}
          </p>
          <p className="mt-4 text-xs text-amber-600">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </p>
        </div>
      </div>
    );
  }

  const { store, ratings } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Store Banner Hero */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            🏪 Store Owner Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {store.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-amber-100 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 opacity-80" />
              <span>{store.address}</span>
            </div>
            {store.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1.5 opacity-80" />
                <span>{store.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Store Average Rating
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2 flex items-baseline">
              <span>{store.averageRating > 0 ? store.averageRating.toFixed(1) : 'N/A'}</span>
              <span className="text-sm font-normal text-gray-400 ml-1">/ 5.0</span>
            </div>
            <div className="mt-2">
              <StarRating value={store.averageRating} readOnly size="sm" />
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Customer Reviews
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {store.totalRatings}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Submitted by verified platform users
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Store Status
            </div>
            <div className="text-lg font-bold text-emerald-600 mt-2 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
              Active & Listed
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Visible on public catalog
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <Store className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Customer Ratings Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Customer Reviews Breakdown
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Detailed list of users who have submitted ratings for your store
            </p>
          </div>
        </div>

        {ratings.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No customer ratings have been submitted for your store yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    onClick={() => toggleSort('userName')}
                    className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    Customer Email
                  </th>
                  <th
                    scope="col"
                    onClick={() => toggleSort('rating')}
                    className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => toggleSort('createdAt')}
                    className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Submitted Date</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ratings.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-sm text-gray-900">
                        {review.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {review.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StarRating value={review.rating} readOnly size="sm" />
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {review.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

