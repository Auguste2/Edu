import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  // If user is logged in, keep them out of login/signup
  if (user) return <Navigate to="/dashboard" replace />;

  // ✅ If user is NOT logged in, show the page immediately
  // (Do NOT block with loading—this removes the logout delay)
  return children;
}
