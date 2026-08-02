import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// npm install @stomp/stompjs sockjs-client

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
const statusSubscriptions = {};

/**
 * Ouvre la connexion websocket pour un utilisateur donne.
 * callbacks = { onMessageReceived, onReadReceipt, onConnected, onMessageEdited, onMessageDeleted }
 */
export function connectWebSocket(userId, callbacks = {}) {
    const { onMessageReceived, onReadReceipt, onConnected, onMessageEdited, onMessageDeleted } = callbacks;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${WS_URL}?userId=${userId}`),
        reconnectDelay: 5000,
        onConnect: () => {
            // reception des messages en temps reel : topic dedie a ce userId
            stompClient.subscribe(`/topic/user.${userId}.messages`, (msg) => {
                onMessageReceived?.(JSON.parse(msg.body));
            });

            // reception des accuses de lecture
            stompClient.subscribe(`/topic/user.${userId}.read-receipts`, (msg) => {
                onReadReceipt?.(JSON.parse(msg.body));
            });

            // reception des messages edites
            stompClient.subscribe(`/topic/user.${userId}.messages.edited`, (msg) => {
                onMessageEdited?.(JSON.parse(msg.body));
            });

            // reception des messages supprimes
            stompClient.subscribe(`/topic/user.${userId}.messages.deleted`, (msg) => {
                onMessageDeleted?.(JSON.parse(msg.body));
            });

            onConnected?.();
        },
    });

    stompClient.activate();
    return stompClient;
}

/**
 * S'abonne au statut en ligne/hors ligne d'un utilisateur precis (ex: le candidat ouvert dans le chat).
 * onStatusChange(userId, 'ONLINE' | 'OFFLINE')
 */
export function subscribeToUserStatus(userId, onStatusChange) {
    if (!stompClient || !stompClient.connected) return;

    // evite les doublons d'abonnement si on rouvre la meme conversation
    statusSubscriptions[userId]?.unsubscribe();

    statusSubscriptions[userId] = stompClient.subscribe(`/topic/status.${userId}`, (msg) => {
        onStatusChange?.(userId, msg.body);
    });
}

// Envoie un message de chat
export function sendChatMessage({ senderId, senderName, receiverId, receiverName, content }) {
    if (!stompClient || !stompClient.connected) return;

    stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ senderId, senderName, receiverId, receiverName, content }),
    });
}

// Signale que les messages d'une conversation ont ete lus
export function sendReadReceipt(conversationId, readerId) {
    if (!stompClient || !stompClient.connected) return;

    stompClient.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({ conversationId, readerId }),
    });
}

// Modifie un message existant
export function sendEditMessage({ messageId, conversationId, editorId, newContent }) {
    if (!stompClient || !stompClient.connected) return;

    stompClient.publish({
        destination: '/app/chat.edit',
        body: JSON.stringify({ messageId, conversationId, editorId, newContent }),
    });
}

// Supprime un message existant
export function sendDeleteMessage({ messageId, conversationId, requesterId }) {
    if (!stompClient || !stompClient.connected) return;

    stompClient.publish({
        destination: '/app/chat.delete',
        body: JSON.stringify({ messageId, conversationId, requesterId }),
    });
}

export function disconnectWebSocket() {
    Object.values(statusSubscriptions).forEach((sub) => sub?.unsubscribe());
    stompClient?.deactivate();
    stompClient = null;
}