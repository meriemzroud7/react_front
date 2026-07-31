import axios from 'axios';

const savedApiUrl = 'http://localhost:8080/api/offres-sauvegardees';

// Sauvegarder une offre pour un candidat
export async function sauvegarderOffre(userId, offreId) {
    return await axios.post(`${savedApiUrl}/${userId}/${offreId}`);
}

// Retirer une offre des favoris
export async function retirerOffreSauvegardee(userId, offreId) {
    return await axios.delete(`${savedApiUrl}/${userId}/${offreId}`);
}

// Récupérer la liste des offres sauvegardées d'un candidat
export async function getOffresSauvegardees(userId) {
    return await axios.get(`${savedApiUrl}/${userId}`);
}