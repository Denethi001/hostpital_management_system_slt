import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../lib/api";

const AuthContext = createContext(null);

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const IDLE_WARNING = 2 * 60 * 1000;  // warn 2 min before

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("hms_user")); } catch { return null; }
  });
  const [idleWarning, setIdleWarning] = useState(false);
  const timerRef = useRef(null);
  const warnTimerRef = useRef(null);

  const logout = useCallback((reason = "logout") => {
    setUser(null);
    setIdleWarning(false);
    sessionStorage.removeItem("hms_user");
    clearTimeout(timerRef.current);
    clearTimeout(warnTimerRef.current);
    if (reason === "idle") window.location.href = "/login?reason=idle";
    else window.location.href = "/login";
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(warnTimerRef.current);
    setIdleWarning(false);
    if (!user) return;
    warnTimerRef.current = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT - IDLE_WARNING);
    timerRef.current = setTimeout(() => logout("idle"), IDLE_TIMEOUT);
  }, [user, logout]);

  useEffect(() => {
    if (!user) return;
    const events = ["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive:true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      clearTimeout(timerRef.current);
      clearTimeout(warnTimerRef.current);
    };
  }, [user, resetIdleTimer]);

  const login = async (email, password) => {
    const { data, error } = await auth.login({ email, password });
    if (error) return { error };
    setUser(data.user);
    sessionStorage.setItem("hms_user", JSON.stringify(data.user));
    return { user: data.user };
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem("hms_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, idleWarning, resetIdleTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
