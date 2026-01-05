import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const withTimeout = (p, ms, msg = "timeout") =>
  Promise.race([
    p,
    new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Use YOUR real table name here:
  // If your project uses user_profiles, keep it.
  // If it uses profiles, change "user_profiles" to "profiles".
  const PROFILE_TABLE = "user_profiles";

  const loadRoleSafe = async (uid) => {
    try {
      const q = supabase
        .from(PROFILE_TABLE)
        .select("role")
        .eq("id", uid)
        .maybeSingle();

      // ✅ role load can be fast timeout; if it fails, don't block session
      const { data, error } = await withTimeout(q, 4000, "profile role timeout");
      if (error) throw error;

      return data?.role ?? null;
    } catch (e) {
      console.warn("Role load skipped:", e?.message || e);
      return null;
    }
  };

  const refresh = async () => {
    // IMPORTANT: don't "log out" on transient errors
    setLoading(true);
    setError(null);

    try {
      // ✅ Give session fetch more time (tabs in background can be slow)
      const { data, error } = await withTimeout(
        supabase.auth.getSession(),
        10000,
        "getSession timeout"
      );

      if (error) throw error;

      const u = data?.session?.user ?? null;

      // ✅ Only set user null if we truly have NO session
      setUser(u);

      if (u?.id) {
        const r = await loadRoleSafe(u.id);
        setRole(r);
      } else {
        setRole(null);
      }
    } catch (e) {
      // ✅ KEY FIX:
      // If refresh fails (timeout/offline), keep existing user instead of wiping it.
      setError(e?.message || String(e));
      console.warn("Auth refresh failed (kept existing session):", e?.message || e);
      // keep previous user/role as-is
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // ✅ immediate UI logout
    setUser(null);
    setRole(null);
    setError(null);
    setLoading(false);

    // clear cached tokens locally
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {}

    // remote signout (can be slow)
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.warn("Supabase signOut error:", e?.message || e);
    }
  };

  useEffect(() => {
    // initial load
    refresh();

    // subscribe to auth events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // ✅ when Supabase tells us session changed, trust it (no timeout)
      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }

      // refresh role in background
      (async () => {
        const r = await loadRoleSafe(u.id);
        setRole(r);
        setLoading(false);
      })();
    });

    // ✅ When user returns to the tab, re-check session
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      sub?.subscription?.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ loading, user, role, error, refresh, signOut }),
    [loading, user, role, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
