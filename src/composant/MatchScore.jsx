import React from 'react';

export default function MatchScore({ value, size = 64, label }) {
  const color = value >= 85 ? 'var(--success)' : value >= 65 ? 'var(--primary)' : 'var(--accent-dark)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${value * 3.6}deg, var(--border-light) 0deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: size - 10,
            height: size - 10,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: size * 0.24,
            color: 'var(--foreground)',
          }}
        >
          {value}%
        </div>
      </div>
      {label && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>}
    </div>
  );
}
