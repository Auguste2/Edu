import React from "react";
import Testimonials from "../components/Testimonials";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-dark" id="accueil">
        <div className="container">
          <h1 className="hero-title-dark">
            Votre Excellence Académique{" "}
            <span className="highlight-gold">Commence avec SAVEDU</span>
          </h1>
          <p className="hero-text-dark">
            Accompagnement personnalisé pour vos études à l&apos;étranger. Nos
            experts locaux vous guident vers les meilleures universités avec des
            bourses et une assistance visa.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Nos Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>🎓 Orientation Universitaire</h3>
              <p>Conseils personnalisés pour choisir la meilleure filière</p>
            </div>
            <div className="service-card">
              <h3>💰 Bourses d&apos;Études</h3>
              <p>Recherche de financement complet pour vos études</p>
            </div>
            <div className="service-card">
              <h3>🛂 Assistance Visa</h3>
              <p>Support complet pour l&apos;obtention du visa étudiant</p>
            </div>
            <div className="service-card">
              <h3>🌍 Partenariats Internationaux</h3>
              <p>Réseau d&apos;universités partenaires à travers le monde</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (image + text) */}
      <Testimonials />

      {/* CONTACT INFO CARD (like your screenshot) */}
      <section className="contact-info-section" id="contact-info">
        <div className="container">
          <h2 className="contact-title">
            Contactez <span>SAVEDU</span>
          </h2>

          <div className="contact-card">
            <div className="contact-row">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Adresse :</strong>
                <p>Ouagadougou, Burkina Faso</p>
              </div>
            </div>

            <div className="contact-row">
              <span className="contact-icon">📞</span>
              <div>
                <strong>Téléphone :</strong>
                <p>+226 70 12 34 56</p>
              </div>
            </div>

            <div className="contact-row">
              <span className="contact-icon">✉️</span>
              <div>
                <strong>Email :</strong>
                <p>contact@savedu.bf</p>
              </div>
            </div>

            <div className="contact-row">
              <span className="contact-icon">⏰</span>
              <div>
                <strong>Horaires :</strong>
                <p>Lundi – Vendredi, 8h–18h</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
