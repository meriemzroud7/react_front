import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const EVENTS = {
  20: [{ type: 'entretien', label: 'Entretien Yasmine', time: '14:00', color: '#1e4fa3' }],
  22: [{ type: 'entretien', label: 'Entretien Sarra', time: '10:30', color: '#7c3aed' }],
  23: [
    { type: 'entretien', label: 'Entretien Ahmed', time: '15:00', color: '#0f766e' },
    { type: 'reunion', label: 'Réunion RH hebdo', time: '17:00', color: '#d97706' },
  ],
  25: [{ type: 'reunion', label: 'Comité recrutement', time: '09:00', color: '#be185d' }],
  28: [{ type: 'entretien', label: 'Entretien Fathi', time: '11:00', color: '#b45309' }],
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendrier() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [view, setView] = useState('month');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const selectedEvents = EVENTS[selectedDay] || [];

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Calendrier RH</h1>
            <p className="rp-subtitle">Entretiens, réunions et disponibilités</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
              {['month', 'week'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font)',
                  background: view === v ? '#fff' : 'transparent',
                  color: view === v ? 'var(--primary)' : 'var(--muted)',
                  boxShadow: view === v ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s'
                }}>{v === 'month' ? 'Mois' : 'Semaine'}</button>
              ))}
            </div>
            <button className="rp-btn rp-btn--primary"><FiPlus /> Événement</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Calendar grid */}
        <div className="rp-card">
          {/* Month nav */}
          <div className="rp-card__header">
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={prevMonth}><FiChevronLeft size={16} /></button>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{MONTHS[month]} {year}</h2>
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={nextMonth}><FiChevronRight size={16} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, borderBottom: '1px solid var(--border-light)' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasEvents = day && EVENTS[day];
              return (
                <div key={i} onClick={() => day && setSelectedDay(day)} style={{
                  padding: '0.5rem', minHeight: 80, borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)',
                  cursor: day ? 'pointer' : 'default', transition: 'background 0.15s',
                  background: isSelected ? 'rgba(30,79,163,0.06)' : 'transparent',
                }}>
                  {day && (
                    <>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: isToday || isSelected ? 800 : 400, fontSize: '0.875rem',
                        background: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday ? '#fff' : isSelected ? 'var(--primary)' : 'var(--foreground)',
                        marginBottom: '0.25rem'
                      }}>{day}</div>
                      {hasEvents && EVENTS[day].slice(0, 2).map((ev, ei) => (
                        <div key={ei} style={{
                          fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.35rem', borderRadius: 4,
                          background: `${ev.color}18`, color: ev.color, marginBottom: '0.15rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{ev.label}</div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>
          {/* Selected day events */}
          <div className="rp-card">
            <div className="rp-card__header">
              <span className="rp-card__title">
                {selectedDay ? `${selectedDay} ${MONTHS[month]}` : 'Sélectionnez un jour'}
              </span>
            </div>
            <div className="rp-card__body">
              {selectedEvents.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Aucun événement ce jour</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedEvents.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 4, height: '100%', minHeight: 40, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: ev.color }}>{ev.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ev.time} · {ev.type === 'entretien' ? 'Entretien' : 'Réunion'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="rp-btn rp-btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                <FiPlus /> Ajouter un événement
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Légende</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { color: '#1e4fa3', label: 'Entretiens' },
                { color: '#d97706', label: 'Réunions' },
                { color: '#16a34a', label: 'Disponibilités' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
