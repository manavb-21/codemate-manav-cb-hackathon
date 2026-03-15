import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export default function Chat({ roomId, user }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on('hand-raised', ({ user: u }) => {
      setMessages(prev => [...prev, {
        user: { username: '🖐 System' },
        message: `${u.username} raised their hand!`,
        time: new Date().toLocaleTimeString(),
        isSystem: true
      }]);
    });
    socket.on('user-joined', ({ user: u }) => {
      setMessages(prev => [...prev, {
        user: { username: '🟢 System' },
        message: `${u.username} joined the room`,
        time: new Date().toLocaleTimeString(),
        isSystem: true
      }]);
    });
    socket.on('user-left', ({ user: u }) => {
      setMessages(prev => [...prev, {
        user: { username: '🔴 System' },
        message: `${u?.username} left the room`,
        time: new Date().toLocaleTimeString(),
        isSystem: true
      }]);
    });
    return () => {
      socket.off('new-message');
      socket.off('hand-raised');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('chat-message', { roomId, message: input, user });
    setMessages(prev => [...prev, { user, message: input, time: new Date().toLocaleTimeString(), isMine: true }]);
    setInput('');
  };

  return (
    <div style={s.chat}>
      <div style={s.header}>💬 Chat</div>
      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.msg, ...(msg.isMine ? s.mine : {}), ...(msg.isSystem ? s.system : {}) }}>
            {!msg.isSystem && <span style={s.username}>{msg.user?.username}</span>}
            <span style={s.text}>{msg.message}</span>
            <span style={s.time}>{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          placeholder="Type a message..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button style={s.sendBtn} onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

const s = {
  chat:     { width: 280, background: '#161b22', borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column', height: '100vh' },
  header:   { padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid #30363d', fontSize: 14 },
  messages: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  msg:      { background: '#21262d', borderRadius: 8, padding: '8px 10px', maxWidth: '100%' },
  mine:     { background: '#1f3d2e', borderLeft: '3px solid #238636' },
  system:   { background: 'transparent', color: '#8b949e', fontSize: 12, padding: '2px 4px' },
  username: { display: 'block', fontSize: 11, color: '#58a6ff', fontWeight: 600, marginBottom: 2 },
  text:     { fontSize: 13, color: '#e6edf3', display: 'block', wordBreak: 'break-word' },
  time:     { fontSize: 10, color: '#8b949e', display: 'block', marginTop: 2 },
  inputRow: { display: 'flex', padding: 10, gap: 8, borderTop: '1px solid #30363d' },
  input:    { flex: 1, padding: '8px 12px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13 },
  sendBtn:  { padding: '8px 12px', background: '#238636', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16 }
};