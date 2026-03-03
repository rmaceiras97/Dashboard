import { useState, useEffect } from 'react';
import useStore from '../../store/useStore.js';
import api from '../../api/client.js';

function formatTTL(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ChatInput({ conversationId }) {
  const [texto, setTexto]   = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]   = useState('');
  const [ventana, setVentana] = useState({ activa: true, remainingSeconds: null });
  const selectedMode = useStore((s) => s.selectedMode);
  const isHuman = selectedMode === 'human';

  useEffect(() => {
    if (!conversationId) return;
    function fetchVentana() {
      api.get(`/conversations/${conversationId}/window`)
        .then(({ data }) => setVentana(data))
        .catch(() => {});
    }
    fetchVentana();
    const t = setInterval(fetchVentana, 60_000);
    return () => clearInterval(t);
  }, [conversationId]);

  async function handleSend() {
    const msg = texto.trim();
    if (!msg || sending || !ventana.activa) return;
    setError('');
    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/send`, { mensaje: msg });
      setTexto('');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'WINDOW_EXPIRED') {
        setVentana({ activa: false, remainingSeconds: 0 });
        setError('Ventana cerrada. El cliente debe escribir primero.');
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
    <div className="bg-[#1f2c33] border-t border-[#2a3942] flex-shrink-0">
      {/* Banner ventana */}
      <div className={`px-4 py-1.5 text-xs flex items-center gap-1.5 ${
        ventana.activa
          ? 'bg-[#0d2a1f] text-[#25d366]'
          : 'bg-[#2a1a1a] text-[#8696a0]'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ventana.activa ? 'bg-[#25d366]' : 'bg-[#8696a0]'}`} />
        {ventana.activa && ventana.remainingSeconds !== null
          ? `Ventana abierta · ${formatTTL(ventana.remainingSeconds)} restantes`
          : ventana.activa
            ? 'Ventana abierta'
            : 'Ventana cerrada · El cliente debe escribir primero'}
      </div>

      <div className="px-3 py-3">
        {error && (
          <p className="text-red-400 text-xs mb-2 px-1">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ventana.activa ? 'Escribe un mensaje...' : 'Ventana cerrada'}
            disabled={!ventana.activa}
            rows={1}
            className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none max-h-32 overflow-y-auto disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!texto.trim() || sending || !ventana.activa}
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
        {ventana.activa && (
          <p className="text-[10px] text-[#8696a0] mt-1.5 px-1">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        )}
      </div>
    </div>
  );
}
