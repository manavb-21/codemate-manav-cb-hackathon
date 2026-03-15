import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [roomName, setRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const createRoom = async () => {
    try {
      const { data } = await axios.post('${process.env.REACT_APP_API_URL}/api/rooms/create',
        { name: roomName || 'My Room' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/room/${data.roomId}`);
    } catch (e) { alert(e.response?.data?.message || 'Error creating room'); }
  };

  const joinRoom = () => {
    if (joinId.trim()) navigate(`/room/${joinId.trim().toUpperCase()}`);
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const s = styles;
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.logo}>⚡ CodeMate</h1>
        <div style={s.userInfo}>
          <span style={s.role}>{user?.role}</span>
          <span style={s.username}>{user?.username}</span>
          {(user?.role === 'ta' || user?.role === 'teacher') && (
            <button style={s.taBtn} onClick={() => navigate('/ta-dashboard')}>
              📊 TA Dashboard
            </button>
          )}
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>🚀 Create a Room</h2>
          <input style={s.input} placeholder="Room name (optional)"
            value={roomName} onChange={e => setRoomName(e.target.value)} />
          <button style={s.btn} onClick={createRoom}>Create Room</button>
        </div>

        <div style={s.divider}>OR</div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>🔗 Join a Room</h2>
          <input style={s.input} placeholder="Enter Room ID (e.g. A1B2C3D4)"
            value={joinId} onChange={e => setJoinId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinRoom()} />
          <button style={{...s.btn, background: '#1f6feb'}} onClick={joinRoom}>Join Room</button>
        </div>
      </div>

      {/* Info cards for TA/Teacher */}
      {(user?.role === 'ta' || user?.role === 'teacher') && (
        <div style={s.infoRow}>
          <div style={s.infoCard}>
            <div style={s.infoIcon}>📊</div>
            <div style={s.infoTitle}>TA Dashboard</div>
            <div style={s.infoDesc}>Monitor all active student rooms, see who needs help, and join any session instantly</div>
            <button style={{...s.btn, background: '#6e40c9', padding: '10px'}} onClick={() => navigate('/ta-dashboard')}>
              Open Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:     { minHeight: '100vh', background: '#0d1117' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#161b22', borderBottom: '1px solid #30363d' },
  logo:     { fontSize: 22, fontWeight: 700, color: '#58a6ff' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  username: { color: '#e6edf3', fontSize: 14 },
  role:     { background: '#238636', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' },
  taBtn:    { padding: '6px 14px', background: '#6e40c9', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' },
  logoutBtn:{ padding: '6px 14px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  content:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 60, flexWrap: 'wrap' },
  card:     { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32, width: 320, display: 'flex', flexDirection: 'column', gap: 14 },
  cardTitle:{ fontSize: 18, fontWeight: 600, color: '#e6edf3' },
  input:    { padding: '10px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14 },
  btn:      { padding: '12px', background: '#238636', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  divider:  { color: '#8b949e', fontSize: 14, fontWeight: 600 },
  infoRow:  { display: 'flex', justifyContent: 'center', padding: '0 60px 40px' },
  infoCard: { background: '#161b22', border: '1px solid #6e40c9', borderRadius: 12, padding: 24, width: 320, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' },
  infoIcon: { fontSize: 32 },
  infoTitle:{ fontSize: 16, fontWeight: 600, color: '#e6edf3' },
  infoDesc: { fontSize: 13, color: '#8b949e', lineHeight: 1.5 },
};