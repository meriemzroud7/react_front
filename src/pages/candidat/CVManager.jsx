import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiFileText, FiDownload, FiTrash2, FiStar, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { getCvsByUser, uploadCv, downloadCv, deleteCv, setDefaultCv } from '../../services/apiServiceCv';
import { useAuth } from '../../context/AuthContext';

// Petit cercle de score, autonome (pas besoin d'un composant MatchScore séparé)
function ScoreCircle({ value = 0, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? '#0f766e' : value >= 40 ? '#d97706' : '#dc2626';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--border-light)" strokeWidth="10"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.24} fontWeight="700" fill="var(--foreground)"
      >
        {value}%
      </text>
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function CVManager() {
  const { user } = useAuth();
  const userId = user?.id; // ⚠️ à changer en user?._id si MongoDB renvoie _id — voir note plus bas

  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCvs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await getCvsByUser(userId);
      setCvs(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger votre CV depuis le serveur.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file || !userId) return;
    try {
      setUploading(true);
      await uploadCv(userId, file);
      await fetchCvs();
    } catch (err) {
      console.error(err);
      alert("Échec de l'analyse du CV. Réessayez.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce CV ?')) return;
    try {
      await deleteCv(id);
      fetchCvs();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSetDefault(cvId) {
    try {
      await setDefaultCv(userId, cvId);
      fetchCvs();
    } catch (err) {
      console.error(err);
    }
  }

  if (!userId) return <p style={{ color: 'red' }}>Utilisateur non connecté.</p>;
  if (loading) return <p>Chargement de votre CV...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const cv = cvs.find((c) => c.isDefault) || cvs[0];

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Mon CV</h1>
            <p className="rp-subtitle">Importez votre CV ou créez-en un en ligne, analysé automatiquement par l'IA</p>
          </div>
        </div>
      </div>

      <input
        type="file" accept=".pdf" ref={fileInputRef}
        onChange={handleFileChange} style={{ display: 'none' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="rp-card">
            <div className="rp-card__body">
              {cv ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(30,79,163,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiFileText size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--foreground)' }}>{cv.fileName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>Importé le {formatDate(cv.uploadDate)}</div>
                      {cv.isDefault && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
                          <FiStar size={11} /> CV par défaut
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="rp-btn rp-btn--outline rp-btn--icon" onClick={() => downloadCv(cv.id, cv.fileName)}>
                      <FiDownload size={14} />
                    </button>
                    <button className="rp-btn rp-btn--danger rp-btn--icon" onClick={() => handleDelete(cv.id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>Aucun CV importé pour le moment.</p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  className="rp-btn rp-btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <FiUploadCloud /> {uploading ? 'Analyse en cours...' : 'Téléverser un nouveau CV'}
                </button>
                {cvs.length > 1 && cv && !cv.isDefault && (
                  <button className="rp-btn rp-btn--outline" onClick={() => handleSetDefault(cv.id)}>
                    Définir par défaut
                  </button>
                )}
              </div>
            </div>
          </div>

          {cv && (
            <div className="rp-card">
              <div className="rp-card__header"><span className="rp-card__title">Extraction automatique</span></div>
              <div className="rp-card__body rp-grid-3">
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Compétences</div>
                  <div className="rp-tags">
                    {cv.competences?.length > 0
                      ? cv.competences.map((s) => <span key={s} className="rp-tag rp-tag--ok">{s}</span>)
                      : <span style={{ fontSize: '0.78rem', color: 'var(--muted-light)' }}>Aucune détectée</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Expériences</div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 14 }}>
                    {cv.experiences?.length > 0
                      ? cv.experiences.map((e, i) => <li key={i}>{e}</li>)
                      : <span style={{ fontSize: '0.78rem', color: 'var(--muted-light)' }}>Aucune détectée</span>}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 8 }}>Diplômes</div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 14 }}>
                    {cv.diplomes?.length > 0
                      ? cv.diplomes.map((e, i) => <li key={i}>{e}</li>)
                      : <span style={{ fontSize: '0.78rem', color: 'var(--muted-light)' }}>Aucun détecté</span>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {cv && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="rp-card">
              <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-light)', textTransform: 'uppercase' }}>Score de qualité du CV</span>
                <ScoreCircle value={cv.qualityScore ?? 0} size={100} />
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
                  {cv.qualityScore >= 70
                    ? 'Bon score ! Quelques ajustements peuvent encore l\'améliorer.'
                    : 'Ce CV peut encore être amélioré.'}
                </p>
              </div>
            </div>

            {cv.suggestions?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card__header"><span className="rp-card__title">Suggestions d'amélioration</span></div>
                <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {cv.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--foreground)' }}>
                      <FiCheckCircle color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}