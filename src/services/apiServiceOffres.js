import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/offres';
const matchingApiUrl = 'http://localhost:8080/api/matching';
const savedApiUrl = 'http://localhost:8080/api/offres-sauvegardees';
// Créer une offre
export async function createOffre(offre) {
    return await axios.post(`${apiUrl}/create`, offre);
}

// Récupérer toutes les offres
export async function getAllOffres() {
    return await axios.get(`${apiUrl}/list`);
}

// Récupérer les offres d'un recruteur spécifique
export async function getOffresByRecruteur(recruteurId) {
    return await axios.get(`${apiUrl}/recruteur/${recruteurId}`);
}

// Récupérer une offre par id
export async function getOffreById(id) {
    return await axios.get(`${apiUrl}/${id}`);
}
// Uploader le logo d'une entreprise
export async function uploaderLogo(fichier) {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return await axios.post(`${apiUrl}/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}

// Modifier une offre
export async function updateOffre(id, offre) {
    return await axios.put(`${apiUrl}/${id}`, offre);
}

// Supprimer une offre
export async function deleteOffre(id) {
    return await axios.delete(`${apiUrl}/${id}`);
}

// Score de matching IA (candidat ↔ offre)
export async function getMatchScore(candidatId, offreId) {
    return await axios.get(`${matchingApiUrl}/${candidatId}/${offreId}`);
}

// Sauvegarder une offre
export async function sauvegarderOffre(userId, offreId) {
    return await axios.post(`${savedApiUrl}/${userId}/${offreId}`);
}

// Retirer une offre sauvegardée
export async function retirerOffreSauvegardee(userId, offreId) {
    return await axios.delete(`${savedApiUrl}/${userId}/${offreId}`);
}

// Récupérer les offres sauvegardées d'un candidat
export async function getOffresSauvegardees(userId) {
    return await axios.get(`${savedApiUrl}/${userId}`);
}