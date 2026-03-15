import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function VoiceChannel({ roomId, userId }) {
  const socket = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    let peer;
    import('peerjs').then(({ default: Peer }) => {
      peer = new Peer(userId + '_' + roomId);
      peerRef.current = peer;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          streamRef.current = stream;
          setIsConnected(true);
          detectSpeaking(stream);

          peer.on('call', call => {
            call.answer(stream);
            call.on('stream', remoteStream => playAudio(remoteStream));
          });

          socket.on('user-joined', ({ user }) => {
            const call = peer.call(user.id + '_' + roomId, stream);
            if (call) call.on('stream', remoteStream => playAudio(remoteStream));
          });
        })
        .catch(() => setIsConnected(false));
    });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      peer?.destroy();
    };
  }, []);

  const detectSpeaking = (stream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const src = ctx.createMediaStreamSource(stream);
    src.connect(analyser);
    analyser.fftSize = 512;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const check = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b) / data.length;
      setSpeaking(avg > 10);
      requestAnimationFrame(check);
    };
    check();
  };

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
    <div style={{
      ...s.voice,
      border: speaking && !isMuted ? '1px solid #238636' : '1px solid #30363d',
      transition: 'border 0.2s'
    }}>
      <div style={s.left}>
        <div style={{
          ...s.dot,
          background: !isConnected ? '#8b949e' : isMuted ? '#da3633' : speaking ? '#238636' : '#3fb950'
        }}/>
        <span style={s.label}>
          {!isConnected ? 'No mic' : isMuted ? 'Muted' : speaking ? 'Speaking...' : 'Voice Live'}
        </span>
      </div>
      <button
        title={isMuted ? 'Unmute' : 'Mute'}
        style={{ ...s.muteBtn, background: isMuted ? '#da3633' : '#21262d' }}
        onClick={toggleMute}>
        {isMuted ? '🔇' : '🎙️'}
      </button>
    </div>
  );
}

const s = {
  voice:   { display: 'flex', alignItems: 'center', gap: 10, padding: '5px 10px', background: '#21262d', borderRadius: 8 },
  left:    { display: 'flex', alignItems: 'center', gap: 6 },
  dot:     { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  label:   { fontSize: 12, color: '#e6edf3', minWidth: 80 },
  muteBtn: { border: '1px solid #30363d', borderRadius: 6, padding: '4px 8px', fontSize: 16, cursor: 'pointer', lineHeight: 1 }
};