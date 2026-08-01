import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiPlus, FiClock } from 'react-icons/fi';
import { getEntretiens } from '../../services/apiServiceEntretien';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUT_COLORS = {
  PROGRAMME: '#1c4487',
  CONFIRME: '#16a34a',
  TERMINE: '#64748b',
  ANNULE: '#dc2626',
};
const STATUT_LABELS = {
  PROGRAMME: 'Programmé',
  CONFIRME: 'Confirmé',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function pad2(n) { return String(n).padStart(2, '0'); }

export default function Calendrier() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEntretiens()
      .then((res) => setEntretiens(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // regroupe les entretiens du mois affiché, par jour (e.date est au format 'YYYY-MM-DD')
  const eventsByDay = useMemo(() => {
    const map = {};
    entretiens.forEach((e) => {
      if (!e.date) return;
      const [y, m, d] = e.date.split('-').map(Number);
      if (y !== year || m - 1 !== month) return;
      if (!map[d]) map[d] = [];
      map[d].push({
        id: e.id,
        label: `Entretien ${e.candidatNom || ''}`.trim(),
        time: e.heure,
        color: STATUT_COLORS[e.statut] || '#64748b',
        statut: e.statut,
      });
    });
    Object.values(map).forEach((list) => list.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    return map;
  }, [entretiens, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };

  const selectedDateStr = selectedDay ? `${year}-${pad2(month + 1)}-${pad2(selectedDay)}` : null;
  const selectedEvents = (selectedDay && eventsByDay[selectedDay]) || [];

  function goToPlanifier(prefillDate) {
    navigate('/recruteur/entretiens', { state: { openCreateForm: true, prefillDate } });
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Calendrier RH</h1>
            <p className="rp-subtitle">Vue mensuelle de vos entretiens</p>
          </div>
          <button className="rp-btn rp-btn--primary" onClick={() => goToPlanifier(selectedDateStr)}>
            <FiPlus /> Programmer un entretien
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Calendar grid */}
        <div className="rp-card">
          <div className="rp-card__header">
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={prevMonth}><FiChevronLeft size={16} /></button>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{MONTHS[month]} {year}</h2>
            <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={nextMonth}><FiChevronRight size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, borderBottom: '1px solid var(--border-light)' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const dayEvents = day && eventsByDay[day];
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
                        marginBottom: '0.25rem',
                      }}>{day}</div>
                      {dayEvents && dayEvents.slice(0, 2).map((ev, ei) => (
                        <div key={ei} style={{
                          fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.35rem', borderRadius: 4,
                          background: `${ev.color}18`, color: ev.color, marginBottom: '0.15rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{ev.label}</div>
                      ))}
                      {dayEvents && dayEvents.length > 2 && (
                        <div style={{ fontSize: '0.62rem', color: 'var(--muted-light)', fontWeight: 600 }}>+{dayEvents.length - 2} autre(s)</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {loading && <p style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontSize: '0.8rem' }}>Chargement des entretiens...</p>}
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>
          <div className="rp-card">
            <div className="rp-card__header">
              <span className="rp-card__title">
                {selectedDay ? `${selectedDay} ${MONTHS[month]}` : 'Sélectionnez un jour'}
              </span>
            </div>
            <div className="rp-card__body">
              {selectedEvents.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Aucun entretien ce jour</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedEvents.map((ev, i) => (
                    <div
                      key={i}
                      onClick={() => navigate('/recruteur/entretiens')}
                      style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}
                    >
                      <div style={{ width: 4, alignSelf: 'stretch', minHeight: 40, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: ev.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiClock size={11} /> {ev.time} · {STATUT_LABELS[ev.statut] || ev.statut}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="rp-btn rp-btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={() => goToPlanifier(selectedDateStr)}>
                <FiPlus /> Programmer un entretien
              </button>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Légende</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUT_COLORS[key] }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}