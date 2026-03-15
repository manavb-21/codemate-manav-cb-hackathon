import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function VoiceChannel({ roomId, userId }) {
  const socket = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState([]);
  const streamRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    let peer;
    import('peerjs').then(({ default: Peer }) => {
      peer = new Peer(userId + '_' + roomId);
      peerRef.current = peer;

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        streamRef.current = stream;
        setIsConnected(true);

        peer.on('call', call => {
          call.answer(stream);
          call.on('stream', remoteStream => playAudio(remoteStream));
          setPeers(prev => [...prev, call.peer]);
        });

        socket.on('user-joined', ({ user }) => {
          const call = peer.call(user.id + '_' + roomId, stream);
          if (call) {
            call.on('stream', remoteStream => playAudio(remoteStream));
            setPeers(prev => [...prev, user.username]);
          }
        });
      }).catch(() => setIsConnected(false));
    });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peer?.destroy();
    };
  }, []);

  const playAudio = (stream) => {
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    document.body.appendChild(audio);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div style={s.voice}>
      <div style={s.status}>
        <span style={{ ...s.dot, background: isConnected ? '#238636' : '#8b949e' }} />
        <span style={s.label}>{isConnected ? `Voice Live` : 'Connecting...'}</span>
        {peers.length > 0 && <span style={s.count}>{peers.length} connected</span>}
      </div>
      <button style={{ ...s.muteBtn, background: isMuted ? '#da3633' : '#21262d' }} onClick={toggleMute}>
        {isMuted ? '🔇' : '🎙'}
      </button>
    </div>
  );
}

const s = {
  voice:   { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#21262d', borderRadius: 8, border: '1px solid #30363d' },
  status:  { display: 'flex', alignItems: 'center', gap: 6 },
  dot:     { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  label:   { fontSize: 12, color: '#e6edf3' },
  count:   { fontSize: 11, color: '#8b949e' },
  muteBtn: { border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 16, cursor: 'pointer' }
};