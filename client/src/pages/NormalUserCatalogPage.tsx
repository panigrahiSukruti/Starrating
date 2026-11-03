import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { Store } from '../types';
import { StarRating } from '../components/StarRating';
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Star,
  CheckCircle,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

export const NormalUserCatalogPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [sortBy, setSortBy] = useState<'name' | 'address' | 'rating'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Rating modal/drawer state
  const [activeStoreForRating, setActiveStoreForRating] = useState<Store | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        sortBy,
        order
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await api.get('/stores', { params });
      setStores(response.data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sortBy, order]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRatingModal = (store: Store) => {
    setActiveStoreForRating(store);
    setSelectedRating(store.userRating || 5);
    setRatingMessage(null);
  };

  const handleSubmitRating = async () => {
    if (!activeStoreForRating) return;
    try {
      setIsSubmittingRating(true);
      await api.post('/ratings', {
        storeId: activeStoreForRating.id,
        rating: selectedRating
      });

      setRatingMessage('Thank you! Your rating has been saved.');
      // Refresh list
      await fetchStores();

      setTimeout(() => {
        setActiveStoreForRating(null);
        setRatingMessage(null);
      }, 1200);
    } catch (err: any) {
      setRatingMessage(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const toggleSort = (newSortBy: 'name' | 'address' | 'rating') => {
    if (sortBy === newSortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setOrder(newSortBy === 'rating' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 mb-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            ⭐ Community Feedback Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover & Rate Registered Stores
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Browse through all verified neighborhood businesses, explore customer reviews, and share your own 1-to-5 star rating experience.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input with 300ms Debounce */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name or address..."
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              Sort:
            </span>

            <button
              onClick={() => toggleSort('name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors border ${
                sortBy === 'name'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Name</span>
              {sortBy === 'name' && (
                <ArrowUpDown className="w-3 h-3 ml-1 text-white opacity-80" />
              )}
            </button>

            <button
              onClick={() => toggleSort('address')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors border ${
                sortBy === 'address'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Address</span>
              {sortBy === 'address' && (
                <ArrowUpDown className="w-3 h-3 ml-1 text-white opacity-80" />
              )}
            </button>

            <button
              onClick={() => toggleSort('rating')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors border ${
                sortBy === 'rating'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>Highest Rating</span>
              {sortBy === 'rating' && (
                <ArrowUpDown className="w-3 h-3 ml-1 text-white opacity-80" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading verified stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <StoreIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">No stores found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No stores matched your query "${searchQuery}". Try searching with different keywords.`
              : 'There are no stores listed on the platform yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasUserRated = store.userRating !== null && store.userRating !== undefined;

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Store Name & Overall Score Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                      {store.name}
                    </h2>
                    <div className="flex items-center bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 shadow-xs flex-shrink-0">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                      <span className="font-bold text-sm">
                        {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2 text-gray-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>

                  {/* Rating Stars Overview */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                        Overall Rating
                      </div>
                      <StarRating value={store.overallRating} readOnly size="sm" showLabel />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {store.totalRatings || 0} {(store.totalRatings || 0) === 1 ? 'rating' : 'ratings'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & User's Submitted Rating */}
                <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    {hasUserRated ? (
                      <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>You rated: {store.userRating} ★</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Not rated yet</span>
                    )}
                  </div>

                  {isAuthenticated ? (
                    <button
                      onClick={() => handleOpenRatingModal(store)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        hasUserRated
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      }`}
                    >
                      {hasUserRated ? 'Modify Rating' : 'Submit Rating'}
                    </button>
                  ) : (
                    <a
                      href="/login"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Log in to rate →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Rating Modal */}
      {activeStoreForRating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <StoreIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {activeStoreForRating.userRating ? 'Modify Your Rating' : 'Rate This Store'}
              </h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {activeStoreForRating.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeStoreForRating.address}
              </p>
            </div>

            <div className="my-8 flex flex-col items-center">
              <div className="text-4xl font-extrabold text-amber-500 mb-3 flex items-center space-x-1">
                <span>{selectedRating}</span>
                <span className="text-2xl text-gray-400">/ 5</span>
              </div>
              <StarRating
                value={selectedRating}
                onChange={(newRating) => setSelectedRating(newRating)}
                size="lg"
              />
              <span className="text-xs text-gray-400 mt-3">
                Click a star to select your rating (1 to 5)
              </span>
            </div>

            {ratingMessage && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs text-center font-medium">
                {ratingMessage}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveStoreForRating(null)}
                disabled={isSubmittingRating}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmittingRating ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
