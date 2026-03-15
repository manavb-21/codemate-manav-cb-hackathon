import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import { SocketProvider } from './context/SocketContext';
import TADashboard from './pages/TADashboard';
import HistoryViewer from './pages/HistoryViewer';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/room/:roomId" element={<PrivateRoute><Room /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/ta-dashboard" element={<PrivateRoute><TADashboard /></PrivateRoute>} />
          <Route path="/history/:roomId" element={<PrivateRoute><HistoryViewer /></PrivateRoute>} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}