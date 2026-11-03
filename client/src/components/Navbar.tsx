import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  KeyRound,
  LogOut,
  ShieldAlert,
  Briefcase,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            System Administrator
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Briefcase className="w-3 h-3 mr-1" />
            Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserIcon className="w-3 h-3 mr-1" />
            Normal User
          </span>
        );
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
              <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                RateSphere
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/stores"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/stores'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Store Catalog</span>
                </div>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Control Center</span>
                  </div>
                </Link>
              )}

              {user?.role === 'STORE_OWNER' && (
                <Link
                  to="/owner/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/owner')
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Owner Dashboard</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>

                <Link
                  to="/profile/password"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Change Password"
                >
                  <KeyRound className="w-5 h-5" />
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

