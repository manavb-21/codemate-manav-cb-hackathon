export default function Terminal({ output, isRunning }) {
  const lines = output?.split('\n') || [];

  return (
    <div style={s.terminal}>
      <div style={s.header}>
        <span style={s.dot1}/><span style={s.dot2}/><span style={s.dot3}/>
        <span style={s.title}>Terminal</span>
        {isRunning && <span style={s.running}>● Running...</span>}
      </div>
      <div style={s.body}>
        {output ? lines.map((line, i) => (
          <div key={i} style={{
            ...s.line,
            color: line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')
              ? '#f85149' : '#7ee787'
          }}>{line}</div>
        )) : (
          <span style={s.placeholder}>Run code to see output here...</span>
        )}
      </div>
    </div>
  );
}

const s = {
  terminal:    { height: '100%', background: '#0d1117', display: 'flex', flexDirection: 'column', borderTop: '1px solid #30363d' },
  header:      { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#161b22', borderBottom: '1px solid #30363d' },
  dot1:        { width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' },
  dot2:        { width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' },
  dot3:        { width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' },
  title:       { color: '#8b949e', fontSize: 13, marginLeft: 8 },
  running:     { color: '#f0883e', fontSize: 12, marginLeft: 'auto' },
  body:        { flex: 1, padding: 14, fontFamily: 'monospace', fontSize: 13, overflowY: 'auto', lineHeight: 1.6 },
  line:        { whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
  placeholder: { color: '#8b949e' }
};