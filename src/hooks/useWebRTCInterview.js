import { useEffect, useRef, useState, useCallback } from 'react';
import SignalingService from '../services/webrtcSignalingService';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function useWebRTCInterview({ salleId, userId, userName }) {
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingRef = useRef(null);
  const initializedRef = useRef(false);
  const activeRef = useRef(true); // ← false après cleanup, ignore tout événement tardif

  const createPeerConnection = useCallback((targetUserId) => {
    peerConnectionRef.current?.close();

    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      if (!activeRef.current) return;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      // Ignore si le composant est démonté ou si ce n'est plus la connexion active
      if (!activeRef.current) return;
      if (peerConnectionRef.current !== pc) return;
      if (event.candidate) {
        signalingRef.current?.sendSignal(salleId, targetUserId, 'candidate', event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (!activeRef.current) return;
      setConnected(pc.connectionState === 'connected');
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [salleId]);

  useEffect(() => {
    if (!salleId || !userId) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    activeRef.current = true;

    let signaling;

    async function setup() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!activeRef.current) { // démonté pendant l'attente du getUserMedia
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      signaling = new SignalingService(userId);
      signalingRef.current = signaling;

      signaling.connect(() => {
        if (!activeRef.current) return;

        signaling.joinRoom(
          salleId,
          userName,
          async ({ participants }) => {
            if (!activeRef.current) return;
            for (const peerId of participants) {
              const pc = createPeerConnection(peerId);
              const offer = await pc.createOffer();
              if (!activeRef.current) return;
              await pc.setLocalDescription(offer);
              signaling.sendSignal(salleId, peerId, 'offer', offer);
            }
          },
          (event) => {
            if (!activeRef.current) return;
            if (event.event === 'peer-left') {
              peerConnectionRef.current?.close();
              peerConnectionRef.current = null;
              setConnected(false);
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            }
          }
        );

        signaling.onSignal(async ({ fromUserId, type, data }) => {
          if (!activeRef.current) return;
          let pc = peerConnectionRef.current;

          if (type === 'offer') {
            if (pc && pc.signalingState !== 'stable' && pc.signalingState !== 'closed') {
              console.warn('Offre ignorée : connexion déjà en négociation');
              return;
            }
            pc = createPeerConnection(fromUserId);
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            if (!activeRef.current) return;
            const answer = await pc.createAnswer();
            if (!activeRef.current) return;
            await pc.setLocalDescription(answer);
            signaling.sendSignal(salleId, fromUserId, 'answer', answer);

          } else if (type === 'answer') {
            if (!pc || pc.signalingState !== 'have-local-offer') {
              console.warn('Answer ignorée : état inattendu', pc?.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data));

          } else if (type === 'candidate') {
            if (!pc || pc.signalingState === 'closed') return;
            try { await pc.addIceCandidate(new RTCIceCandidate(data)); }
            catch (err) { console.error('Erreur ICE candidate:', err); }
          }
        });
      });
    }

    setup();

    return () => {
      activeRef.current = false; // ← bloque tout callback en vol avant le vrai nettoyage
      signalingRef.current?.leaveRoom(salleId);
      signalingRef.current?.disconnect();
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      initializedRef.current = false;
    };
  }, [salleId, userId, userName, createPeerConnection]);

  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  }

  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  }

  return { localVideoRef, remoteVideoRef, connected, micOn, camOn, toggleMic, toggleCam };
}