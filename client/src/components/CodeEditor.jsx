import Editor from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export default function CodeEditor({ roomId, language, code, setCode, userRole }) {
  const socket = useSocket();
  const isRemote = useRef(false);

  useEffect(() => {
    socket.on('code-update', ({ code: c }) => {
      isRemote.current = true;
      setCode(c);
    });
    return () => socket.off('code-update');
  }, [socket]);

  const handleChange = (value) => {
    if (isRemote.current) { isRemote.current = false; return; }
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        readOnly: userRole === 'student',
      }}
    />
  );
}