import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

/* Layout */
import Navbar from "./components/Navbar";

/* Public pages */
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

/* Dashboards */
import DashboardRouter from "./pages/DashboardRouter";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* Student pages */
import StudentNewApplication from "./pages/StudentNewApplication";

/* Admin pages */
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";

/* Route guards */
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

export default function App() {
  return (
    <>
      {/* ✅ Global Navbar (always visible) */}
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        {/* ================= DASHBOARD REDIRECT ================= */}
        {/* Decides admin vs student */}
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* ================= STUDENT ================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/new-application"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentNewApplication />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApplicationsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
