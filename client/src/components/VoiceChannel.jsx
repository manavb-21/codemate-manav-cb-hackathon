import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useSocket } from '../context/SocketContext';

export default function VoiceChannel({ roomId, userId }) {
  const socket = useSocket();
  const peerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    const peer = new Peer(userId);
    peerRef.current = peer;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;

      // When someone joins, call them
      socket.on('user-joined', ({ user }) => {
        const call = peer.call(user.id, stream);
        call.on('stream', remoteStream => playAudio(remoteStream));
        setConnected(true);
      });

      // Answer incoming calls
      peer.on('call', call => {
        call.answer(stream);
        call.on('stream', remoteStream => playAudio(remoteStream));
        setConnected(true);
      });
    });

    return () => { peer.destroy(); streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const playAudio = (stream) => {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
  };

  const toggleMute = () => {
    streamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div style={{ padding: '8px', background: '#1a1a2e', borderRadius: 8, color: '#fff', fontSize: 13 }}>
      <span>🎙 Voice {connected ? '● Live' : '○ Waiting'}</span>
      <button onClick={toggleMute} style={{ marginLeft: 12, fontSize: 12 }}>
        {isMuted ? '🔇 Unmute' : '🔊 Mute'}
      </button>
    </div>
  );
}