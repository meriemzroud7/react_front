import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiVideo, FiClock, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import {
  getEntretiens, getEntretienStats, programmerEntretien,
  demarrerEntretien, changerStatut,
} from '../../services/apiServiceEntretien';
import CandidatureService from '../../services/apiServiceCandidature';
import '../../styles/entretien-form.css';

const TABS = [
  { key: null, label: 'Tous' },
  { key: 'PROGRAMME', label: 'Programmés' },
  { key: 'CONFIRME', label: 'Confirmés' },
  { key: 'TERMINE', label: 'Terminés' },
  { key: 'ANNULE', label: 'Annulés' },
];

function getUserDisplayName(user) {
  if (!user) return 'Candidat';
  const first = user.prenom || user.firstName;
  const last = user.nom || user.lastName;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return user.email?.split('@')[0] || 'Candidat';
}

export default function Entretiens() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [entretiens, setEntretiens] = useState([]);
  const [stats, setStats] = useState(null);
 const [form, setForm] = useState({ date: '', heure: '', type: 'EN_LIGNE', intervieweurs: '' });
  const [candidatures, setCandidatures] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedCandidatureId, setSelectedCandidatureId] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [entretiensRes, statsRes] = await Promise.all([
        getEntretiens(activeTab),
        getEntretienStats(),
      ]);
      setEntretiens(entretiensRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadCandidatures(); }, []);

  async function loadCandidatures() {
    try {
      const list = await CandidatureService.getAll();
      setCandidatures(list);
      const users = await CandidatureService.getUsersByIds(list.map((c) => c.candidatId));
      setUsersMap(users);
    } catch (err) {
      console.error(err);
    }
  }

  function getCandidatureLabel(c) {
    return getUserDisplayName(usersMap[c.candidatId]);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const candidature = candidatures.find((c) => (c.id || c._id) === selectedCandidatureId);
    if (!candidature) {
      alert('Sélectionnez un candidat.');
      return;
    }

    const candidatNom = getUserDisplayName(usersMap[candidature.candidatId]);

    try {
      await programmerEntretien({
        candidatureId: candidature.id || candidature._id,
        candidatId: candidature.candidatId,
        candidatNom,
        poste: candidature.poste || '', // à ajuster une fois OffreService branché
        date: form.date,
        heure: form.heure,
        type: form.type,
        intervieweurs: form.intervieweurs.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setSelectedCandidatureId('');
      setForm({ date: '', heure: '', type: 'VISIO', intervieweurs: '' });
      loadData();
    } catch (err) {
      console.error('Détail erreur backend:', JSON.stringify(err.response?.data, null, 2));
      alert("Échec de la planification. " + (err.response?.data?.message || ''));
    }
  }

  async function handleStart(entretien) {
    try {
      const res = await demarrerEntretien(entretien.id);
      navigate(`/recruteur/salle-entretien?id=${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Annuler cet entretien ?')) return;
    try {
      await changerStatut(id, 'ANNULE');
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Entretiens</h1>
            <p className="rp-subtitle">Planifiez et gérez les entretiens avec vos candidats</p>
          </div>
          <button className="rp-btn rp-btn--primary" onClick={() => setShowForm(true)}>
            <FiPlus /> Planifier un entretien
          </button>
        </div>
      </div>

      {stats && (
        <div className="rp-stats" style={{ marginBottom: '1.25rem' }}>
          <div className="rp-stat"><div className="rp-stat__value">{stats.total}</div><div className="rp-stat__label">Total</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.programmes}</div><div className="rp-stat__label">Programmés</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.confirmes}</div><div className="rp-stat__label">Confirmés</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.termines}</div><div className="rp-stat__label">Terminés</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.annules}</div><div className="rp-stat__label">Annulés</div></div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.label}
            className={`rp-btn ${activeTab === t.key ? 'rp-btn--primary' : 'rp-btn--outline'} rp-btn--sm`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : entretiens.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun entretien dans cette catégorie.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entretiens.map((e) => (
            <div key={e.id} className="rp-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.candidatNom} — {e.poste}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', gap: '1rem', marginTop: 4 }}>
                  <span><FiClock size={12} /> {e.date} à {e.heure}</span>
                  <span>{e.type}</span>
                  <span>{e.type === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {e.statut !== 'TERMINE' && e.statut !== 'ANNULE' && (
                  <>
                    <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => handleStart(e)}>
                      <FiVideo size={13} /> Démarrer
                    </button>
                    <button className="rp-btn rp-btn--outline rp-btn--sm" onClick={() => handleCancel(e.id)}>
                      <FiXCircle size={13} /> Annuler
                    </button>
                  </>
                )}
                {e.statut === 'TERMINE' && (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                    <FiCheckCircle size={13} /> {e.decision}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="ef-overlay" onClick={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="ef-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ef-modal__header">
              <h3>Planifier un entretien</h3>
              <button type="button" className="ef-modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>

            <div className="ef-field">
              <label>Candidat</label>
              <select required value={selectedCandidatureId} onChange={(e) => setSelectedCandidatureId(e.target.value)}>
                <option value="" disabled>Sélectionner un candidat</option>
                {candidatures.map((c) => {
                  const id = c.id || c._id;
                  return <option key={id} value={id}>{getCandidatureLabel(c)}</option>;
                })}
              </select>
            </div>

            <div className="ef-field-row">
              <div className="ef-field">
                <label>Date</label>
                <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="ef-field">
                <label>Heure</label>
                <input required type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
              </div>
            </div>

            <div className="ef-field">
              <label>Type d'entretien</label>
             <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
  <option value="EN_LIGNE">En ligne</option>
  <option value="PRESENTIEL">Présentiel</option>
</select>
            </div>

            <div className="ef-field">
              <label>Intervieweurs</label>
              <input placeholder="Ex: Mariem K., Karim B." value={form.intervieweurs} onChange={(e) => setForm({ ...form, intervieweurs: e.target.value })} />
            </div>

            <div className="ef-modal__footer">
              <button type="button" className="rp-btn rp-btn--outline" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="rp-btn rp-btn--primary">Planifier</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}