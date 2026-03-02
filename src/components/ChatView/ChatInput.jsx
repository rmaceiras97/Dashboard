import { useState } from 'react';
import useStore from '../../store/useStore.js';
import api from '../../api/client.js';

export default function ChatInput({ conversationId }) {
  const [texto, setTexto]   = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]   = useState('');
  const selectedMode = useStore((s) => s.selectedMode);
  const isHuman = selectedMode === 'human';

  async function handleSend() {
    const msg = texto.trim();
    if (!msg || sending) return;
    setError('');
    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/send`, { mensaje: msg });
      setTexto('');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'WINDOW_EXPIRED') {
        setError('Ventana de 24h expirada. Espera a que el cliente escriba primero.');
      } else {
        setError(err.response?.data?.error || 'Error al enviar');
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Si la IA está activa, mostrar estado en lugar del input
  if (!isHuman) {
    return (
      <div className="px-4 py-3 bg-[#1f2c33] border-t border-[#2a3942] flex-shrink-0">
        <div className="flex items-center justify-center gap-2 text-[#8696a0] text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          IA respondiendo automáticamente — presiona "Tomar control" para intervenir
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 bg-[#1f2c33] border-t border-[#2a3942] flex-shrink-0">
      {error && (
        <p className="text-red-400 text-xs mb-2 px-1">{error}</p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none max-h-32 overflow-y-auto"
          style={{ minHeight: '42px' }}
        />
        <button
          onClick={handleSend}
          disabled={!texto.trim() || sending}
          className="w-10 h-10 bg-[#00a884] hover:bg-[#06cf9c] disabled:bg-[#374045] disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>
      <p className="text-[10px] text-[#8696a0] mt-1.5 px-1">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
