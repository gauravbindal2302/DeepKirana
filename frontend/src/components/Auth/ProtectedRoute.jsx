import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const roleQuery = requiredRole ? `?role=${requiredRole}` : "";
    return <Navigate to={`/login${roleQuery}`} replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallbackPath = user?.role === "admin" ? "/admin/dashboard" : "/account";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
