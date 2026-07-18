const stats = [
  { value: "15,000+", label: "Offres d'emploi" },
  { value: '85,000+', label: 'Candidats Tunisiens' },
  { value: '2,400+', label: 'Entreprises partenaires' },
  { value: '78%', label: 'Taux de placement IA' },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="container stats__grid">
        {stats.map((s) => (
          <div className="stats__item" key={s.label}>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
