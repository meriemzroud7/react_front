import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/notifications';

// Récupérer toutes les notifications d'un utilisateur (candidat, recruteur ou admin)
export async function getMyNotifications(userId) {
    return await axios.get(`${apiUrl}/user/${userId}`);
}

// Récupérer le nombre de notifications non lues (pour le badge dans la topbar)
export async function getUnreadCount(userId) {
    return await axios.get(`${apiUrl}/user/${userId}/unread-count`);
}

// Marquer une notification comme lue
export async function markAsRead(id) {
    return await axios.patch(`${apiUrl}/${id}/read`);
}

// Marquer toutes les notifications d'un utilisateur comme lues
export async function markAllAsRead(userId) {
    return await axios.patch(`${apiUrl}/user/${userId}/read-all`);
}