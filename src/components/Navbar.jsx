import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const navigate = useNavigate();
  const { loading, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const Brand = () => (
    <NavLink to="/" className="top-navbar__brand">
      <img
        src="/savedu-logo.png"
        alt="SAVEDU"
        className="top-navbar__logo"
      />
    </NavLink>
  );

  if (loading) {
    return (
      <nav className="top-navbar">
        <div className="top-navbar__inner">
          <Brand />
        </div>
      </nav>
    );
  }

  if (user) {
    return (
      <nav className="top-navbar">
        <div className="top-navbar__inner">
          <Brand />

          <div className="top-navbar__links">
            <NavLink to="/dashboard" className="top-navbar__btn">
              DASHBOARD
            </NavLink>

            <button className="top-navbar__btn" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="top-navbar">
      <div className="top-navbar__inner">
        <Brand />

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
