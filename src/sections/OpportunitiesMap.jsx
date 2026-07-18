const regions = [
  { name: 'Tunis', count: '8,420', x: '45%', y: '25%' },
  { name: 'Sousse', count: '2,150', x: '60%', y: '45%' },
  { name: 'Sfax', count: '3,100', x: '65%', y: '65%' },
  { name: 'Remote', count: '1,330', x: '80%', y: '30%' },
];

export default function OpportunitiesMap() {
  return (
    <section className="map">
      <div className="container map__grid">
        <div>
          <h2>Des opportunités partout en Tunisie</h2>
          <p>
            Que vous cherchiez au cœur de la capitale, sur la côte, ou en télétravail total,
            notre réseau couvre l'ensemble du territoire avec des offres qualifiées.
          </p>
          <div className="map__list">
            {regions.map((r) => (
              <div className="map__list-item" key={r.name}>
                <span>{r.name}</span>
                <div className="map__list-right">
                  <span>{r.count} offres</span>
                  <div className="map__arrow">→</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map__visual">
          {regions.map((r) => (
            <div className="map__pin" style={{ left: r.x, top: r.y }} key={r.name}>
              <div className="map__pin-dot" />
              <div className="map__pin-label">{r.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
