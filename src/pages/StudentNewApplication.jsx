import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../components/AuthProvider";

export default function StudentNewApplication() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // ✅ protect
  if (authLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Chargement…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("EN COURS");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!title.trim()) {
      setErr("Le titre du dossier est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ IMPORTANT: do NOT send student_id from frontend
      // DB default auth.uid() will fill it automatically
      const payload = {
        title: title.trim(),
        country: country.trim() || null,
        status,
      };

      // ✅ return inserted row (helps debugging)
      const { data, error } = await supabase
        .from("applications")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      setOk("✅ Dossier créé avec succès !");
      // go back to dashboard immediately
      nav("/student", { replace: true, state: { createdId: data?.id } });
    } catch (e2) {
      setErr(e2?.message || "Erreur lors de la création du dossier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="dash">
      <div className="dash__container">
        <div className="dash__header">
          <div>
            <h1 className="dash__title">Nouveau dossier</h1>
            <p className="dash__subtitle">
              Remplis les informations ci-dessous pour créer ton dossier.
            </p>
          </div>

          <div className="dash__actions">
            <button className="dash__btn" type="button" onClick={() => nav("/student")}>
              ← Retour
            </button>
          </div>
        </div>

        {err && <div className="dash__notice dash__notice--error">❌ {err}</div>}
        {ok && <div className="dash__notice">{ok}</div>}

        <div className="dash__panel">
          <form onSubmit={onSubmit} className="form">
            <label className="form__label">
              Titre du dossier *
              <input
                className="form__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Demande d’admission — Canada"
                maxLength={120}
                autoFocus
              />
            </label>

            <label className="form__label">
              Pays (optionnel)
              <input
                className="form__input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ex: Canada"
                maxLength={60}
              />
            </label>

            <label className="form__label">
              Statut
              <select
                className="form__input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="EN COURS">EN COURS</option>
                <option value="ACTION">ACTION</option>
                <option value="SOUMIS">SOUMIS</option>
              </select>
            </label>

            <div className="form__actions">
              <button
                className="dash__btn dash__btn--primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Création..." : "Créer le dossier"}
              </button>

              <button
                className="dash__btn"
                type="button"
                disabled={submitting}
                onClick={() => {
                  setTitle("");
                  setCountry("");
                  setStatus("EN COURS");
                  setErr("");
                  setOk("");
                }}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{css}</style>
    </main>
  );
}

const css = `
.dash{ padding: 28px 0 60px; background: #f7f8fb; min-height: 70vh; }
.dash__container{ width: min(1100px, 92%); margin: 0 auto; }
.dash__header{ display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom: 18px; }
.dash__title{ margin: 0; font-size: 34px; color:#0e1b3a; }
.dash__subtitle{ margin: 6px 0 0; color:#334155; }
.dash__actions{ display:flex; gap:10px; flex-wrap:wrap; }
.dash__btn{ border:none; padding: 10px 14px; border-radius: 999px; cursor:pointer; font-weight:700; }
.dash__btn--primary{ background:#f4b000; color:#1b1b1b; box-shadow:0 8px 20px rgba(244,176,0,0.25); }
.dash__btn:not(.dash__btn--primary){ background:#ffffff; color:#0e1b3a; border:1px solid rgba(0,0,0,0.08); }
.dash__notice{ margin: 10px 0; padding: 10px 12px; border-radius: 12px; background:#fff; border: 1px solid rgba(0,0,0,0.08); }
.dash__notice--error{ border-color: rgba(255,0,0,0.25); color:#b91c1c; }
.dash__panel{ background:#fff; border-radius: 18px; padding: 16px; border: 1px solid rgba(0,0,0,0.08); }

.form{ display:grid; gap: 14px; max-width: 720px; }
.form__label{ display:grid; gap: 8px; color:#0e1b3a; font-weight:800; }
.form__input{
  width: 100%;
  border:1px solid rgba(0,0,0,0.14);
  border-radius: 12px;
  padding: 12px 12px;
  outline: none;
  font-weight: 600;
  color:#0e1b3a;
  background: #fff;
}
.form__input:focus{
  box-shadow: 0 0 0 4px rgba(244,176,0,0.18);
  border-color: rgba(244,176,0,0.6);
}
.form__actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 6px; }
`;
