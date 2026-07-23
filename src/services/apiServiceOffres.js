import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/offres';

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

// Modifier une offre
export async function updateOffre(id, offre) {
    return await axios.put(`${apiUrl}/${id}`, offre);
}

// Supprimer une offre
export async function deleteOffre(id) {
    return await axios.delete(`${apiUrl}/${id}`);
}