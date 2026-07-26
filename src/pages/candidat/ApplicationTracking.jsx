import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { applications, applicationTimeline } from '../../data/candidatMockData';

export default function ApplicationTracking() {
  const { id } = useParams();
  const app = applications.find((a) => String(a.id) === id) || applications[0];

  return (
    <div>
      <Link to="/candidat/candidatures" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}>
        <FiArrowLeft /> Retour à mes candidatures
      </Link>

      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Suivi de candidature</h1>
            <p className="rp-subtitle">{app.role} — {app.company}</p>
          </div>
          <span className={`rp-badge rp-badge--${app.statusClass}`}>{app.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div className="rp-card">
          <div className="rp-card__header"><span className="rp-card__title">Étapes du recrutement</span></div>
          <div className="rp-card__body">
            {applicationTimeline.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {step.done
                    ? <FiCheckCircle size={20} color="var(--success)" />
                    : <FiCircle size={20} color="var(--border)" />}
                  {i < applicationTimeline.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 32, margin: '4px 0', background: step.done ? 'var(--success)' : 'var(--border)' }} />
                  )}
                </div>
                <div style={{ paddingBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: step.done ? 'var(--foreground)' : 'var(--muted-light)' }}>{step.step}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{step.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Documents envoyés</span></div>
            <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiFileText color="var(--primary)" /> CV_Meriem_BenSalem_2026.pdf</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiFileText color="var(--primary)" /> Lettre_Motivation.pdf</div>
            </div>
          </div>

          <div className="rp-card">
            <div className="rp-card__header"><span className="rp-card__title">Message reçu</span></div>
            <div className="rp-card__body">
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', margin: 0 }}>
                « Merci de confirmer votre disponibilité pour l'entretien de jeudi 10h. »
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Nadia K. — Recrutement {app.company}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
