import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const navigate = useNavigate();
  const { loading, user, signOut } = useAuth();

  const handleLogout = () => {
    // ✅ INSTANT redirect (unmounts dashboard immediately)
    navigate("/login", { replace: true });

    // ✅ Logout in background (no await, no delay)
    signOut();
  };

  // ✅ While auth is loading, always show public navbar (never block UI)
  if (loading) {
    return (
      <nav className="top-navbar">
        <div className="top-navbar__inner">
          <NavLink to="/" className="top-navbar__brand">
            SAVEDU
          </NavLink>

          <div className="top-navbar__links">
            <NavLink to="/" className="top-navbar__link">ACCUEIL</NavLink>
            <NavLink to="/" className="top-navbar__link">SERVICES</NavLink>
            <NavLink to="/contact" className="top-navbar__link">CONTACT</NavLink>
            <NavLink to="/signup" className="top-navbar__btn">INSCRIPTION</NavLink>
            <NavLink to="/login" className="top-navbar__btn">CONNEXION</NavLink>
          </div>
        </div>
      </nav>
    );
  }

  // ✅ Logged in navbar
  if (user) {
    return (
      <nav className="top-navbar">
        <div className="top-navbar__inner">
          <NavLink to="/" className="top-navbar__brand">
            SAVEDU
          </NavLink>

          <div className="top-navbar__links">
            <NavLink to="/dashboard" className="top-navbar__btn">
              DASHBOARD
            </NavLink>

            <button
              type="button"
              className="top-navbar__btn"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ✅ Logged out navbar
  return (
    <nav className="top-navbar">
      <div className="top-navbar__inner">
        <NavLink to="/" className="top-navbar__brand">
          SAVEDU
        </NavLink>

        <div className="top-navbar__links">
          <NavLink to="/" className="top-navbar__link">ACCUEIL</NavLink>
          <NavLink to="/" className="top-navbar__link">SERVICES</NavLink>
          <NavLink to="/contact" className="top-navbar__link">CONTACT</NavLink>
          <NavLink to="/signup" className="top-navbar__btn">INSCRIPTION</NavLink>
          <NavLink to="/login" className="top-navbar__btn">CONNEXION</NavLink>
        </div>
      </div>
    </nav>
  );
}
