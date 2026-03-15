import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CodeEditor from '../components/CodeEditor';
import VoiceChannel from '../components/VoiceChannel';
import Chat from '../components/Chat';
import axios from 'axios';

const LANGUAGES = ['python', 'javascript', 'cpp', 'java'];

export default function Room() {
  const { roomId } = useParams();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem('user'));
  const [code, setCode] = useState('# Start here\n');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [votes, setVotes] = useState(new Set());
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit('join-room', { roomId, user });
    socket.on('user-joined', ({ user: u }) => setUsers(prev => [...prev, u]));
    socket.on('language-update', ({ language: l }) => setLanguage(l));
    socket.on('run-vote-update', ({ userId }) => setVotes(prev => new Set([...prev, userId])));
    socket.on('execution-started', runCode);
    return () => socket.removeAllListeners();
  }, [roomId]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const { data } = await axios.post('http://localhost:5000/api/execute', { code, language });
      setOutput(data.stdout || data.stderr || 'No output');
    } catch (e) { setOutput('Error: ' + e.message); }
    setIsRunning(false);
  };

  const handleVoteRun = () => {
    socket.emit('run-vote', { roomId, userId: user.id });
    setVotes(prev => new Set([...prev, user.id]));
    // Auto-run if everyone voted (simplified — you'd know total user count)
    if (votes.size + 1 >= users.length + 1) {
      socket.emit('run-execute', { roomId });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1117', color: '#fff' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', background: '#161b22', display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>Room: {roomId}</strong>
          <select value={language} onChange={e => { setLanguage(e.target.value); socket.emit('language-change', { roomId, language: e.target.value }); }}
            style={{ background: '#21262d', color: '#fff', border: '1px solid #30363d', borderRadius: 6, padding: '4px 8px' }}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <button onClick={handleVoteRun} disabled={isRunning}
            style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>
            ✅ Vote Run ({votes.size}/{users.length + 1})
          </button>
          <VoiceChannel roomId={roomId} userId={user?.id} />
        </div>

        <CodeEditor roomId={roomId} language={language} code={code} setCode={setCode} userRole={user?.role} />

        {/* Terminal */}
        <div style={{ height: 160, background: '#0d1117', border: '1px solid #30363d', padding: 12, fontFamily: 'monospace', fontSize: 13, overflowY: 'auto' }}>
          <div style={{ color: '#58a6ff' }}>$ output</div>
          <pre style={{ color: output.includes('Error') ? '#f85149' : '#7ee787', margin: 0 }}>{output || 'Run code to see output here'}</pre>
        </div>
      </div>

      {/* Right Panel — Chat */}
      <Chat roomId={roomId} user={user} />
    </div>
  );
}