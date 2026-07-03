import React, { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

export const AppContext = createContext();
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("isAuthenticated") === "true");
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [factoryId, setFactoryId] = useState(localStorage.getItem("factoryId") || null);
  const [userProfile, setUserProfile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const logout = useCallback(() => {
    fetch(`${BACKEND_URL}/home/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.clear();
    setToken(false);
    setRole(null);
    setFactoryId(null);
    setUserProfile(null);
  }, []);

  const triggerDataRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const setAuth = (newRole, newFactoryId, newUserProfile) => {
    setToken(true);
    setRole(newRole);
    setFactoryId(newFactoryId);
    setUserProfile(newUserProfile);
    
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", newRole);
    if (newFactoryId) localStorage.setItem("factoryId", newFactoryId);
    else localStorage.removeItem("factoryId");
  };

  useEffect(() => {
    // Verify session on startup
    if (localStorage.getItem("isAuthenticated") === "true") {
      fetch(`${BACKEND_URL}/home/auth/me`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setToken(true);
            setRole(data.role);
            setFactoryId(data.factoryId);
            setUserProfile(data.userProfile);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, [logout]);

  useEffect(() => {
    if (!userProfile) return;
    const socket = io(BACKEND_URL);
    
    socket.on("connect", () => {
      if (userProfile.id) socket.emit("join_room", `user:${userProfile.id}`);
      if (factoryId) socket.emit("join_room", `factory:${factoryId}`);
    });

    socket.on("NOTIFICATION_RECEIVED", (data) => {
      toast.info(data.message, { position: "top-right", autoClose: 8000 });
      triggerDataRefresh();
    });

    socket.on("STATE_CHANGED", () => {
      triggerDataRefresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [userProfile, factoryId, triggerDataRefresh]);

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    options.credentials = 'include';
    
    const res = await fetch(`${BACKEND_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error("Session invalid."); }
    return res.json();
  }, [logout]);

  return (
    <AppContext.Provider value={{
      token, role, factoryId, userProfile, refreshTrigger,
      setAuth, logout, apiFetch, triggerDataRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
};