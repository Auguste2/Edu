import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const withTimeout = (p, ms, msg = "timeout") =>
  Promise.race([
    p,
    new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        6000,
        "Login timeout (check Supabase URL/Key or network)"
      );

      if (error) throw error;

      // ✅ if login succeeded, go to dashboard router
      if (data?.session) {
        nav("/dashboard", { replace: true });
      } else {
        setMsg("Connexion OK, mais aucune session reçue.");
      }
    } catch (err) {
      setMsg(err?.message || "Connexion échouée.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-page__container">
        <div className="auth-card">
          <h2 className="auth-card__title">Connexion</h2>
          <p className="auth-card__subtitle">Connectez-vous pour accéder à votre espace.</p>

          <form className="auth-form" onSubmit={onLogin}>
            <label className="field">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: nom@email.com"
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span>Mot de passe</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                type="password"
                autoComplete="current-password"
              />
            </label>

            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {msg && <p className="form-msg form-msg--error">❌ {msg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
