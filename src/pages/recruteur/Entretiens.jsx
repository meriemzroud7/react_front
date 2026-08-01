import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiPlus, FiVideo, FiClock, FiCheckCircle, FiXCircle, FiX,
  FiCalendar, FiEdit2, FiUsers,
} from 'react-icons/fi';
import {
  getEntretiens, getEntretienStats, programmerEntretien,
  modifierEntretien, demarrerEntretien, changerStatut,
} from '../../services/apiServiceEntretien';
import CandidatureService from '../../services/apiServiceCandidature';
import { getOffreById } from '../../services/apiServiceOffres';
import { useAuth } from '../../context/AuthContext';
import '../../styles/entretien-form.css';

const TABS = [
  { key: null, label: 'Tous' },
  { key: 'PROGRAMME', label: 'Programmés' },
  { key: 'CONFIRME', label: 'Confirmés' },
  { key: 'TERMINE', label: 'Terminés' },
  { key: 'ANNULE', label: 'Annulés' },
];

const STATUT_CONFIG = {
  PROGRAMME: { label: 'Programmé', className: 'blue' },
  CONFIRME: { label: 'Confirmé', className: 'green' },
  TERMINE: { label: 'Terminé', className: 'gray' },
  ANNULE: { label: 'Annulé', className: 'red' },
};

const AVATAR_COLORS = ['#1e4fa3', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0891b2'];

function getAvatarColor(seed = '') {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function getUserDisplayName(user) {
  if (!user) return 'Candidat';
  const first = user.prenom || user.firstName;
  const last = user.nom || user.lastName;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return user.email?.split('@')[0] || 'Candidat';
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = { date: '', heure: '', type: 'EN_LIGNE', intervieweurs: '', poste: '' };

export default function Entretiens() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(null);
  const [entretiens, setEntretiens] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [candidatures, setCandidatures] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [offresMap, setOffresMap] = useState({}); // offreId -> { titre }

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  // ouverture directe du formulaire depuis "Planifier un entretien" (Candidatures) ou depuis le Calendrier
  useEffect(() => {
    if (location.state?.preselectCandidatureId) {
      setSelectedCandidatureId(location.state.preselectCandidatureId);
      setShowForm(true);
    } else if (location.state?.openCreateForm) {
      openCreateForm(location.state.prefillDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  async function loadCandidatures() {
    try {
      const list = await CandidatureService.getAll();
      setCandidatures(list);
      const users = await CandidatureService.getUsersByIds(list.map((c) => c.candidatId));
      setUsersMap(users);

      // Le titre du poste vit sur l'offre, pas sur la candidature -> on le résout ici
      const uniqueOffreIds = [...new Set(list.map((c) => c.offreId).filter(Boolean))];
      const offreResults = await Promise.allSettled(uniqueOffreIds.map((id) => getOffreById(id)));
      const offres = {};
      offreResults.forEach((res, i) => {
        if (res.status === 'fulfilled') offres[uniqueOffreIds[i]] = res.value.data;
      });
      setOffresMap(offres);
    } catch (err) {
      console.error(err);
    }
  }

  function getPosteForCandidature(c) {
    return offresMap[c?.offreId]?.titre || '';
  }

  function getCandidatureLabel(c) {
    const nom = getUserDisplayName(usersMap[c.candidatId]);
    const poste = getPosteForCandidature(c);
    return poste ? `${nom} — ${poste}` : nom;
  }

  function openCreateForm(prefillDate) {
    setEditingId(null);
    setSelectedCandidatureId('');
    const storedPrefs = user?.id && localStorage.getItem(`fursa_entretien_prefs_${user.id}`);
    const defaultType = storedPrefs ? JSON.parse(storedPrefs).type : EMPTY_FORM.type;
    setForm({ ...EMPTY_FORM, type: defaultType, ...(prefillDate && { date: prefillDate }) });
    setShowForm(true);
  }

  function openEditForm(entretien) {
    setEditingId(entretien.id);
    setSelectedCandidatureId(entretien.candidatureId || '');
    setForm({
      date: entretien.date || '',
      heure: entretien.heure || '',
      type: entretien.type || 'EN_LIGNE',
      intervieweurs: (entretien.intervieweurs || []).join(', '),
      poste: entretien.poste || '',
    });
    setShowForm(true);
  }

  // Sélection d'un candidat en mode création -> pré-remplit le poste depuis son offre
  function handleSelectCandidature(candidatureId) {
    setSelectedCandidatureId(candidatureId);
    const candidature = candidatures.find((c) => (c.id || c._id) === candidatureId);
    if (candidature) {
      setForm((prev) => ({ ...prev, poste: getPosteForCandidature(candidature) }));
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setSelectedCandidatureId('');
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const intervieweurs = form.intervieweurs.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingId) {
        const candidature = candidatures.find((c) => (c.id || c._id) === selectedCandidatureId);

        await modifierEntretien(editingId, {
          date: form.date,
          heure: form.heure,
          type: form.type,
          intervieweurs,
          poste: form.poste,
          // ré-envoyés seulement si un candidat a été choisi/changé dans le formulaire
          ...(candidature && {
            candidatureId: candidature.id || candidature._id,
            candidatId: candidature.candidatId,
            candidatNom: getUserDisplayName(usersMap[candidature.candidatId]),
          }),
        });
      } else {
        const candidature = candidatures.find((c) => (c.id || c._id) === selectedCandidatureId);
        if (!candidature) {
          alert('Sélectionnez un candidat.');
          return;
        }
        const candidatNom = getUserDisplayName(usersMap[candidature.candidatId]);

        await programmerEntretien({
          candidatureId: candidature.id || candidature._id,
          candidatId: candidature.candidatId,
          candidatNom,
          poste: form.poste || getPosteForCandidature(candidature),
          date: form.date,
          heure: form.heure,
          type: form.type,
          intervieweurs,
        });
      }
      closeForm();
      loadData();
    } catch (err) {
      console.error('Détail erreur backend:', JSON.stringify(err.response?.data, null, 2));
      alert("Échec de l'enregistrement. " + (err.response?.data?.message || ''));
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

  const totalCount = stats?.total ?? entretiens.length;
  const programmesCount = stats?.programmes ?? 0;

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des entretiens</h1>
            <p className="rp-subtitle">{totalCount} entretien{totalCount > 1 ? 's' : ''} · {programmesCount} programmé{programmesCount > 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="rp-btn rp-btn--outline" onClick={() => navigate('/recruteur/calendrier')}>
              <FiCalendar /> Calendrier
            </button>
            <button className="rp-btn rp-btn--primary" onClick={openCreateForm}>
              <FiPlus /> Programmer
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="rp-stats" style={{ marginBottom: '1.25rem' }}>
          <div className="rp-stat"><div className="rp-stat__value">{stats.total}</div><div className="rp-stat__label">Total</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.programmes}</div><div className="rp-stat__label">Programmés</div></div>
          <div className="rp-stat"><div className="rp-stat__value" style={{ color: 'var(--success)' }}>{stats.confirmes}</div><div className="rp-stat__label">Confirmés</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.termines}</div><div className="rp-stat__label">Terminés</div></div>
          <div className="rp-stat"><div className="rp-stat__value">{stats.annules}</div><div className="rp-stat__label">Annulés</div></div>
        </div>
      )}

      <div className="rp-card" style={{ padding: '1.25rem' }}>
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
          <p style={{ padding: '1rem 0', color: 'var(--muted)' }}>Chargement...</p>
        ) : entretiens.length === 0 ? (
          <p style={{ padding: '1rem 0', color: 'var(--muted)' }}>Aucun entretien dans cette catégorie.</p>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Intervieweurs</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entretiens.map((e) => {
                  const statutCfg = STATUT_CONFIG[e.statut] || { label: e.statut, className: 'gray' };
                  const isEnLigne = e.type === 'EN_LIGNE';
                  const isActive = e.statut !== 'TERMINE' && e.statut !== 'ANNULE';

                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <div className="rp-avatar" style={{ width: 38, height: 38, background: getAvatarColor(e.candidatNom || ''), fontSize: '0.78rem', flexShrink: 0 }}>
                            {getInitials(e.candidatNom || '')}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.candidatNom}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{e.poste || '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDateLabel(e.date)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiClock size={12} /> {e.heure}</span>
                      </td>
                      <td><span className={`rp-badge rp-badge--${isEnLigne ? 'blue' : 'amber'}`}>{isEnLigne ? 'En ligne' : 'Présentiel'}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiUsers size={12} /> {(e.intervieweurs || []).join(', ') || '—'}
                        </span>
                      </td>
                      <td><span className={`rp-badge rp-badge--${statutCfg.className}`}>{statutCfg.label}</span></td>
                      <td>
                        <div className="rp-table__actions">
                          {isActive && (
                            <button className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => handleStart(e)} title="Démarrer">
                              <FiVideo size={13} /> Démarrer
                            </button>
                          )}
                          {e.statut === 'TERMINE' && (
                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                              <FiCheckCircle size={13} /> {e.decision || 'Terminé'}
                            </span>
                          )}
                          <button className="rp-btn rp-btn--outline rp-btn--sm" title="Modifier" onClick={() => openEditForm(e)}>
                            <FiEdit2 size={13} />
                          </button>
                          <button className="rp-btn rp-btn--outline rp-btn--sm" title="Voir dans le calendrier" onClick={() => navigate('/recruteur/calendrier')}>
                            <FiCalendar size={13} />
                          </button>
                          {isActive && (
                            <button className="rp-btn rp-btn--danger rp-btn--sm" title="Annuler" onClick={() => handleCancel(e.id)}>
                              <FiXCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="ef-overlay" onClick={closeForm}>
          <form onSubmit={handleSubmit} className="ef-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ef-modal__header">
              <h3>{editingId ? "Modifier l'entretien" : 'Planifier un entretien'}</h3>
              <button type="button" className="ef-modal__close" onClick={closeForm}><FiX /></button>
            </div>

            <div className="ef-field">
              <label>Candidat</label>
              <select required value={selectedCandidatureId} onChange={(e) => handleSelectCandidature(e.target.value)}>
                <option value="" disabled>Sélectionner un candidat</option>
                {candidatures.map((c) => {
                  const id = c.id || c._id;
                  return <option key={id} value={id}>{getCandidatureLabel(c)}</option>;
                })}
              </select>
            </div>

            <div className="ef-field">
              <label>Poste</label>
              <input required placeholder="Ex: Software Engineer" value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} />
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
              <button type="button" className="rp-btn rp-btn--outline" onClick={closeForm}>Annuler</button>
              <button type="submit" className="rp-btn rp-btn--primary">{editingId ? 'Enregistrer' : 'Planifier'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}