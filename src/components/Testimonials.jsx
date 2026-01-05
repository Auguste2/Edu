import React from "react";

export default function Testimonials() {
  const items = [
    {
      name: "Amadou K.",
      role: "Master en Informatique, Paris",
      quote:
        "Grâce à SAVEDU, j’ai obtenu une bourse en France. L’accompagnement était personnalisé et professionnel.",
      img: "/testimonials/amadu.jpeg",
    },
    {
      name: "Fatimata S.",
      role: "Baccalauréat, Montréal",
      quote:
        "L’équipe SAVEDU m’a aidé avec mon visa pour le Canada. Sans eux, je n’aurais jamais réussi seul.",
      img: "/testimonials/fatimata.jpeg",
    },
    {
      name: "Boubacar T.",
      role: "Ingénieur Civil, New York",
      quote:
        "Orientation parfaite pour choisir ma filière. Maintenant je fais mes rêves aux États-Unis !",
      img: "/testimonials/boubacar.jpeg",
    },
  ];

  return (
  <section className="savedu-testimonials" id="temoignages">
    <div className="container">
      <h2 className="savedu-testimonials__title">Témoignages d&apos;Étudiants</h2>
      <p className="savedu-testimonials__subtitle">
        Ce que disent nos étudiants placés à l&apos;étranger
      </p>
    </div>

    {/* AUTO SCROLL TRACK */}
    <div className="savedu-testimonials__marquee">
  <div className="edge-blur-left" />
  <div className="edge-blur-right" />

  <div className="savedu-testimonials__track">

        {[...items, ...items].map((t, i) => (
          <article className="savedu-testimonials__card" key={i}>
            <div className="savedu-testimonials__quoteBox">
              <span className="savedu-testimonials__quoteMark">“</span>
              <p className="savedu-testimonials__quote">{t.quote}</p>
            </div>

            <div className="savedu-testimonials__meta">
              <img
                className="savedu-testimonials__img"
                src={t.img}
                alt={t.name}
              />
              <div>
                <h4 className="savedu-testimonials__name">{t.name}</h4>
                <p className="savedu-testimonials__role">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
}
