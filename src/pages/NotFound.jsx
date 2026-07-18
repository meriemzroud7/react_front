import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
      background: 'var(--background)',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        style={{
          background: 'var(--primary)', color: '#fff', padding: '0.8rem 1.6rem',
          borderRadius: 'var(--radius-sm)', fontWeight: 600,
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
