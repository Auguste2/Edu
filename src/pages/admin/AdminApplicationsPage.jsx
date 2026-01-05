import React from "react";
import { supabase } from "../../lib/supabaseClient";

const STATUSES = ["pending", "reviewing", "approved", "rejected"];

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function AdminApplicationsPage() {
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sort, setSort] = React.useState("newest"); // newest | oldest

  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState("");

  const [edit, setEdit] = React.useState({}); // { [id]: { status, notes } }

  async function load() {
    setError("");
    setLoading(true);

    let q = supabase
      .from("applications")
      .select(`
        id,
        student_id,
        title,
        program,
        intake,
        status,
        notes,
        created_at,
        updated_at,
        user_profiles:student_id (
          id,
          full_name,
          role
        )
      `);

    if (statusFilter !== "all") q = q.eq("status", statusFilter);

    if (query.trim()) {
      // Search title/program/intake + student name (via join is limited)
      // We'll do server filter on application fields, and client-filter for name.
      const term = query.trim();
      q = q.or(`title.ilike.%${term}%,program.ilike.%${term}%,intake.ilike.%${term}%`);
    }

    q = q.order("created_at", { ascending: sort === "oldest" });

    const { data, error: e } = await q;

    if (e) {
      console.error(e);
      setError(e.message || "Failed to load applications");
      setRows([]);
    } else {
      const normalized = (data ?? []).map((r) => ({
        ...r,
        student_name: r.user_profiles?.full_name || "(no name)",
      }));

      // Client-side filter for student name when query is set
      const term = query.trim().toLowerCase();
      const filtered = term
        ? normalized.filter((r) => {
            const hay = [
              r.title,
              r.program,
              r.intake,
              r.status,
              r.student_name,
              r.student_id,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(term);
          })
        : normalized;

      setRows(filtered);

      // Prime edit state
      const initialEdit = {};
      for (const r of filtered) {
        initialEdit[r.id] = { status: r.status, notes: r.notes ?? "" };
      }
      setEdit(initialEdit);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sort]);

  async function saveRow(id) {
    setError("");
    const payload = edit[id];
    if (!payload) return;

    setSavingId(id);

    const { error: e } = await supabase
      .from("applications")
      .update({
        status: payload.status,
        notes: payload.notes,
      })
      .eq("id", id);

    if (e) {
      console.error(e);
      setError(e.message || "Update failed");
    } else {
      await load();
    }

    setSavingId(null);
  }

  async function deleteRow(id) {
    setError("");
    const ok = window.confirm("Delete this application permanently?");
    if (!ok) return;

    setDeletingId(id);

    const { error: e } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (e) {
      console.error(e);
      setError(e.message || "Delete failed");
    } else {
      await load();
    }

    setDeletingId(null);
  }

  function onEditChange(id, field, value) {
    setEdit((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setSort("newest");
    load();
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Admin • Student Applications</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Review, approve/reject, leave notes, and delete applications.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 220px auto",
          gap: 12,
          alignItems: "center",
          margin: "16px 0 12px",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, program, intake, student name, student_id..."
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            outline: "none",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={load}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              cursor: "pointer",
              background: "white",
            }}
          >
            Refresh
          </button>
          <button
            onClick={resetFilters}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              cursor: "pointer",
              background: "white",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            margin: "12px 0",
            padding: 12,
            borderRadius: 12,
            background: "rgba(255, 0, 0, 0.08)",
            border: "1px solid rgba(255, 0, 0, 0.2)",
          }}
        >
          <b>Error:</b> {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 24 }}>Loading applications…</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 24, opacity: 0.8 }}>No applications found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                <th style={th}>Student</th>
                <th style={th}>Application</th>
                <th style={th}>Status</th>
                <th style={th}>Notes</th>
                <th style={th}>Created</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const e = edit[r.id] || { status: r.status, notes: r.notes ?? "" };
                const isBusy = savingId === r.id || deletingId === r.id;

                return (
                  <tr key={r.id} style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                    <td style={td}>
                      <div style={{ fontWeight: 650 }}>{r.student_name}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{r.student_id}</div>
                    </td>

                    <td style={td}>
                      <div style={{ fontWeight: 650 }}>{r.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.85 }}>
                        {r.program ? <span>Program: {r.program}</span> : null}
                        {r.program && r.intake ? <span> • </span> : null}
                        {r.intake ? <span>Intake: {r.intake}</span> : null}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>
                        Updated: {formatDate(r.updated_at)}
                      </div>
                    </td>

                    <td style={td}>
                      <select
                        value={e.status}
                        onChange={(ev) => onEditChange(r.id, "status", ev.target.value)}
                        disabled={isBusy}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(0,0,0,0.15)",
                          width: 160,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={td}>
                      <textarea
                        value={e.notes}
                        onChange={(ev) => onEditChange(r.id, "notes", ev.target.value)}
                        disabled={isBusy}
                        rows={3}
                        style={{
                          width: 320,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(0,0,0,0.15)",
                          resize: "vertical",
                        }}
                        placeholder="Internal admin notes..."
                      />
                    </td>

                    <td style={td}>{formatDate(r.created_at)}</td>

                    <td style={td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => saveRow(r.id)}
                          disabled={isBusy}
                          style={btnPrimary}
                        >
                          {savingId === r.id ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={() => deleteRow(r.id)}
                          disabled={isBusy}
                          style={btnDanger}
                        >
                          {deletingId === r.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Tip: search works across title/program/intake/student name/student_id.
          </div>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "12px 12px",
  fontSize: 13,
  letterSpacing: 0.2,
};

const td = {
  padding: "12px 12px",
  verticalAlign: "top",
  borderTop: "1px solid rgba(0,0,0,0.08)",
};

const btnPrimary = {
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  cursor: "pointer",
  background: "white",
  fontWeight: 650,
};

const btnDanger = {
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,0,0,0.35)",
  cursor: "pointer",
  background: "rgba(255,0,0,0.06)",
  fontWeight: 650,
};
