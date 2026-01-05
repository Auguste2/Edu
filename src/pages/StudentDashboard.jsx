import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../components/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // ✅ 1) While auth is checking session, show ONLY loader (no dashboard UI)
  if (authLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Chargement…</div>;
  }

  // ✅ 2) If not logged in, redirect immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ dossiers: 0, paiements: 0, notifications: 0 });
  const [recentDossiers, setRecentDossiers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const displayName = useMemo(() => {
    return (
      profile?.full_name ||
      profile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "Étudiant"
    );
  }, [profile, user]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setErr("");

        // PROFILE
        const profileQ = supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

        // COUNTS
        const dossiersCountQ = supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id);

        const paymentsCountQ = supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id);

        const notifCountQ = supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .eq("is_read", false);

        // RECENTS
        const recentDossiersQ = supabase
          .from("applications")
          .select("id,title,country,status,created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        const recentPaymentsQ = supabase
          .from("payments")
          .select("id,label,amount_fcfa,status,created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);

        const [
          { data: profileData, error: profileErr },
          { count: dossiersCount, error: dossiersCountErr },
          { count: paymentsCount, error: paymentsCountErr },
          { count: notifCount, error: notifCountErr },
          { data: dossiersData, error: dossiersErr },
          { data: paymentsData, error: paymentsErr },
        ] = await Promise.all([
          profileQ,
          dossiersCountQ,
          paymentsCountQ,
          notifCountQ,
          recentDossiersQ,
          recentPaymentsQ,
        ]);

        if (profileErr) throw profileErr;
        if (dossiersCountErr) throw dossiersCountErr;
        if (paymentsCountErr) throw paymentsCountErr;
        if (notifCountErr) throw notifCountErr;
        if (dossiersErr) throw dossiersErr;
        if (paymentsErr) throw paymentsErr;

        if (!mounted) return;

        setProfile(profileData || null);
        setStats({
          dossiers: dossiersCount ?? 0,
          paiements: paymentsCount ?? 0,
          notifications: notifCount ?? 0,
        });
        setRecentDossiers(dossiersData || []);
        setRecentPayments(paymentsData || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Erreur lors du chargement du dashboard.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <main className="dash">
      <div className="dash__container">
        <div className="dash__header">
          <div>
            <h1 className="dash__title">Tableau de bord Étudiant</h1>
            <p className="dash__subtitle">
              Bienvenue <strong>{displayName}</strong>. Suis tes dossiers, paiements et
              notifications.
            </p>
          </div>

          <div className="dash__actions">
            <button className="dash__btn dash__btn--primary" onClick={() => nav("/student/new-application")}>
              + Nouveau dossier
            </button>
            <button className="dash__btn" onClick={() => nav("/student/messages")}>
              Messages
            </button>
          </div>
        </div>

        {loading && <div className="dash__notice">Chargement…</div>}
        {err && <div className="dash__notice dash__notice--error">❌ {err}</div>}

        <section className="dash__grid">
          <Card title="Mes dossiers" value={stats.dossiers} hint="Suivre l’avancement" />
          <Card title="Paiements" value={stats.paiements} hint="Factures & reçus" />
          <Card title="Notifications" value={stats.notifications} hint="Non lues" />
        </section>

        <section className="dash__two">
          <div className="dash__panel">
            <h2 className="dash__h2">Dossiers récents</h2>

            <div className="dash__list">
              {recentDossiers.length === 0 ? (
                <Empty text="Aucun dossier pour le moment." />
              ) : (
                recentDossiers.map((d) => (
                  <Row
                    key={d.id}
                    title={`${d.title}${d.country ? ` — ${d.country}` : ""}`}
                    meta={`Statut: ${d.status}`}
                    tag={d.status}
                    onClick={() => nav(`/student/dossier/${d.id}`)}
                  />
                ))
              )}
            </div>

            <button className="dash__linkBtn" onClick={() => nav("/student/dossiers")}>
              Voir tous mes dossiers →
            </button>
          </div>

          <div className="dash__panel">
            <h2 className="dash__h2">Mes paiements</h2>

            <div className="dash__list">
              {recentPayments.length === 0 ? (
                <Empty text="Aucun paiement enregistré." />
              ) : (
                recentPayments.map((p) => (
                  <Row
                    key={p.id}
                    title={p.label}
                    meta={`${p.status} • ${formatFcfa(p.amount_fcfa)}`}
                    tag={p.status}
                    onClick={() => nav("/student/paiements")}
                  />
                ))
              )}
            </div>

            <button className="dash__linkBtn" onClick={() => nav("/student/paiements")}>
              Voir l’historique →
            </button>
          </div>
        </section>
      </div>

      <style>{css}</style>
    </main>
  );
}

function formatFcfa(n) {
  const v = Number(n || 0);
  return `${v.toLocaleString("fr-FR")} FCFA`;
}

function Card({ title, value, hint }) {
  return (
    <div className="dashCard">
      <div className="dashCard__top">
        <p className="dashCard__title">{title}</p>
        <p className="dashCard__value">{value}</p>
      </div>
      <p className="dashCard__hint">{hint}</p>
    </div>
  );
}

function Row({ title, meta, tag, onClick }) {
  return (
    <button type="button" className="dashRow dashRow--btn" onClick={onClick}>
      <div className="dashRow__left">
        <p className="dashRow__title">{title}</p>
        <p className="dashRow__meta">{meta}</p>
      </div>
      <span className="dashRow__tag">{tag}</span>
    </button>
  );
}

function Empty({ text }) {
  return <div className="dashEmpty">{text}</div>;
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
.dash__grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px; }
.dashCard{ background:#fff; border-radius: 18px; padding: 14px 16px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.dashCard__top{ display:flex; justify-content:space-between; align-items:baseline; gap: 12px; }
.dashCard__title{ margin:0; color:#334155; font-weight:700; }
.dashCard__value{ margin:0; font-size: 30px; font-weight:900; color:#0e1b3a; }
.dashCard__hint{ margin: 6px 0 0; color:#64748b; }
.dash__two{ display:grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-top: 14px; }
.dash__panel{ background:#fff; border-radius: 18px; padding: 14px 16px; border: 1px solid rgba(0,0,0,0.08); }
.dash__h2{ margin: 0 0 10px; color:#0e1b3a; font-size: 18px; }
.dash__list{ display:flex; flex-direction:column; gap: 10px; }
.dashRow{ display:flex; justify-content:space-between; align-items:center; gap: 12px; padding: 10px 12px; border-radius: 14px; background:#f8fafc; border:1px solid rgba(0,0,0,0.06); width: 100%; text-align: left; }
.dashRow--btn{ cursor:pointer; border:none; }
.dashRow__title{ margin:0; font-weight:800; color:#0e1b3a; }
.dashRow__meta{ margin: 3px 0 0; color:#64748b; font-size: 13px; }
.dashRow__tag{ font-size: 12px; font-weight:900; padding: 6px 10px; border-radius: 999px; background:#0e1b3a; color:#fff; white-space: nowrap; }
.dash__linkBtn{ margin-top: 10px; background: transparent; border: none; color:#0e1b3a; font-weight:900; cursor:pointer; }
.dashEmpty{ padding: 12px; border-radius: 14px; background:#fff; border:1px dashed rgba(0,0,0,0.15); color:#64748b; }
@media (max-width: 900px){
  .dash__header{ flex-direction:column; align-items:flex-start; }
  .dash__grid{ grid-template-columns: 1fr; }
  .dash__two{ grid-template-columns: 1fr; }
}
`;
