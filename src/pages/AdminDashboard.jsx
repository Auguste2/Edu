import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <section className="dashboard-page">
      <div className="container">
        <h1>🛡️ Tableau de bord Admin</h1>
        <p>Gestion des étudiants, dossiers, messages, etc.</p>

        {/* Quick Actions */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link to="/admin/applications" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.15)",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              📄 Gérer les dossiers (Applications)
            </button>
          </Link>

          {/* Placeholders for later */}
          <button
            type="button"
            disabled
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(0,0,0,0.04)",
              cursor: "not-allowed",
              fontWeight: 700,
            }}
            title="Coming soon"
          >
            👨‍🎓 Étudiants (bientôt)
          </button>

          <button
            type="button"
            disabled
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(0,0,0,0.04)",
              cursor: "not-allowed",
              fontWeight: 700,
            }}
            title="Coming soon"
          >
            ✉️ Messages (bientôt)
          </button>
        </div>

        {/* Info cards (simple) */}
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>🎯 Objectif</div>
            <div style={{ opacity: 0.8, lineHeight: 1.4 }}>
              Examiner les dossiers, changer le statut (pending/reviewing/approved/rejected),
              et ajouter des notes internes.
            </div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>✅ Actions rapides</div>
            <div style={{ opacity: 0.8, lineHeight: 1.4 }}>
              Cliquez sur <b>“Gérer les dossiers”</b> pour voir toutes les applications
              des étudiants.
            </div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>🔒 Sécurité</div>
            <div style={{ opacity: 0.8, lineHeight: 1.4 }}>
              Cette page est accessible uniquement si votre rôle est <b>admin</b>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
