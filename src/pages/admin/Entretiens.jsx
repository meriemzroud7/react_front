import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiEye, FiEdit2, FiXCircle, FiRefreshCw, FiClipboard, FiVideo, FiMapPin } from 'react-icons/fi';
import CandidatureService from '../../services/apiServiceCandidature'; // pour getUsersByIds
import { getOffreById } from '../../services/apiServiceOffres';
import {
  getEntretiens,
  modifierEntretien,
  changerStatut,
  enregistrerEvaluation,
} from '../../services/apiServiceEntretien'; // adapte le chemin selon ton projet

// --- Mapping statut backend <-> libellé affiché ---
// Adapte les clés à gauche à ton enum StatutEntretien exact côté Java
const STATUT_BACKEND_TO_LABEL = {
  PROGRAMME: 'Programmé',
  CONFIRME: 'Confirmé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

// --- Mapping type backend <-> libellé affiché ---
const TYPE_BACKEND_TO_LABEL = {
  ONLINE: 'En ligne',
  EN_LIGNE: 'En ligne',
  PRESENTIEL: 'Présentiel',
};

function statusToBadge(label) {
  switch (label) {
    case 'Programmé':
      return 'blue';
    case 'Confirmé':
      return 'green';
    case 'En cours':
      return 'amber';
    case 'Terminé':
      return 'gray';
    case 'Annulé':
      return 'red';
    default:
      return 'gray';
  }
}

function extractEntreprise(offre) {
  if (!offre) return '-';
  return (
    offre.entreprise?.nom ||
    (typeof offre.entreprise === 'string' ? offre.entreprise : null) ||
    offre.entrepriseNom ||
    offre.nomEntreprise ||
    offre.company ||
    '-'
  );
}

function splitDateHeure(entretien) {
  // Gère soit un champ unique dateEntretien (ISO datetime), soit deux champs séparés date/heure
  if (entretien.date && entretien.heure) {
    return { date: entretien.date, heure: entretien.heure };
  }
  const raw = entretien.dateEntretien || entretien.dateHeure;
  if (!raw) return { date: '-', heure: '-' };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: raw, heure: '-' };
  return {
    date: d.toLocaleDateString('fr-FR'),
    heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function Entretiens() {
  const [query, setQuery] = useState('');
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Récupérer tous les entretiens
        const { data: rawEntretiens } = await getEntretiens();

        // 2. Récupérer candidats + recruteurs (dédupliqués) en parallèle
        const userIds = rawEntretiens.flatMap(e => [e.candidatId, e.recruteurId]);
        const usersMap = await CandidatureService.getUsersByIds(userIds);

        // 3. Récupérer les offres (dédupliquées) en parallèle
        const uniqueOffreIds = [...new Set(rawEntretiens.map(e => e.offreId).filter(Boolean))];
        const offresResults = await Promise.allSettled(
          uniqueOffreIds.map(id => getOffreById(id).then(r => r.data))
        );
        const offresMap = {};
        offresResults.forEach((res, i) => {
          if (res.status === 'fulfilled') offresMap[uniqueOffreIds[i]] = res.value;
        });

        // 4. Construire les lignes affichées
        const rows = rawEntretiens.map(e => {
          const candidat = usersMap[e.candidatId];
          const recruteur = usersMap[e.recruteurId];
          const offre = offresMap[e.offreId];
          const { date, heure } = splitDateHeure(e);

          const fullName = (u) =>
            u ? `${u.prenom || u.firstName || ''} ${u.nom || u.lastName || ''}`.trim() || u.email : null;

          return {
            id: e.id,
            candidatId: e.candidatId,
            recruteurId: e.recruteurId,
            offreId: e.offreId,
            candidate: candidat ? fullName(candidat) : (e.candidatId ? `Candidat #${e.candidatId}` : '-'),
            recruiter: recruteur ? fullName(recruteur) : (e.recruteurId ? `Recruteur #${e.recruteurId}` : '-'),
            offer: offre?.titre || offre?.title || (e.offreId ? `Offre #${e.offreId}` : '-'),
            company: extractEntreprise(offre),
            date,
            heure,
            rawDate: e.dateEntretien || e.dateHeure || e.date,
            type: TYPE_BACKEND_TO_LABEL[e.type] || e.type || 'En ligne',
            typeBackend: e.type,
            status: STATUT_BACKEND_TO_LABEL[e.statut] || e.statut || 'Programmé',
            statutBackend: e.statut,
            lien: e.lienVisio || e.lien,
            adresse: e.adresse || e.lieu,
          };
        });

        if (!cancelled) setEntretiens(rows);
      } catch (err) {
        console.error('Erreur lors du chargement des entretiens :', err);
        if (!cancelled) setError("Impossible de charger les entretiens depuis le serveur.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => entretiens.filter(e => e.candidate.toLowerCase().includes(query.toLowerCase())),
    [entretiens, query]
  );

  async function handleAnnuler(id) {
    if (!window.confirm('Annuler cet entretien ?')) return;
    try {
      await changerStatut(id, 'ANNULE');
      setEntretiens(prev =>
        prev.map(e => (e.id === id ? { ...e, status: 'Annulé', statutBackend: 'ANNULE' } : e))
      );
    } catch (err) {
      console.error("Erreur lors de l'annulation :", err);
      alert("L'annulation a échoué.");
    }
  }

  async function handleReprogrammer(entretien) {
    const currentDate = entretien.rawDate ? new Date(entretien.rawDate).toISOString().slice(0, 16) : '';
    const nouvelleDate = window.prompt(
      'Nouvelle date et heure (AAAA-MM-JJTHH:mm) :',
      currentDate
    );
    if (!nouvelleDate) return;
    try {
      const { data } = await modifierEntretien(entretien.id, {
        dateEntretien: nouvelleDate,
        statut: 'PROGRAMME',
      });
      const { date, heure } = splitDateHeure(data);
      setEntretiens(prev =>
        prev.map(e =>
          e.id === entretien.id
            ? { ...e, date, heure, rawDate: data.dateEntretien || nouvelleDate, status: 'Programmé', statutBackend: 'PROGRAMME' }
            : e
        )
      );
    } catch (err) {
      console.error('Erreur lors de la reprogrammation :', err);
      alert('La reprogrammation a échoué.');
    }
  }

  async function handleEvaluation(entretien) {
    const note = window.prompt('Note d\'évaluation (0-20) :');
    if (note === null) return;
    const commentaire = window.prompt('Commentaire :') || '';
    try {
      await enregistrerEvaluation(entretien.id, { note: Number(note), commentaire });
      alert('Évaluation enregistrée.');
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'évaluation :", err);
      alert("L'enregistrement de l'évaluation a échoué.");
    }
  }

  function handleVoir(entretien) {
    const lignes = [
      `Candidat : ${entretien.candidate}`,
      `Recruteur : ${entretien.recruiter}`,
      `Offre : ${entretien.offer} (${entretien.company})`,
      `Date : ${entretien.date} à ${entretien.heure}`,
      `Type : ${entretien.type}`,
      `Statut : ${entretien.status}`,
      entretien.lien ? `Lien : ${entretien.lien}` : null,
      entretien.adresse ? `Adresse : ${entretien.adresse}` : null,
    ].filter(Boolean);
    alert(lignes.join('\n'));
  }

  function handleModifier(entretien) {
    // Édition rapide du type ; pour un vrai formulaire, remplace ceci par un modal dédié
    const nouveauType = window.prompt(
      'Type d\'entretien (ONLINE / PRESENTIEL) :',
      entretien.typeBackend || 'ONLINE'
    );
    if (!nouveauType) return;
    modifierEntretien(entretien.id, { type: nouveauType.toUpperCase() })
      .then(({ data }) => {
        setEntretiens(prev =>
          prev.map(e =>
            e.id === entretien.id
              ? { ...e, type: TYPE_BACKEND_TO_LABEL[data.type] || data.type, typeBackend: data.type }
              : e
          )
        );
      })
      .catch(err => {
        console.error('Erreur lors de la modification :', err);
        alert('La modification a échoué.');
      });
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">Gestion des Entretiens</h1>
            <p className="rp-subtitle">{filtered.length} entretien(s) planifiés ou réalisés</p>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-filters">
          <div className="rp-filter-input" style={{ flex: 1, maxWidth: 320 }}>
            <FiSearch className="rp-filter-icon" />
            <input
              placeholder="Rechercher un candidat..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {loading && <p style={{ padding: '1rem' }}>Chargement des entretiens...</p>}
        {error && <p style={{ padding: '1rem', color: 'crimson' }}>{error}</p>}

        {!loading && !error && (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Recruteur</th>
                  <th>Offre</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.candidate}</td>
                    <td>{e.recruiter}</td>
                    <td>{e.offer}</td>
                    <td>{e.date}</td>
                    <td>{e.heure}</td>
                    <td>
                      <span className="rp-badge rp-badge--blue">
                        {e.type === 'En ligne' ? <FiVideo size={11} /> : <FiMapPin size={11} />} {e.type}
                      </span>
                    </td>
                    <td>
                      <span className={`rp-badge rp-badge--${statusToBadge(e.status)}`}>{e.status}</span>
                    </td>
                    <td>
                      <div className="rp-table__actions">
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Consulter" onClick={() => handleVoir(e)}>
                          <FiEye size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Modifier" onClick={() => handleModifier(e)}>
                          <FiEdit2 size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Reprogrammer" onClick={() => handleReprogrammer(e)}>
                          <FiRefreshCw size={14} />
                        </button>
                        <button className="rp-btn rp-btn--outline rp-btn--icon" title="Évaluations" onClick={() => handleEvaluation(e)}>
                          <FiClipboard size={14} />
                        </button>
                        <button
                          className="rp-btn rp-btn--danger rp-btn--icon"
                          title="Annuler"
                          onClick={() => handleAnnuler(e.id)}
                          disabled={e.statutBackend === 'ANNULE'}
                        >
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      Aucun entretien trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}