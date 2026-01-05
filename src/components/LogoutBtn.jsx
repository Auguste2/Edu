import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function LogoutBtn() {
  const { signOut } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    // ✅ go to login instantly (unmount protected pages)
    nav("/login", { replace: true });

    // ✅ do logout without waiting (no delay)
    signOut();
  };

  return (
    <button className="btn" onClick={onLogout}>
      Se déconnecter
    </button>
  );
}
