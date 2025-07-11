import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Tạm thời bỏ auth check để test
  // if (!user) {
  //   // Redirect to appropriate login page based on the route
  //   const isPartnerRoute = location.pathname.startsWith('/partner');
  //   const loginPath = isPartnerRoute ? '/partner/login' : '/login';
    
  //   return <Navigate to={loginPath} state={{ from: location }} replace />;
  // }

  // // Nếu user là partner mà truy cập route nội bộ, redirect về /partner/portal
  if (user.role === 'partner' && !location.pathname.startsWith('/partner')) {
    return <Navigate to="/partner/portal" replace />;
  }

  // Nếu user là nội bộ mà truy cập route /partner/..., redirect về /dashboard
  // if (user.role !== 'partner' && location.pathname.startsWith('/partner')) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  // Check if specific roles are required
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on user role
    if (user.role === 'partner') {
      return <Navigate to="/partner/portal" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
} 