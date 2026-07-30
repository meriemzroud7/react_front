import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/cv';

// Envoyer un nouveau CV (analysé automatiquement côté backend)
export async function uploadCv(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`${apiUrl}/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Récupérer tous les CV d'un utilisateur
export async function getCvsByUser(userId) {
    return await axios.get(`${apiUrl}/user/${userId}`);
}

// Récupérer un CV précis
export async function getCvById(id) {
    return await axios.get(`${apiUrl}/${id}`);
}

// Télécharger le fichier PDF
export async function downloadCv(id, fileName) {
    const res = await axios.get(`${apiUrl}/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'cv.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

// Télécharger le fichier PDF en tant que blob, sans déclencher de téléchargement navigateur
// (utilisé en interne, ex: pour rattacher un CV existant à une nouvelle candidature)
export async function downloadCvBlob(id) {
    return await axios.get(`${apiUrl}/${id}/download`, { responseType: 'blob' });
}
// Définir un CV comme CV par défaut
export async function setDefaultCv(userId, cvId) {
    return await axios.put(`${apiUrl}/${userId}/default/${cvId}`);
}

// Supprimer un CV
export async function deleteCv(id) {
    return await axios.delete(`${apiUrl}/${id}`);
}