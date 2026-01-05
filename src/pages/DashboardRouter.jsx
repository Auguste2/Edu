import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // adjust if your path differs

export default function DashboardRouter() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({ loading: true, error: "", role: null });

  React.useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setState({ loading: true, error: "", role: null });

        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        if (!user) {
          if (!alive) return;
          setState({ loading: false, error: "", role: null });
          navigate("/login", { replace: true });
          return;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const role = data?.role;
        if (!role) throw new Error("No role found in user_profiles.");

        if (!alive) return;

        setState({ loading: false, error: "", role });

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/student", { replace: true });
        }
      } catch (e) {
        console.error("DashboardRouter error:", e);
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message || "Failed to detect role.",
          role: null,
        });
        // IMPORTANT: do NOT redirect to /student here.
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  if (state.loading) return <div style={{ padding: 24 }}>Loading dashboard…</div>;

  if (state.error) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Dashboard redirect failed</h3>
        <p style={{ opacity: 0.8 }}>{state.error}</p>
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

  return null;
}
