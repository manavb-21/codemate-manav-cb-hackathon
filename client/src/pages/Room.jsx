import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import Chat from '../components/Chat';
import VoiceChannel from '../components/VoiceChannel';
import axios from 'axios';
import AIPanel from '../components/AIPanel';
import ScreenShare from '../components/ScreenShare';

const LANGUAGES = ['python', 'javascript', 'cpp', 'java'];

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [code, setCode] = useState('# Start coding here\n');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [votes, setVotes] = useState(new Set());
  const [userCount, setUserCount] = useState(1);
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
  if (!user) { navigate('/login'); return; }

  socket.emit('join-room', { roomId, user });

  socket.on('load-room', ({ code: c, language: l }) => {
    setCode(c);
    setLanguage(l);
  });
  socket.on('language-update', ({ language: l }) => setLanguage(l));
  socket.on('user-joined', () => setUserCount(p => p + 1));
  socket.on('user-left',   () => setUserCount(p => Math.max(1, p - 1)));
  socket.on('run-vote-update', ({ userId }) => setVotes(prev => new Set([...prev, userId])));
  socket.on('execution-started', () => executeCode());

  return () => {
    socket.off('load-room');
    socket.off('language-update');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('run-vote-update');
    socket.off('execution-started');
  };
}, []); // ← empty array, runs ONCE only

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/execute`, { code, language });
      const result = data.stdout || data.stderr || data.compile_output || 'No output';
      setOutput(`[${data.status}]\n${result}`);
    } catch (e) {
      setOutput('Error: ' + e.message);
    }
    setIsRunning(false);
    setVotes(new Set());
  };

  const handleVoteRun = () => {
  // Students can only vote, NOT directly run
  if (user?.role === 'student') {
    const newVotes = new Set([...votes, user.id]);
    setVotes(newVotes);
    socket.emit('run-vote', { roomId, userId: user.id });
    alert('✅ Your vote to run has been cast! Waiting for all collaborators...');
    return;
  }

  // TA/Teacher can run immediately OR trigger consensus
  const newVotes = new Set([...votes, user.id]);
  setVotes(newVotes);
  socket.emit('run-vote', { roomId, userId: user.id });

  if (newVotes.size >= userCount) {
    socket.emit('run-execute', { roomId });
    executeCode();
  } else {
    alert(`✅ Vote cast! ${newVotes.size}/${userCount} votes. Waiting for others...`);
  }
};

  const handleSave = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/save`,
        { code }, { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Code saved!');
    } catch (e) { alert('Save failed'); }
  };

  const handleRaiseHand = () => {
    socket.emit('raise-hand', { roomId, user });
    setHandRaised(true);
    setTimeout(() => setHandRaised(false), 3000);
  };

  const changeLanguage = (l) => {
    setLanguage(l);
    socket.emit('language-change', { roomId, language: l });
  };

  return (
    <div style={s.page}>
      {/* TOP BAR */}
      <div style={s.topbar}>
        <div style={s.left}>
          <span style={s.logo}>⚡</span>
          <span style={s.roomId}>Room: <strong>{roomId}</strong></span>
          <span style={s.userBadge}>{user?.role} — {user?.username}</span>
        </div>
        <div style={s.center}>
          <select style={s.select} value={language} onChange={e => changeLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
            <button style={s.voteBtn} onClick={handleVoteRun} disabled={isRunning}>
            {user?.role === 'student'
                ? `🖐 Vote Run (${votes.size}/${userCount})`
                : `▶️ Run (${votes.size}/${userCount})`}
            </button>
            <button style={s.saveBtn} onClick={handleSave}>💾 Save</button>
            <button style={s.saveBtn} onClick={() => navigate(`/history/${roomId}`)}>
            📜 History
            </button>
        </div>
        <div style={s.right}>
            <VoiceChannel roomId={roomId} userId={user?.id} />
            <ScreenShare />
          <button
            style={{ ...s.handBtn, background: handRaised ? '#9e6a03' : '#21262d' }}
            onClick={handleRaiseHand}>
            🖐 {handRaised ? 'Hand Raised!' : 'Raise Hand'}
          </button>
          <button style={s.leaveBtn} onClick={() => navigate('/dashboard')}>Leave</button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={s.main}>
        {/* Editor + Terminal */}
        <div style={s.editorPanel}>
          <div style={s.editorArea}>
            <CodeEditor
                roomId={roomId}
                language={language}
                code={code}
                setCode={setCode}
                userRole={user?.role}
            />
          </div>
          <div style={s.terminalArea}>
            <Terminal output={output} isRunning={isRunning} />
          </div>
        </div>

        {/* Chat */}
        <Chat roomId={roomId} user={user} />
        <AIPanel code={code} language={language} output={output} />
      </div>
    </div>
  );
}

const s = {
  page:        { height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117', overflow: 'hidden' },
  topbar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#161b22', borderBottom: '1px solid #30363d', flexShrink: 0, flexWrap: 'wrap', gap: 8 },
  left:        { display: 'flex', alignItems: 'center', gap: 12 },
  logo:        { fontSize: 20 },
  roomId:      { fontSize: 13, color: '#8b949e' },
  userBadge:   { fontSize: 12, background: '#21262d', padding: '3px 10px', borderRadius: 12, color: '#58a6ff', border: '1px solid #30363d' },
  center:      { display: 'flex', alignItems: 'center', gap: 8 },
  select:      { padding: '6px 10px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13 },
  voteBtn:     { padding: '6px 14px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600 },
  saveBtn:     { padding: '6px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13 },
  right:       { display: 'flex', alignItems: 'center', gap: 8 },
  handBtn:     { padding: '6px 12px', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13 },
  leaveBtn:    { padding: '6px 14px', background: '#da3633', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13 },
  main:        { display: 'flex', flex: 1, overflow: 'hidden' },
  editorPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  editorArea:  { flex: 1, overflow: 'hidden' },
  terminalArea:{ height: 180, flexShrink: 0 },
};