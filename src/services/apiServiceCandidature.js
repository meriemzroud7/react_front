import axios from 'axios';

// ⚠️ Adapte cette URL à ton environnement (variable d'env recommandée)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Si tu utilises un token JWT, décommente ceci :
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

const CandidatureService = {
  /**
   * Postuler à une offre (avec CV optionnel)
   */
  postuler: async (candidatId, offreId, cvFile) => {
    const formData = new FormData();
    formData.append('candidatId', candidatId);
    formData.append('offreId', offreId);
    if (cvFile) formData.append('cv', cvFile);

    const { data } = await api.post('/candidatures/postuler', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Récupérer les infos d'un utilisateur (candidat) par id
   */
  getUserById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  /**
   * Récupérer plusieurs utilisateurs en parallèle (dédupliqués), retourne une Map id -> user
   */
  getUsersByIds: async (ids) => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const results = await Promise.allSettled(
      uniqueIds.map((id) => api.get(`/users/${id}`).then((r) => r.data))
    );
    const map = {};
    results.forEach((res, i) => {
      if (res.status === 'fulfilled') map[uniqueIds[i]] = res.value;
    });
    return map;
  },

  /**
   * Récupérer TOUTES les candidatures (toutes offres confondues)
   * Nécessite l'endpoint GET /api/candidatures côté backend
   */
  getAll: async () => {
    const { data } = await api.get('/candidatures');
    return data;
  },

  /**
   * Récupérer toutes les candidatures d'une offre
   * (utilisé par la page "Liste des candidatures" du recruteur)
   */
  getByOffre: async (offreId) => {
    const { data } = await api.get(`/candidatures/offre/${offreId}`);
    return data;
  },

  /**
   * Récupérer toutes les candidatures d'un candidat
   */
  getByCandidat: async (candidatId) => {
    const { data } = await api.get(`/candidatures/candidat/${candidatId}`);
    return data;
  },
  /**


  /**
   * Récupérer une candidature par id
   */
  getById: async (id) => {
    const { data } = await api.get(`/candidatures/${id}`);
    return data;
  },

  /**
   * Mettre à jour le statut d'une candidature
   * statut attendu par le backend : ex 'EN_ATTENTE' | 'RETENU' | 'ENTRETIEN' | 'REFUSE'
   * (adapte les valeurs exactes à ton enum StatutCandidature côté Java)
   */
  updateStatut: async (id, statut) => {
    const { data } = await api.put(`/candidatures/${id}/statut`, null, {
      params: { statut },
    });
    return data;
  },

  /**
   * Supprimer une candidature
   */
  delete: async (id) => {
    const { data } = await api.delete(`/candidatures/${id}`);
    return data;
  },
  /**
 * Récupérer toutes les candidatures liées aux offres d'un recruteur
 * (filtrage réalisé côté frontend : offres du recruteur -> candidatures de ces offres)
 */
getByRecruteur: async (recruteurId) => {
  // 1. Récupérer les offres du recruteur
  const { data: offres } = await api.get(`/offres/recruteur/${recruteurId}`);
  const offreIds = offres.map(o => o.id || o._id);

  // 2. Récupérer les candidatures de chaque offre en parallèle
  const results = await Promise.allSettled(
    offreIds.map(id => api.get(`/candidatures/offre/${id}`).then(r => r.data))
  );

  // 3. Fusionner tous les résultats
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
},

  /**
   * URL de téléchargement direct du CV (à utiliser dans un <a href> ou window.open)
   */
  getCvDownloadUrl: (fileName) => `${API_BASE_URL}/candidatures/cv/${fileName}`,
};

export default CandidatureService;