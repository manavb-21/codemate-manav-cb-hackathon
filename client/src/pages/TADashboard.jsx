import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function TADashboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeRooms, setActiveRooms] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // request current active rooms
    socket.emit('request-active-rooms');

    socket.on('active-rooms-update', (rooms) => {
      setActiveRooms(rooms);
    });

    socket.on('student-needs-help', ({ user: u, roomId, time }) => {
      setHelpRequests(prev => [...prev, { user: u, roomId, time }]);
      setNotifications(prev => [...prev, `🖐 ${u.username} needs help in room ${roomId}`]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
    });

    return () => {
      socket.off('active-rooms-update');
      socket.off('student-needs-help');
    };
  }, []);

  const joinRoom = (roomId) => navigate(`/room/${roomId}`);

  return (
    <div style={s.page}>
      {/* Notifications */}
      {notifications.map((n, i) => (
        <div key={i} style={s.toast}>{n}</div>
      ))}

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.logo}>⚡ CodeMate</h1>
        <div style={s.headerRight}>
          <span style={s.roleBadge}>{user?.role?.toUpperCase()}</span>
          <span style={s.username}>{user?.username}</span>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button style={s.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div style={s.content}>
        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>{activeRooms.length}</div>
            <div style={s.statLabel}>Active Rooms</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{activeRooms.reduce((a, r) => a + r.participants.length, 0)}</div>
            <div style={s.statLabel}>Students Online</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statNum, color: '#f85149' }}>{helpRequests.length}</div>
            <div style={s.statLabel}>Help Requests</div>
          </div>
        </div>

        <div style={s.columns}>
          {/* Active Rooms */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>🟢 Active Rooms</h2>
            {activeRooms.length === 0 ? (
              <p style={s.empty}>No active rooms right now</p>
            ) : activeRooms.map((room, i) => (
              <div key={i} style={s.roomCard}>
                <div style={s.roomTop}>
                  <span style={s.roomId}>Room: <strong>{room.roomId}</strong></span>
                  <span style={s.participantCount}>{room.participants.length} online</span>
                </div>
                <div style={s.participants}>
                  {room.participants.map((p, j) => (
                    <span key={j} style={{ ...s.participantBadge, background: p.role === 'student' ? '#1f3d2e' : '#1f2d4e' }}>
                      {p.role === 'student' ? '👤' : '👨‍🏫'} {p.username}
                    </span>
                  ))}
                </div>
                {room.lastCode && (
                  <pre style={s.codePreview}>{room.lastCode.slice(0, 100)}...</pre>
                )}
                <button style={s.joinBtn} onClick={() => joinRoom(room.roomId)}>
                  👁 Join & Monitor
                </button>
              </div>
            ))}
          </div>

          {/* Help Requests */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>🖐 Help Requests</h2>
            {helpRequests.length === 0 ? (
              <p style={s.empty}>No pending help requests</p>
            ) : helpRequests.map((req, i) => (
              <div key={i} style={s.helpCard}>
                <div style={s.helpTop}>
                  <span style={s.helpUser}>👤 {req.user?.username}</span>
                  <span style={s.helpTime}>{req.time}</span>
                </div>
                <div style={s.helpRoom}>Room: <strong>{req.roomId}</strong></div>
                <button style={s.helpBtn} onClick={() => joinRoom(req.roomId)}>
                  🚀 Help Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:             { minHeight: '100vh', background: '#0d1117', color: '#e6edf3' },
  toast:            { position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#9e6a03', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#161b22', borderBottom: '1px solid #30363d' },
  logo:             { fontSize: 22, fontWeight: 700, color: '#58a6ff' },
  headerRight:      { display: 'flex', alignItems: 'center', gap: 12 },
  roleBadge:        { background: '#6e40c9', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 12 },
  username:         { color: '#e6edf3', fontSize: 14 },
  backBtn:          { padding: '6px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, cursor: 'pointer' },
  logoutBtn:        { padding: '6px 14px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  content:          { padding: 32 },
  statsRow:         { display: 'flex', gap: 20, marginBottom: 32 },
  statCard:         { flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, textAlign: 'center' },
  statNum:          { fontSize: 40, fontWeight: 700, color: '#58a6ff' },
  statLabel:        { fontSize: 13, color: '#8b949e', marginTop: 4 },
  columns:          { display: 'flex', gap: 24 },
  section:          { flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 },
  sectionTitle:     { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#e6edf3' },
  empty:            { color: '#8b949e', fontSize: 14 },
  roomCard:         { background: '#21262d', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid #30363d' },
  roomTop:          { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  roomId:           { fontSize: 14, color: '#e6edf3' },
  participantCount: { fontSize: 12, color: '#3fb950', background: '#1f3d2e', padding: '2px 8px', borderRadius: 12 },
  participants:     { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  participantBadge: { fontSize: 12, padding: '3px 10px', borderRadius: 12, color: '#e6edf3' },
  codePreview:      { fontSize: 11, color: '#8b949e', background: '#0d1117', padding: 8, borderRadius: 6, marginBottom: 10, overflow: 'hidden', maxHeight: 60 },
  joinBtn:          { padding: '8px 16px', background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', width: '100%' },
  helpCard:         { background: '#2d1f1f', border: '1px solid #f8514933', borderRadius: 8, padding: 16, marginBottom: 12 },
  helpTop:          { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  helpUser:         { fontSize: 14, color: '#e6edf3', fontWeight: 600 },
  helpTime:         { fontSize: 12, color: '#8b949e' },
  helpRoom:         { fontSize: 13, color: '#8b949e', marginBottom: 10 },
  helpBtn:          { padding: '8px 16px', background: '#da3633', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', width: '100%' },
};