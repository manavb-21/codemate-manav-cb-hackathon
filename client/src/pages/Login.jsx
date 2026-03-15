import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/auth/${isRegister ? 'register' : 'login'}`;
      const { data } = await axios.post(url, form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong');
    }
  };

  const s = styles;
  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.logo}>⚡ CodeMate</h1>
        <p style={s.sub}>Collaborative coding with voice support</p>

        <div style={s.tabs}>
          <button style={{...s.tab, ...(isRegister ? {} : s.activeTab)}} onClick={() => setIsRegister(false)}>Login</button>
          <button style={{...s.tab, ...(isRegister ? s.activeTab : {})}} onClick={() => setIsRegister(true)}>Register</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {isRegister && (
            <input style={s.input} placeholder="Username" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required />
          )}
          <input style={s.input} placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={s.input} placeholder="Password" type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          {isRegister && (
            <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="ta">Teaching Assistant</option>
              <option value="teacher">Teacher</option>
            </select>
          )}
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit">
            {isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' },
  card:      { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: 380 },
  logo:      { fontSize: 28, fontWeight: 700, color: '#58a6ff', textAlign: 'center', marginBottom: 6 },
  sub:       { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  tabs:      { display: 'flex', marginBottom: 24, border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' },
  tab:       { flex: 1, padding: '10px', background: 'transparent', border: 'none', color: '#8b949e', fontSize: 14 },
  activeTab: { background: '#21262d', color: '#e6edf3', fontWeight: 600 },
  form:      { display: 'flex', flexDirection: 'column', gap: 12 },
  input:     { padding: '10px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 14 },
  btn:       { padding: '12px', background: '#238636', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 4 },
  error:     { color: '#f85149', fontSize: 13 }
};