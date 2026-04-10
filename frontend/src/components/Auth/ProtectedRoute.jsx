import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isHydratingSession, user } = useAuth();
  const location = useLocation();

  if (isHydratingSession) {
    return <p style={{ textAlign: "center", marginTop: "30px" }}>Checking session...</p>;
  }

  if (!isAuthenticated) {
    const roleQuery = requiredRole ? `?role=${requiredRole}` : "";
    return <Navigate to={`/login${roleQuery}`} replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallbackPath = user?.role === "admin" ? "/admin/dashboard" : "/home";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
