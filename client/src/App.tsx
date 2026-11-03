import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getDefaultRouteForRole } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NormalUserCatalogPage } from './pages/NormalUserCatalogPage';
import { StoreOwnerDashboardPage } from './pages/StoreOwnerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Navigate to="/stores" replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes (Redirects if already logged in) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Normal User Catalog - Open & accessible */}
          <Route path="/stores" element={<NormalUserCatalogPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Store Owner Protected Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                <StoreOwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Universal Authenticated Route: Change Password */}
          <Route
            path="/profile/password"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STORE_OWNER', 'USER']}>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
