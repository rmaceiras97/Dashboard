import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import ChatView from '../components/ChatView/ChatView.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ToastContainer from '../components/Toast.jsx';
import useStore from '../store/useStore.js';
import { useSocket } from '../hooks/useSocket.js';
import api from '../api/client.js';

export default function DashboardPage() {
  const { token, selectedId, setConversations, setAuth } = useStore();
  const navigate = useNavigate();

  useSocket();

  useEffect(() => {
    const storedToken = localStorage.getItem('dashboard_token');
    if (!token && !storedToken) {
      navigate('/login');
      return;
    }

    // Restaurar user desde token si recargó la página
    if (!token && storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setAuth({ email: payload.email, nombre: payload.nombre, clienteNombre: payload.clienteNombre || '' }, storedToken);
      } catch {
        navigate('/login');
        return;
      }
    }

    function fetchConversations() {
      api.get('/conversations')
        .then(({ data }) => setConversations(data.conversations))
        .catch(console.error);
    }

    fetchConversations();

    // Polling cada 15s — compensa que en local el webhook va a Railway y el socket no llega
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[100dvh] flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #080c14 0%, #0d1521 50%, #0a1220 100%)' }}>
      {/* Sidebar: visible siempre en desktop; en móvil solo cuando no hay chat abierto */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] md:min-w-[280px] md:max-w-[360px] h-full flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Chat / EmptyState: visible siempre en desktop; en móvil solo cuando hay chat abierto */}
      <main className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
        {selectedId ? <ChatView /> : <EmptyState />}
      </main>

      <ToastContainer />
    </div>
  );
}
