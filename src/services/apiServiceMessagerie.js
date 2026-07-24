import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/conversations';

// Liste des conversations d'un utilisateur -> colonne de gauche "Messagerie"
export async function getUserConversations(userId) {
    return await axios.get(`${apiUrl}/user/${userId}`);
}

// Historique des messages d'une conversation -> fil de discussion
export async function getConversationHistory(conversationId) {
    return await axios.get(`${apiUrl}/${conversationId}/messages`);
}

// Recupere (ou cree) la conversation entre 2 utilisateurs, ex: RH + candidat
export async function getOrCreateConversation(userId1, userId2, candidatureId) {
    return await axios.get(`${apiUrl}/between`, {
        params: { userId1, userId2, candidatureId }
    });
}

// Marque une conversation comme lue par un utilisateur (reset du badge non-lu)
export async function markConversationAsRead(conversationId, readerId) {
    return await axios.put(`${apiUrl}/${conversationId}/read`, null, {
        params: { readerId }
    });
}