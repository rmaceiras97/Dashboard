import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore.js';
import { API_BASE } from '../api/client.js';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function useSocket() {
  const socketRef = useRef(null);
  const token = useStore((s) => s.token);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Conectado al servidor');
    });

    socketRef.current.on('new_message', ({ conversation_id, message }) => {
      // getState() siempre devuelve el estado actual — evita stale closures
      const { selectedId, conversations, addMessage, addToast } = useStore.getState();

      addMessage(message, conversation_id);

      // Solo notificar si la conversación NO está abierta
      if (selectedId !== conversation_id) {
        const conv = conversations.find((c) => c.id === conversation_id);
        const name = conv?.contacto?.nombre
          || (conv?.contacto?.telefono || '').replace('whatsapp:', '')
          || 'Nuevo mensaje';
        const preview = message.contenido?.startsWith('[AUDIO_URL:')
          ? '🎤 Audio recibido'
          : message.contenido?.slice(0, 80) || '...';

        // Toast dentro de la app
        addToast({ conversationId: conversation_id, name, preview });

        // Notificación del browser si la pestaña no está visible
        if (Notification.permission === 'granted' && document.visibilityState === 'hidden') {
          const notif = new Notification(`💬 ${name}`, {
            body: preview,
            icon: '/icon-192.png',
            tag: conversation_id,
          });
          notif.onclick = () => {
            window.focus();
            useStore.getState().selectConversation(conversation_id);
            notif.close();
          };
        }
      }
    });

    socketRef.current.on('conversation_update', ({ conversation_id, modo }) => {
      useStore.getState().updateConversationMode(conversation_id, modo);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('[Socket] Error de conexión:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
