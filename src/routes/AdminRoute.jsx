import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminRoute() {
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let alive = true;

    async function checkRole() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        if (alive) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!alive) return;

      if (error) {
        console.error("Role fetch error:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === "admin");
      }

      setLoading(false);
    }

    checkRole();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking admin access...</div>;
  if (!isAdmin) return <Navigate to="/not-authorized" replace />;

  return <Outlet />;
}
