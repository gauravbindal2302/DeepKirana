import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth, provider } from "../Admin/firebase/firebase";
import axios from "axios";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "deepstore_auth_session";
const ROLE_STORAGE_KEY = "deepstore_login_role";

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
  const [isHydratingSession, setIsHydratingSession] = useState(true);

  const setAuthSession = (nextSession) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const toAppUser = useCallback((firebaseUser, role) => {
    if (!firebaseUser) return null;
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      role,
    };
  }, []);

  const loginWithGoogle = useCallback(async ({ role }) => {
    const selectedRole = role === "admin" ? "admin" : "customer";
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const email = String(firebaseUser?.email || "").toLowerCase();

    if (selectedRole === "admin") {
      const allowedAdminEmails = String(process.env.REACT_APP_ADMIN_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      if (allowedAdminEmails.length === 0) {
        await signOut(auth);
        throw new Error("Admin emails are not configured. Set REACT_APP_ADMIN_EMAILS.");
      }
      if (!allowedAdminEmails.includes(email)) {
        await signOut(auth);
        throw new Error("This Google account is not allowed for admin login.");
      }
    }

    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    const appUser = toAppUser(firebaseUser, selectedRole);
    setAuthSession({
      token: firebaseUser.accessToken || "firebase-session",
      user: appUser,
    });

    axios
      .post(`${SERVER_URL}/auth/login-event`, {
        userId: appUser.id,
        email: appUser.email,
        role: selectedRole,
        provider: "google",
        source: "web",
      })
      .catch((error) => {
        console.error("Failed to record login event:", error);
      });

    return appUser;
  }, [SERVER_URL, toAppUser]);

  const updateMyProfile = useCallback(async ({ name }) => {
    const nextName = String(name || "").trim();
    if (!nextName) {
      throw new Error("Name is required.");
    }
    if (!auth.currentUser) {
      throw new Error("No active user.");
    }
    await updateProfile(auth.currentUser, { displayName: nextName });
    const role = session?.user?.role || localStorage.getItem(ROLE_STORAGE_KEY) || "customer";
    const user = toAppUser(auth.currentUser, role);
    setAuthSession({
      token: session.token,
      user,
    });
    return user;
  }, [session.token, session?.user?.role, toAppUser]);

  const logout = useCallback(() => {
    signOut(auth).catch((error) => {
      console.error("Error signing out:", error);
    });
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setAuthSession({ token: "", user: null });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;
      if (!firebaseUser) {
        setAuthSession({ token: "", user: null });
        setIsHydratingSession(false);
        return;
      }
      const role = localStorage.getItem(ROLE_STORAGE_KEY) || "customer";
      const appUser = toAppUser(firebaseUser, role);
      setAuthSession({
        token: firebaseUser.accessToken || "firebase-session",
        user: appUser,
      });
      setIsHydratingSession(false);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [toAppUser]);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isHydratingSession,
      isAuthenticated: Boolean(session.token && session.user),
      loginWithGoogle,
      updateMyProfile,
      logout,
    }),
    [session, isHydratingSession, loginWithGoogle, updateMyProfile, logout]
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
