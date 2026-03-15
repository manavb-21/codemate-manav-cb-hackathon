import { createContext, useContext, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => io('http://localhost:5000'));
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};