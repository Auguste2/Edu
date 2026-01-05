import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);

      // ✅ Create account (student by default in your profiles table, not here)
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setMsg("✅ Compte créé. Vérifiez votre email puis connectez-vous.");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (err) {
      setMsg(err?.message || "Inscription échouée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-page__container">
        <div className="auth-card">
          <h2 className="auth-card__title">Inscription</h2>
          <p className="auth-card__subtitle">Créez votre compte étudiant.</p>

          <form className="auth-form" onSubmit={onSignup}>
            <label className="field">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>

            {msg && <p className="form-msg">{msg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
