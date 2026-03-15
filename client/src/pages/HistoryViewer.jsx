import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HistoryViewer() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(data.history || []);
        if (data.history?.length > 0) setSelected(data.history[data.history.length - 1]);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchHistory();
  }, [roomId]);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Back to Room</button>
        <h2 style={s.title}>📜 Code History — Room {roomId}</h2>
        <span style={s.count}>{history.length} snapshots</span>
      </div>

      {loading ? (
        <div style={s.loading}>Loading history...</div>
      ) : history.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div>No saved snapshots yet</div>
          <div style={{ fontSize: 13, color: '#8b949e', marginTop: 8 }}>Click "Save" in the room to create snapshots</div>
        </div>
      ) : (
        <div style={s.content}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            <div style={s.sidebarTitle}>Snapshots</div>
            {[...history].reverse().map((h, i) => (
              <div key={i}
                style={{ ...s.snapshotItem, ...(selected === h ? s.activeSnapshot : {}) }}
                onClick={() => setSelected(h)}>
                <div style={s.snapshotTime}>
                  🕐 {new Date(h.savedAt).toLocaleString()}
                </div>
                <div style={s.snapshotBy}>by {h.savedBy}</div>
                <div style={s.snapshotLines}>{h.code?.split('\n').length} lines</div>
              </div>
            ))}
          </div>

          {/* Code View */}
          <div style={s.codePanel}>
            {selected ? (
              <>
                <div style={s.codePanelHeader}>
                  <span>Snapshot from {new Date(selected.savedAt).toLocaleString()}</span>
                  <button style={s.copyBtn}
                    onClick={() => { navigator.clipboard.writeText(selected.code); alert('Copied!'); }}>
                    📋 Copy Code
                  </button>
                </div>
                <pre style={s.codeView}>{selected.code}</pre>
              </>
            ) : (
              <div style={s.empty}>Select a snapshot to view</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:           { minHeight: '100vh', background: '#0d1117', color: '#e6edf3' },
  header:         { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#161b22', borderBottom: '1px solid #30363d' },
  backBtn:        { padding: '6px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, cursor: 'pointer' },
  title:          { fontSize: 18, fontWeight: 600, flex: 1 },
  count:          { fontSize: 13, color: '#8b949e', background: '#21262d', padding: '4px 12px', borderRadius: 12 },
  loading:        { display: 'flex', justifyContent: 'center', padding: 60, color: '#8b949e' },
  empty:          { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#8b949e', fontSize: 16 },
  content:        { display: 'flex', height: 'calc(100vh - 57px)' },
  sidebar:        { width: 280, background: '#161b22', borderRight: '1px solid #30363d', overflowY: 'auto' },
  sidebarTitle:   { padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#8b949e', borderBottom: '1px solid #30363d' },
  snapshotItem:   { padding: '14px 16px', borderBottom: '1px solid #30363d', cursor: 'pointer' },
  activeSnapshot: { background: '#21262d', borderLeft: '3px solid #58a6ff' },
  snapshotTime:   { fontSize: 13, color: '#e6edf3', marginBottom: 4 },
  snapshotBy:     { fontSize: 12, color: '#58a6ff' },
  snapshotLines:  { fontSize: 11, color: '#8b949e', marginTop: 2 },
  codePanel:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  codePanelHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#161b22', borderBottom: '1px solid #30363d', fontSize: 13, color: '#8b949e' },
  copyBtn:        { padding: '6px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, cursor: 'pointer' },
  codeView:       { flex: 1, padding: 24, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7, color: '#e6edf3', overflowY: 'auto', whiteSpace: 'pre-wrap' },
};