import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/entretiens';

export async function getEntretiens(statut) {
    const params = statut ? { statut } : {};
    return await axios.get(apiUrl, { params });
}

export async function getEntretienById(id) {
    return await axios.get(`${apiUrl}/${id}`);
}

export async function getEntretienStats() {
    return await axios.get(`${apiUrl}/stats`);
}

export async function programmerEntretien(entretien) {
    return await axios.post(apiUrl, entretien);
}

export async function modifierEntretien(id, entretien) {
    return await axios.put(`${apiUrl}/${id}`, entretien);
}

export async function changerStatut(id, statut) {
    return await axios.put(`${apiUrl}/${id}/statut`, null, { params: { statut } });
}

export async function demarrerEntretien(id) {
    return await axios.post(`${apiUrl}/${id}/demarrer`);
}

export async function enregistrerNotes(id, notes) {
    return await axios.put(`${apiUrl}/${id}/notes`, notes, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export async function enregistrerEvaluation(id, evaluation) {
    return await axios.put(`${apiUrl}/${id}/evaluation`, evaluation);
}

export async function enregistrerDecision(id, decision) {
    return await axios.put(`${apiUrl}/${id}/decision`, null, { params: { decision } });
}

export async function supprimerEntretien(id) {
    return await axios.delete(`${apiUrl}/${id}`);
}