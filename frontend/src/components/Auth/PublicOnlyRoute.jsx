import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isHydratingSession, user } = useAuth();

  if (isHydratingSession) {
    return <p style={{ textAlign: "center", marginTop: "30px" }}>Checking session...</p>;
  }

  if (isAuthenticated) {
    const landingPath = user?.role === "admin" ? "/admin/dashboard" : "/home";
    return <Navigate to={landingPath} replace />;
  }

  return children;
}
