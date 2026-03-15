import { useState, useRef } from 'react';

export default function ScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsSharing(true);
      stream.getVideoTracks()[0].onended = () => stopShare();
    } catch (e) {
      console.log('Screen share cancelled');
    }
  };

  const stopShare = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsSharing(false);
  };

  return (
    <>
      {isSharing && (
        <div style={s.preview}>
          <div style={s.previewHeader}>
            <span style={s.previewLabel}>🖥️ Sharing Screen</span>
            <button style={s.stopBtn} onClick={stopShare}>✕ Stop</button>
          </div>
          <video ref={videoRef} autoPlay muted style={s.video} />
        </div>
      )}
      <button
        style={{ ...s.btn, background: isSharing ? '#da3633' : '#1f6feb' }}
        onClick={isSharing ? stopShare : startShare}>
        {isSharing ? '⏹ Stop Share' : '🖥️ Share Screen'}
      </button>
    </>
  );
}

const s = {
  preview:       { position: 'fixed', bottom: 20, right: 20, zIndex: 1000, background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#21262d' },
  previewLabel:  { fontSize: 12, color: '#58a6ff', fontWeight: 600 },
  stopBtn:       { background: '#da3633', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '3px 8px', cursor: 'pointer' },
  video:         { width: 320, height: 180, objectFit: 'cover', display: 'block' },
  btn:           { padding: '6px 14px', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }
};