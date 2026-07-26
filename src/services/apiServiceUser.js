import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/users';

// Créer un utilisateur
export async function createUser(user) {
    return await axios.post(apiUrl, user);
}

// Vérifier le compte (code à 6 chiffres)
export async function verifyAccount(email, code) {
    return await axios.post(`${apiUrl}/verify`, null, {
        params: { email, code }
    });
}

// Connexion
export async function login(email, password) {
    return await axios.post(`${apiUrl}/login`, { email, password });
}

// Récupérer tous les utilisateurs
export async function getUsers() {
    return await axios.get(apiUrl);
}

// Récupérer un utilisateur par id
export async function getUserById(id) {
    return await axios.get(`${apiUrl}/${id}`);
}

// Modifier un utilisateur
export async function updateUser(id, user) {
    return await axios.put(`${apiUrl}/${id}`, user);
}
// Modifier son propre profil (page "Mon profil" côté Candidat)
export async function updateProfile(id, user) {
    return await axios.put(`${apiUrl}/${id}/profile`, user);
}
 
// Envoyer / remplacer la photo de profil
export async function uploadUserPhoto(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`${apiUrl}/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// Supprimer un utilisateur
export async function deleteUser(id) {
    return await axios.delete(`${apiUrl}/${id}`);
}

// Mot de passe oublié
export async function forgotPassword(email) {
    return await axios.post(`${apiUrl}/forgot-password`, null, {
        params: { email }
    });
}

// Réinitialiser le mot de passe
export async function resetPassword(email, code, newPassword) {
    return await axios.post(`${apiUrl}/reset-password`, null, {
        params: { email, code, newPassword }
    });
}