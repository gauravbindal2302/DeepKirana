import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "deepstore_auth_session";

function getInitialSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: "", user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token || "",
      user: parsed?.user || null,
    };
  } catch (error) {
    console.error("Failed to load auth session:", error);
    return { token: "", user: null };
  }
}

function persistSession(session) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to persist auth session:", error);
  }
}

export function AuthProvider({ children }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const [session, setSession] = useState(getInitialSession);

  const setAuthSession = (nextSession) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const requestOtp = useCallback(async ({ mobileNumber, role }) => {
    const response = await axios.post(`${SERVER_URL}/auth/request-otp`, {
      mobileNumber,
      role,
    });
    return response.data;
  }, [SERVER_URL]);

  const verifyOtp = useCallback(async ({ mobileNumber, role, otp, name }) => {
    const response = await axios.post(`${SERVER_URL}/auth/verify-otp`, {
      mobileNumber,
      role,
      otp,
      name,
    });
    setAuthSession({
      token: response.data.token,
      user: response.data.user,
    });
    return response.data.user;
  }, [SERVER_URL]);

  const logout = useCallback(() => {
    setAuthSession({ token: "", user: null });
  }, []);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      requestOtp,
      verifyOtp,
      logout,
    }),
    [session, requestOtp, verifyOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
