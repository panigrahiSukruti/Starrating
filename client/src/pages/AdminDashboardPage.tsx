import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/client';
import { AdminMetrics, User, Store } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { StarRating } from '../components/StarRating';
import {
  AdminUserCreationSchema,
  StoreCreationSchema,
  AdminUserCreationFormData,
  StoreCreationFormData
} from '../schemas/validation';
import {
  Users,
  Store as StoreIcon,
  Star,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Briefcase,
  User as UserIcon,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>('');
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSortBy, setUserSortBy] = useState<string>('createdAt');
  const [userOrder, setUserOrder] = useState<'asc' | 'desc'>('desc');

  // Stores state
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState<boolean>(true);
  const [storeSearch, setStoreSearch] = useState<string>('');
  const debouncedStoreSearch = useDebounce(storeSearch, 300);
  const [storeSortBy, setStoreSortBy] = useState<string>('createdAt');
  const [storeOrder, setStoreOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Forms
  const userForm = useForm<AdminUserCreationFormData>({
    resolver: zodResolver(AdminUserCreationSchema),
    defaultValues: {
      role: 'USER'
    }
  });

  const storeForm = useForm<StoreCreationFormData>({
    resolver: zodResolver(StoreCreationSchema)
  });

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        sortBy: userSortBy,
        order: userOrder
      };
      if (debouncedUserSearch.trim()) params.search = debouncedUserSearch.trim();
      if (userRoleFilter && userRoleFilter !== 'ALL') params.role = userRoleFilter;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [debouncedUserSearch, userRoleFilter, userSortBy, userOrder]);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      const params: any = {
        sortBy: storeSortBy,
        order: storeOrder
      };
      if (debouncedStoreSearch.trim()) params.search = debouncedStoreSearch.trim();

      const res = await api.get('/admin/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setStoresLoading(false);
    }
  }, [debouncedStoreSearch, storeSortBy, storeOrder]);

  // Load available store owners for store creation
  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/admin/available-owners');
      setAvailableOwners(res.data);
    } catch (err) {
      console.error('Failed to load available owners:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, fetchUsers, fetchStores]);

  const handleOpenUserModal = () => {
    userForm.reset({
      name: '',
      email: '',
      password: '',
      address: '',
      role: 'USER'
    });
    setModalError(null);
    setModalSuccess(null);
    setIsUserModalOpen(true);
  };

  const handleOpenStoreModal = async () => {
    storeForm.reset({
      name: '',
      email: '',
      address: '',
      ownerId: ''
    });
    setModalError(null);
    setModalSuccess(null);
    await fetchAvailableOwners();
    setIsStoreModalOpen(true);
  };

  const onUserSubmit = async (data: AdminUserCreationFormData) => {
    try {
      setModalError(null);
      await api.post('/admin/users', data);
      setModalSuccess('User created successfully!');
      fetchMetrics();
      fetchUsers();
      setTimeout(() => {
        setIsUserModalOpen(false);
        setModalSuccess(null);
      }, 1000);
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const onStoreSubmit = async (data: StoreCreationFormData) => {
    try {
      setModalError(null);
      await api.post('/admin/stores', data);
      setModalSuccess('Store created successfully!');
      fetchMetrics();
      fetchStores();
      setTimeout(() => {
        setIsStoreModalOpen(false);
        setModalSuccess(null);
      }, 1000);
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create store');
    }
  };

  const toggleUserSort = (col: string) => {
    if (userSortBy === col) {
      setUserOrder(userOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(col);
      setUserOrder('asc');
    }
  };

  const toggleStoreSort = (col: string) => {
    if (storeSortBy === col) {
      setStoreOrder(storeOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(col);
      setStoreOrder(col === 'rating' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            👑 System Administrator
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Administrator Control Center
          </h1>
          <p className="mt-2 text-purple-100 text-sm max-w-xl">
            Manage system-wide accounts, register new store entities, monitor platform analytics, and review rating metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenUserModal}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-sm shadow-md hover:bg-purple-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5 text-purple-700" />
            Add New User
          </button>
          <button
            onClick={handleOpenStoreModal}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-md hover:bg-purple-600 transition-colors border border-purple-400"
          >
            <Plus className="w-4 h-4 mr-1.5 text-white" />
            Add New Store
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {metrics.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">Admins, Owners & Users</p>
          </div>
          <div className="p-4 bg-purple-50 text-purple-700 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Stores
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {metrics.totalStores}
            </div>
            <p className="text-xs text-gray-500 mt-1">Registered businesses</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-700 rounded-2xl">
            <StoreIcon className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Ratings Submitted
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {metrics.totalRatings}
            </div>
            <p className="text-xs text-gray-500 mt-1">Customer verified reviews</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Users Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'stores'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <StoreIcon className="w-4 h-4 mr-2" />
            Stores Management ({stores.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by Name, Email, or Address..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-xs uppercase">Role Filter:</span>
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="USER">Normal User</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {usersLoading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                <p className="mt-3 text-xs text-gray-500">Loading user registry...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No users match the search and filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => toggleUserSort('name')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('email')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('address')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Address</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('role')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Role</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Store & Rating (If Owner)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-sm text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {u.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.role === 'ADMIN' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                              <Shield className="w-3 h-3 mr-1" /> ADMIN
                            </span>
                          )}
                          {u.role === 'STORE_OWNER' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <Briefcase className="w-3 h-3 mr-1" /> STORE OWNER
                            </span>
                          )}
                          {u.role === 'USER' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              <UserIcon className="w-3 h-3 mr-1" /> USER
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.role === 'STORE_OWNER' ? (
                            u.store ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-800">{u.store.name}:</span>
                                {u.assignedStoreRatingAverage !== null ? (
                                  <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                                    <span className="text-xs font-bold text-amber-800">
                                      {u.assignedStoreRatingAverage} ★
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No ratings yet</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No store assigned yet</span>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STORES MANAGEMENT */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search stores by Name, Email, or Address..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {storeSearch && (
                <button
                  onClick={() => setStoreSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Stores Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {storesLoading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                <p className="mt-3 text-xs text-gray-500">Loading stores catalog...</p>
              </div>
            ) : stores.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No stores match your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => toggleStoreSort('name')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Store Name</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('email')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Contact Email</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('address')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Address</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('rating')}
                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Overall Rating</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Assigned Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-sm text-gray-900">{s.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {s.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {s.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StarRating value={s.overallRating} readOnly size="sm" />
                            <span className="text-xs font-bold text-gray-800">
                              {s.overallRating > 0 ? s.overallRating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({s.ratingCount || 0} reviews)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {s.owner ? (
                            <div>
                              <div className="font-semibold text-gray-800">{s.owner.name}</div>
                              <div className="text-xs text-gray-400">{s.owner.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccess && (
              <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                {modalSuccess}
              </div>
            )}

            {modalError && (
              <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form
              onSubmit={userForm.handleSubmit(onUserSubmit)}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Name (20 - 60 chars)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    {...userForm.register('name')}
                    placeholder="e.g. Benjamin Arthur Montgomery"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {userForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {userForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    {...userForm.register('email')}
                    placeholder="user@example.com"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {userForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {userForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Address (max 400 chars)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={2}
                    {...userForm.register('address')}
                    placeholder="100 Innovation Way, Tech Park"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {userForm.formState.errors.address && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {userForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password (8-16 chars, 1 uppercase, 1 special char)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    {...userForm.register('password')}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {userForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {userForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Assigned User Role
                </label>
                <select
                  {...userForm.register('role')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
                {userForm.formState.errors.role && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {userForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userForm.formState.isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md disabled:opacity-50"
                >
                  {userForm.formState.isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STORE */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <StoreIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Add New Store</h3>
              </div>
              <button
                onClick={() => setIsStoreModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccess && (
              <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                {modalSuccess}
              </div>
            )}

            {modalError && (
              <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form
              onSubmit={storeForm.handleSubmit(onStoreSubmit)}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Store Name (max 100 chars)
                </label>
                <input
                  type="text"
                  {...storeForm.register('name')}
                  placeholder="e.g. Blue Harbor Coffee Roasters"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {storeForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {storeForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Store Contact Email
                </label>
                <input
                  type="email"
                  {...storeForm.register('email')}
                  placeholder="contact@blueharbor.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {storeForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {storeForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Store Address (max 400 chars)
                </label>
                <textarea
                  rows={2}
                  {...storeForm.register('address')}
                  placeholder="300 Waterfront Promenade, Suite 4B, Bay City"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {storeForm.formState.errors.address && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {storeForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Assign to Store Owner (1-to-1 constraint)
                </label>
                {availableOwners.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    ⚠️ All existing Store Owners currently have an assigned store. Please create a new user with the <b>STORE_OWNER</b> role first.
                  </div>
                ) : (
                  <select
                    {...storeForm.register('ownerId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select an available Store Owner...</option>
                    {availableOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                )}
                {storeForm.formState.errors.ownerId && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {storeForm.formState.errors.ownerId.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={storeForm.formState.isSubmitting || availableOwners.length === 0}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md disabled:opacity-50"
                >
                  {storeForm.formState.isSubmitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

