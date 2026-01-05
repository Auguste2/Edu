import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ContactPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const onChange = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", msg: "" });

    if (!form.full_name.trim() || !form.email.trim() || !form.message.trim()) {
      setFeedback({ type: "error", msg: "Nom, email et message sont obligatoires." });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("contact_messages").insert([
        {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          message: form.message.trim(),
        },
      ]);

      if (error) throw error;

      setFeedback({ type: "success", msg: "Message envoyé ✅ Nous vous répondrons bientôt." });
      setForm({ full_name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setFeedback({ type: "error", msg: err?.message || "Erreur lors de l’envoi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-page__container">
        <div className="auth-card">
          <h2 className="auth-card__title">Contact</h2>
          <p className="auth-card__subtitle">
            Dites-nous votre projet (pays, université, bourse, visa…).
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            <div className="grid-2">
              <label className="field">
                <span>Nom complet</span>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={onChange}
                  placeholder="Votre nom"
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="ex: nom@email.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="field">
              <span>Téléphone (optionnel)</span>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+226 ..."
              />
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={6}
                placeholder="Expliquez votre besoin…"
              />
            </label>

            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? "Envoi..." : "Envoyer"}
            </button>

            {feedback.msg && (
              <p
                className={`form-msg ${
                  feedback.type === "success" ? "form-msg--success" : "form-msg--error"
                }`}
              >
                {feedback.type === "success" ? "✅ " : "❌ "}
                {feedback.msg}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
