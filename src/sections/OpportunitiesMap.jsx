import { useEffect, useRef, useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/* Data — x/y are % positions computed by projecting each city's real */
/* lon/lat onto the same equirectangular frame as the path below, so  */
/* every pin sits exactly where it belongs on the coastline.          */
/* ------------------------------------------------------------------ */
const REGIONS = [
  { name: 'Tunis',  count: 8420, x: 63.5, y: 25.7, blurb: 'Capitale & Grand Tunis' },
  { name: 'Sousse', count: 2150, x: 72.7, y: 36.3, blurb: 'Sahel & côte centrale' },
  { name: 'Sfax',   count: 3100, x: 76,   y: 48,   blurb: 'Sud-Est industriel' },
  { name: 'Remote', count: 1330, x: 84.5, y: 24.2, blurb: 'Télétravail total' },
];

/* Real Tunisia national outline (viewBox 0 0 300 602.91), simplified   */
/* from the country's official border coordinates (mainland + the      */
/* Djerba and Kerkennah islands). The top of the viewBox carries extra */
/* headroom so pin stacks never get clipped by the panel edge, and the */
/* SVG is rendered at 100% of the panel so these coordinates line up   */
/* exactly with the pins' percentage positions below.                  */
const TUNISIA_PATH =
  'M192.68,144.19 L202.7,150.58 L196.81,157.02 L206.84,161.32 L215.6,156.55 ' +
  'L216.27,152.14 L218.04,150.54 L224.97,151.1 L237.36,141.52 L237.12,139.66 ' +
  'L246.75,137.03 L248.71,139.62 L247.52,140.76 L247.74,143.32 L247.87,143.45 ' +
  'L250.56,146.16 L252.16,151.31 L240.62,161.33 L231.88,177.23 L215.65,182.58 ' +
  'L210.97,186.94 L209.31,199.01 L220.63,218.22 L220.27,219.67 L228.56,222.28 ' +
  'L231.15,221.16 L233.99,221.9 L232.47,226.06 L242.34,230.4 L246.87,231.17 ' +
  'L245.6,236.27 L248.07,239.8 L244.73,248.34 L248.3,253.28 L254.99,257.35 ' +
  'L249.57,258.89 L243.9,270.65 L239.54,275.92 L235.95,284.7 L232.53,286.28 ' +
  'L226.13,295.72 L220.77,296.8 L214.74,303 L207.39,305.47 L199.99,311.67 ' +
  'L188.44,315.27 L181.01,327.3 L182.81,339.87 L190.77,349.48 L202.05,358.43 ' +
  'L210.63,360.86 L223.23,356.6 L227.36,358.52 L226.4,364.78 L224.4,367.78 ' +
  'L224.61,371.04 L230.14,372.05 L239.12,367.76 L240.29,364.76 L238.67,362.87 ' +
  'L241.21,361.05 L246.2,361.6 L251.81,370.76 L249.48,375.6 L255.44,381.29 ' +
  'L280.08,391.06 L281.1,393.87 L276.24,399.58 L273.78,428.6 L280.27,432.45 ' +
  'L282,439 L243.79,455.75 L226.84,469.45 L219.74,469.82 L219.08,476.56 ' +
  'L210.49,485.06 L201.24,484.73 L185.77,504.12 L194.95,527.94 L197.24,538.89 ' +
  'L195.78,546.79 L170.73,575.2 L162.95,576.09 L149.51,580.91 L118.78,462.86 ' +
  'L72.13,435.05 L69.64,414.2 L56.5,399.46 L56.58,395.36 L38.29,390.24 ' +
  'L31.26,379.1 L31.56,375.07 L24.95,365.18 L18,348.75 L18.69,340.37 ' +
  'L19.97,333.38 L23.82,329.61 L26.26,324.93 L36.03,322.74 L40.63,311.07 ' +
  'L47.06,308.92 L64.07,297.17 L64.61,293.91 L68.24,290.63 L65.59,278.32 ' +
  'L69.52,274.81 L69.77,271.55 L79.01,257.79 L69.63,254.58 L68.7,245.28 ' +
  'L73.5,241.3 L71.14,230.62 L66.26,226.23 L65.61,217.86 L66.68,210.19 ' +
  'L69.47,202.26 L68.86,197.15 L74.47,181.78 L72.72,179 L60.35,179.07 ' +
  'L58.31,176.3 L68.06,172.75 L77.24,166.89 L79.23,162 L76.89,157.82 ' +
  'L87.86,156.85 L92.47,153.81 L90.15,151.03 L91.86,145.21 L99.39,145.19 ' +
  'L126.96,126.6 L129.28,126.83 L129.86,128.23 L136.26,127.08 L141.22,124.31 ' +
  'L144.99,125.25 L157.83,120.9 L162.79,120 L170.64,120.75 L170.88,124.7 ' +
  'L183.96,125.74 L192.33,129.78 L196.96,130.52 L190.15,139.05 L192.68,144.19 Z';

/* Djerba and Kerkennah, projected in the same frame */
const TUNISIA_ISLANDS = [
  'M226.18,354.78 L227.24,344.1 L231.99,343.7 L241.43,345.24 L248.04,348.61 ' +
    'L244.02,353.66 L242.86,355.96 L242.79,358.75 L241.12,358.72 L241.47,355.71 ' +
    'L240.36,355.69 L236.68,358.66 L237.18,361.22 L235.5,361.43 L234.49,356.76 ' +
    'L232.59,354.41 L231.2,354.39 L230.31,356.93 L226.18,354.78 Z',
  'M262.91,283.3 L264.76,287.76 L266.13,288.95 L254.46,293.61 L247.32,297.67 ' +
    'L241.47,295.72 L244.34,293.21 L249.97,293.3 L254.25,291.05 L256.6,287.37 ' +
    'L259.12,287.88 L259.7,287.2 L258.96,283.46 L262.91,283.3 Z',
];
const TUNISIA_VIEWBOX = '0 0 300 602.91';

const CONNECTIONS = [
  { from: 'Tunis', to: 'Sousse', c: '66,30' },
  { from: 'Tunis', to: 'Sfax',   c: '58,40' },
  { from: 'Tunis', to: 'Remote', c: '78,18' },
];

const MAX_COUNT = Math.max(...REGIONS.map((r) => r.count));

/* Easing helper for the count-up animation */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function OpportunitiesMap() {
  const [active, setActive] = useState(null);
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(REGIONS.map((r) => [r.name, 0]))
  );
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const visualRef = useRef(null);
  const hasAnimated = useRef(false);

  /* Count-up once the panel scrolls into view */
  useEffect(() => {
    const node = visualRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const duration = 1400;
            const tick = (now) => {
              const p = Math.min(1, (now - start) / duration);
              const e = easeOutCubic(p);
              setCounts(
                Object.fromEntries(
                  REGIONS.map((r) => [r.name, Math.round(r.count * e)])
                )
              );
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  /* Subtle 3D parallax tilt following the pointer */
  const handleMove = (e) => {
    const rect = visualRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px, y: py });
  };
  const handleLeave = () => setTilt({ x: 0, y: 0 });

  const byName = useMemo(
    () => Object.fromEntries(REGIONS.map((r) => [r.name, r])),
    []
  );

  return (
    <section className="tnmap-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        .tnmap-root {
          --ink: #0b1220;
          --muted: #64748b;
          --line: #e7eaf0;
          --blue-900: #0b1c3a;
          --blue-700: #12305e;
          --blue-500: #2f6fed;
          --cyan: #4fd6e8;
          --amber: #ffb545;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--ink);
          background: #fff;
          padding: 64px 24px;
        }
        .tnmap-container {
          max-width: 1180px;
          margin: 0 auto;
        }
        .tnmap-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .tnmap-grid { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ---------- left column ---------- */
        .tnmap-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--blue-500);
          margin-bottom: 14px;
        }
        .tnmap-eyebrow::before {
          content: '';
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--blue-500);
          box-shadow: 0 0 0 0 rgba(47,111,237,0.5);
          animation: tnmap-ping 2.2s ease-out infinite;
        }
        h2.tnmap-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 3.6vw, 42px);
          line-height: 1.08;
          letter-spacing: -0.01em;
          margin: 0 0 18px;
        }
        .tnmap-lede {
          font-size: 16.5px;
          line-height: 1.65;
          color: var(--muted);
          max-width: 46ch;
          margin: 0 0 32px;
        }
        .tnmap-list { display: flex; flex-direction: column; gap: 10px; }
        .tnmap-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease;
        }
        .tnmap-item::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(47,111,237,0.06), transparent 60%);
          opacity: 0;
          transition: opacity .25s ease;
        }
        .tnmap-item:hover,
        .tnmap-item.is-active {
          border-color: var(--blue-500);
          transform: translateX(4px);
          box-shadow: 0 10px 24px -14px rgba(47,111,237,0.45);
        }
        .tnmap-item:hover::before,
        .tnmap-item.is-active::before { opacity: 1; }
        .tnmap-item-left { display: flex; flex-direction: column; gap: 3px; z-index: 1; }
        .tnmap-item-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 16.5px; }
        .tnmap-item-blurb { font-size: 12.5px; color: var(--muted); }
        .tnmap-item-right { display: flex; align-items: center; gap: 14px; z-index: 1; }
        .tnmap-item-count {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 14px;
          color: var(--blue-700);
        }
        .tnmap-arrow {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: grid; place-items: center;
          background: #eef2ff;
          color: var(--blue-700);
          transition: transform .25s ease, background .25s ease, color .25s ease;
        }
        .tnmap-item:hover .tnmap-arrow,
        .tnmap-item.is-active .tnmap-arrow {
          background: var(--blue-500);
          color: #fff;
          transform: translateX(3px);
        }

        /* ---------- right column: the 3D map ---------- */
        .tnmap-visual {
          position: relative;
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          aspect-ratio: 300 / 602.91;
          border-radius: 26px;
          padding: 1px;
          background: linear-gradient(155deg, #1c3a70, #0b1c3a 55%, #071224);
          box-shadow: 0 40px 80px -30px rgba(11,28,58,0.55);
          perspective: 1300px;
        }
        .tnmap-stage {
          position: relative;
          width: 100%; height: 100%;
          border-radius: 27px;
          overflow: hidden;
          background:
            radial-gradient(120% 90% at 75% 10%, rgba(79,214,232,0.14), transparent 55%),
            radial-gradient(90% 70% at 15% 95%, rgba(47,111,237,0.22), transparent 60%),
            linear-gradient(155deg, #0e1f42, #081431 60%, #050c1e);
          transform-style: preserve-3d;
          transition: transform .15s ease-out;
        }

        /* faint HUD grid */
        .tnmap-hud-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 34px 34px;
          mask-image: radial-gradient(85% 75% at 50% 45%, #000 40%, transparent 85%);
        }

        .tnmap-stars span {
          position: absolute;
          width: 2px; height: 2px;
          background: #fff;
          border-radius: 50%;
          opacity: 0.5;
          animation: tnmap-twinkle 3.6s ease-in-out infinite;
        }

        .tnmap-badge {
          position: absolute; top: 20px; left: 20px;
          display: flex; align-items: center; gap: 8px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          color: #cfe0ff;
          z-index: 5;
        }
        .tnmap-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #59f2a3;
          box-shadow: 0 0 8px 1px #59f2a3;
          animation: tnmap-pulse-dot 1.8s ease-in-out infinite;
        }
        .tnmap-coords {
          position: absolute; bottom: 16px; left: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(207,224,255,0.45);
          letter-spacing: 0.06em;
          z-index: 5;
        }

        .tnmap-svg-wrap {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          transform: translateZ(0);
        }
        .tnmap-svg { width: 100%; height: 100%; filter: drop-shadow(0 20px 28px rgba(0,0,0,0.45)); }
        .tnmap-land { fill: url(#tnmap-land-grad); stroke: rgba(140,180,255,0.6); stroke-width: 1.8; }
        .tnmap-sweep {
          transform-origin: 150px 350px;
          animation: tnmap-rotate 7s linear infinite;
        }
        .tnmap-island { fill: url(#tnmap-land-grad); stroke: rgba(140,180,255,0.5); stroke-width: 1.2; }

        .tnmap-links { position: absolute; inset: 0; z-index: 2; }
        .tnmap-link {
          fill: none;
          stroke: url(#tnmap-link-grad);
          stroke-width: 0.5;
          stroke-dasharray: 2.2 2.4;
          animation: tnmap-flow 1.6s linear infinite;
          opacity: 0.85;
        }
        .tnmap-link.is-dim { opacity: 0.18; }

        .tnmap-pin {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%) translateZ(40px);
          z-index: 4;
          cursor: pointer;
        }
        .tnmap-pin-ground {
          position: absolute;
          bottom: -3px; left: 50%;
          width: 26px; height: 8px;
          background: radial-gradient(closest-side, rgba(0,0,0,0.45), transparent 70%);
          transform: translateX(-50%);
          border-radius: 50%;
        }
        .tnmap-pin-label {
          display: flex; flex-direction: column; align-items: center;
          gap: 1px;
          padding: 5px 10px 6px;
          border-radius: 10px;
          background: rgba(8,16,36,0.85);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(4px);
          white-space: nowrap;
          margin-bottom: 6px;
          opacity: 0;
          transform: translateY(4px) scale(0.92);
          animation: tnmap-pin-in .5s ease forwards;
          transition: border-color .2s ease, background .2s ease;
        }
        .tnmap-pin-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 11.5px; color: #fff; }
        .tnmap-pin-count { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #9fc3ff; }
        .tnmap-pin.is-active .tnmap-pin-label,
        .tnmap-pin:hover .tnmap-pin-label {
          border-color: var(--cyan);
          background: rgba(12,26,54,0.95);
        }

        .tnmap-pin-ring-wrap { position: relative; width: 14px; height: 14px; }
        .tnmap-pin-ring {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 1.5px solid var(--cyan);
          opacity: 0;
          animation: tnmap-ring 2.4s ease-out infinite;
        }
        .tnmap-pin-dot {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 30%, #eafcff, var(--cyan) 45%, #1c8fa6 100%);
          box-shadow: 0 0 10px 2px rgba(79,214,232,0.7);
        }
        .tnmap-pin.is-active .tnmap-pin-dot,
        .tnmap-pin:hover .tnmap-pin-dot {
          background: radial-gradient(circle at 32% 30%, #fff7e8, var(--amber) 45%, #b3711a 100%);
          box-shadow: 0 0 14px 3px rgba(255,181,69,0.85);
        }
        .tnmap-pin-tower {
          width: 3px;
          margin-top: 6px;
          border-radius: 2px 2px 0 0;
          background: linear-gradient(180deg, rgba(79,214,232,0.9), rgba(79,214,232,0));
          animation: tnmap-grow .8s cubic-bezier(.2,.8,.2,1) both;
        }
        .tnmap-pin.is-active .tnmap-pin-tower,
        .tnmap-pin:hover .tnmap-pin-tower {
          background: linear-gradient(180deg, rgba(255,181,69,0.95), rgba(255,181,69,0));
        }

        /* ---------- keyframes ---------- */
        @keyframes tnmap-rotate { to { transform: rotate(360deg); } }
        @keyframes tnmap-flow { to { stroke-dashoffset: -40; } }
        @keyframes tnmap-ring {
          0% { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes tnmap-pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.35; }
        }
        @keyframes tnmap-ping {
          0% { box-shadow: 0 0 0 0 rgba(47,111,237,0.45); }
          100% { box-shadow: 0 0 0 8px rgba(47,111,237,0); }
        }
        @keyframes tnmap-twinkle {
          0%, 100% { opacity: 0.15; } 50% { opacity: 0.7; }
        }
        @keyframes tnmap-pin-in {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tnmap-grow {
          from { height: 0 !important; opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tnmap-sweep, .tnmap-link, .tnmap-pin-ring, .tnmap-badge-dot,
          .tnmap-eyebrow::before, .tnmap-stars span, .tnmap-pin-tower {
            animation: none !important;
          }
        }
      `}</style>

      <div className="tnmap-container">
        <div className="tnmap-grid">
          {/* ---------------- left: copy + list ---------------- */}
          <div>
            <span className="tnmap-eyebrow">Réseau national</span>
            <h2 className="tnmap-title">Des opportunités partout en Tunisie</h2>
            <p className="tnmap-lede">
              Que vous cherchiez au cœur de la capitale, sur la côte, ou en télétravail
              total, notre réseau couvre l'ensemble du territoire avec des offres
              qualifiées.
            </p>

            <div className="tnmap-list">
              {REGIONS.map((r) => (
                <div
                  key={r.name}
                  className={`tnmap-item${active === r.name ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(r.name)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(r.name)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                >
                  <div className="tnmap-item-left">
                    <span className="tnmap-item-name">{r.name}</span>
                    <span className="tnmap-item-blurb">{r.blurb}</span>
                  </div>
                  <div className="tnmap-item-right">
                    <span className="tnmap-item-count">
                      {counts[r.name].toLocaleString('en-US')} offres
                    </span>
                    <div className="tnmap-arrow">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- right: animated 3D map ---------------- */}
          <div
            className="tnmap-visual"
            ref={visualRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            <div
              className="tnmap-stage"
              style={{
                transform: `rotateX(${tilt.y * -7}deg) rotateY(${tilt.x * 9}deg)`,
              }}
            >
              <div className="tnmap-hud-grid" />

              <div className="tnmap-stars">
                {[...Array(18)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      left: `${(i * 37) % 100}%`,
                      top: `${(i * 53) % 100}%`,
                      animationDelay: `${(i % 6) * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              <div className="tnmap-badge">
                <span className="tnmap-badge-dot" />
                RÉSEAU EN LIGNE
              </div>
              <div className="tnmap-coords">36.8189° N · 10.1658° E — TN</div>

              {/* silhouette + radar sweep */}
              <div className="tnmap-svg-wrap">
                <svg className="tnmap-svg" viewBox={TUNISIA_VIEWBOX}>
                  <defs>
                    <linearGradient id="tnmap-land-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2a4f8f" />
                      <stop offset="55%" stopColor="#183463" />
                      <stop offset="100%" stopColor="#0d2145" />
                    </linearGradient>
                    <radialGradient id="tnmap-sweep-grad" cx="0.5" cy="0.5" r="0.65">
                      <stop offset="0%" stopColor="rgba(79,214,232,0.55)" />
                      <stop offset="60%" stopColor="rgba(79,214,232,0.05)" />
                      <stop offset="100%" stopColor="rgba(79,214,232,0)" />
                    </radialGradient>
                    <clipPath id="tnmap-clip">
                      <path d={TUNISIA_PATH} />
                    </clipPath>
                  </defs>

                  <path className="tnmap-land" d={TUNISIA_PATH} />
                  {TUNISIA_ISLANDS.map((d, i) => (
                    <path key={i} className="tnmap-island" d={d} />
                  ))}

                  <g clipPath="url(#tnmap-clip)">
                    <g className="tnmap-sweep">
                      <polygon
                        points="150,350 150,60 400,190"
                        fill="url(#tnmap-sweep-grad)"
                      />
                    </g>
                  </g>
                </svg>
              </div>

              {/* connection lines */}
              <svg
                className="tnmap-links"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="tnmap-link-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4fd6e8" />
                    <stop offset="100%" stopColor="#2f6fed" />
                  </linearGradient>
                </defs>
                {CONNECTIONS.map((conn) => {
                  const from = byName[conn.from];
                  const to = byName[conn.to];
                  const dim =
                    active && active !== conn.from && active !== conn.to;
                  return (
                    <path
                      key={conn.from + conn.to}
                      className={`tnmap-link${dim ? ' is-dim' : ''}`}
                      d={`M${from.x},${from.y} Q${conn.c} ${to.x},${to.y}`}
                    />
                  );
                })}
              </svg>

              {/* pins */}
              {REGIONS.map((r, i) => {
                const towerH = 16 + (r.count / MAX_COUNT) * 46;
                return (
                  <div
                    key={r.name}
                    className={`tnmap-pin${active === r.name ? ' is-active' : ''}`}
                    style={{
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                    onMouseEnter={() => setActive(r.name)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <div
                      className="tnmap-pin-label"
                      style={{ animationDelay: `${0.3 + i * 0.12}s` }}
                    >
                      <span className="tnmap-pin-name">{r.name}</span>
                      <span className="tnmap-pin-count">
                        {counts[r.name].toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="tnmap-pin-ring-wrap">
                      <div className="tnmap-pin-ring" />
                      <div
                        className="tnmap-pin-ring"
                        style={{ animationDelay: '1.2s' }}
                      />
                      <div className="tnmap-pin-dot" />
                    </div>
                    <div
                      className="tnmap-pin-tower"
                      style={{
                        height: `${towerH}px`,
                        animationDelay: `${0.15 + i * 0.12}s`,
                      }}
                    />
                    <div className="tnmap-pin-ground" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}