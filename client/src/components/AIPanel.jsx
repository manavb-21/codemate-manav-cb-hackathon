import { useState } from 'react';
import axios from 'axios';

export default function AIPanel({ code, language, output }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const getSummary = async () => {
  setLoading(true);
  setResult('');
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/summary`, { code, language });
    setResult(data.summary);
  } catch (e) { setResult('Error: ' + e.message); }
  setLoading(false);
};

const detectAI = async () => {
  setLoading(true);
  setResult('');
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/detect-ai`, { code, language });
    setResult(
      `🔍 AI Detection Result\n\n` +
      `Verdict: ${data.verdict}\n` +
      `Likelihood: ${data.likelihood?.toUpperCase()} (${data.score}/100)\n\n` +
      `Reasons:\n${data.reasons?.map(r => `• ${r}`).join('\n')}`
    );
  } catch (e) { setResult('Error: ' + e.message); }
  setLoading(false);
};

const debugCode = async () => {
  setLoading(true);
  setResult('');
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/debug`, { code, error: output, language });
    setResult(data.debug);
  } catch (e) { setResult('Error: ' + e.message); }
  setLoading(false);
};

const evaluateCode = async () => {
  setLoading(true);
  setResult('');
  const user = JSON.parse(localStorage.getItem('user'));
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/evaluate`, { code, language, studentName: user?.username });
    setResult(data.evaluation);
  } catch (e) { setResult('Error: ' + e.message); }
  setLoading(false);
};

const tabs = [
  { id: 'summary',  label: '📝 Summary',  action: getSummary },
  { id: 'detect',   label: '🔍 AI Detect', action: detectAI },
  { id: 'debug',    label: '🐛 Debug',     action: debugCode },
  { id: 'evaluate', label: '📊 Evaluate',  action: evaluateCode },
];

  return (
    <div style={s.panel}>
      <div style={s.header}>🤖 AI Assistant</div>
      <div style={s.tabs}>
        {tabs.map(t => (
          <button key={t.id}
            style={{ ...s.tab, ...(activeTab === t.id ? s.activeTab : {}) }}
            onClick={() => { setActiveTab(t.id); setResult(''); }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={s.body}>
        {result ? (
          <pre style={s.result}>{result}</pre>
        ) : (
          <p style={s.placeholder}>
            {activeTab === 'summary'  && 'Get an AI explanation of your code'}
            {activeTab === 'detect'   && 'Check if code looks AI-generated'}
            {activeTab === 'debug'    && 'AI will analyze your error output'}
            {activeTab === 'evaluate' && 'AI will grade and evaluate the code'}
          </p>
        )}
      </div>
      <button
        style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
        onClick={tabs.find(t => t.id === activeTab)?.action}
        disabled={loading}>
        {loading ? '⏳ Analyzing...' : '✨ Analyze'}
      </button>
    </div>
  );
}

const s = {
  panel:       { width: 300, background: '#161b22', borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column', height: '100vh' },
  header:      { padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid #30363d', fontSize: 14, color: '#e6edf3' },
  tabs:        { display: 'flex', borderBottom: '1px solid #30363d' },
  tab:         { flex: 1, padding: '8px 4px', background: 'transparent', border: 'none', color: '#8b949e', fontSize: 11, cursor: 'pointer' },
  activeTab:   { background: '#21262d', color: '#58a6ff', borderBottom: '2px solid #58a6ff' },
  body:        { flex: 1, overflowY: 'auto', padding: 12 },
  result:      { fontSize: 12, color: '#e6edf3', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'monospace' },
  placeholder: { color: '#8b949e', fontSize: 13, lineHeight: 1.6 },
  btn:         { margin: 12, padding: '10px', background: '#6e40c9', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
};