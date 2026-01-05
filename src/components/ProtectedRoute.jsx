import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // adjust path if yours differs

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState(null);
  const [role, setRole] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!alive) return;
        setSession(session ?? null);

        if (!session?.user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error: roleErr } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (roleErr) throw roleErr;

        if (!alive) return;
        setRole(data?.role ?? null);
        setLoading(false);
      } catch (e) {
        console.error("ProtectedRoute error:", e);
        if (!alive) return;
        setError(e?.message || "Failed to verify access");
        setLoading(false);
      }
    }

    run();

    // keep session fresh if user signs in/out in another tab
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Access check failed</h3>
        <p style={{ opacity: 0.8 }}>{error}</p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
        >
          Sign out & login again
        </button>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role is missing, treat as blocked (but not blank)
  if (!role) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
