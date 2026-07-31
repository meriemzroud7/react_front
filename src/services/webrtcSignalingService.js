import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

export default class SignalingService {
  constructor(userId) {
    this.userId = userId;
    this.client = null;
    this.subscriptions = [];
    this.active = false;
    this.hasJoined = false; // ← empêche un second join après reconnexion
  }

  connect(onConnected) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}?userId=${this.userId}`),
      reconnectDelay: 0, // ← désactive la reconnexion auto pendant l'entretien
      onConnect: () => {
        this.active = true;
        onConnected?.();
      },
      onStompError: (frame) => console.error('Erreur STOMP:', frame),
      onWebSocketClose: () => { this.active = false; },
    });
    this.client.activate();
  }

  disconnect() {
    this.active = false;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.client?.deactivate();
  }

  isConnected() {
    return this.active && this.client?.connected;
  }

  joinRoom(salleId, userName, onExistingPeers, onPeerEvent) {
    if (!this.isConnected()) return;
    if (this.hasJoined) return; // ← garde-fou anti-doublon
    this.hasJoined = true;

    const subExisting = this.client.subscribe(
      `/topic/user.${this.userId}.interview-existing-peers`,
      (msg) => onExistingPeers(JSON.parse(msg.body))
    );
    const subEvents = this.client.subscribe(
      `/topic/interview.${salleId}`,
      (msg) => onPeerEvent(JSON.parse(msg.body))
    );
    this.subscriptions.push(subExisting, subEvents);

    this.client.publish({
      destination: '/app/interview.join',
      body: JSON.stringify({ salleId, userId: this.userId, userName }),
    });
  }

  onSignal(callback) {
    if (!this.isConnected()) return;
    const sub = this.client.subscribe(
      `/topic/user.${this.userId}.interview-signal`,
      (msg) => callback(JSON.parse(msg.body))
    );
    this.subscriptions.push(sub);
  }

  sendSignal(salleId, toUserId, type, data) {
    if (!this.isConnected()) {
      console.warn('sendSignal ignoré : connexion STOMP fermée');
      return;
    }
    this.client.publish({
      destination: '/app/interview.signal',
      body: JSON.stringify({ salleId, fromUserId: this.userId, toUserId, type, data }),
    });
  }

  leaveRoom(salleId) {
    if (!this.isConnected()) return;
    this.client.publish({
      destination: '/app/interview.leave',
      body: JSON.stringify({ salleId, userId: this.userId }),
    });
  }
}