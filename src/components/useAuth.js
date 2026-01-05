import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  const loadRole = async (uid) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle();

    if (error) throw error;
    return data?.role ?? "student";
  };

  useEffect(() => {
    let mounted = true;

    // ✅ SAFETY: never hang forever
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const u = data?.session?.user ?? null;
        if (!mounted) return;

        setUser(u);

        if (u?.id) {
          const r = await loadRole(u.id);
          if (!mounted) return;
          setRole(r);
        } else {
          setRole(null);
        }

        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const u = session?.user ?? null;
        setUser(u);

        if (u?.id) {
          const r = await loadRole(u.id);
          setRole(r);
        } else {
          setRole(null);
        }

        setError(null);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return { loading, user, role, error };
}
