import Editor from '@monaco-editor/react';
import { useSocket } from '../context/SocketContext';
import { useEffect, useRef } from 'react';

export default function CodeEditor({ roomId, language, code, setCode, userRole }) {
  const socket = useSocket();
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    socket.on('code-update', ({ code: remoteCode }) => {
      isRemoteUpdate.current = true;
      setCode(remoteCode);
    });
    socket.on('load-code', ({ code: savedCode, language }) => setCode(savedCode));
    return () => socket.off('code-update');
  }, [socket]);

  const handleChange = (value) => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  return (
    <Editor
      height="70vh"
      language={language}
      value={code}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        readOnly: userRole === 'student-view', // TA can restrict
      }}
    />
  );
}