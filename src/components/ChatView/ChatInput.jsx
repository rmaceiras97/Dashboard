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
      <div className="glass-md px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: 0 }}>
        <div className="flex items-center justify-center gap-2 text-[#64748b] text-sm">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#ED8E06', boxShadow: '0 0 6px rgba(237,142,6,0.7)' }}
          />
          IA respondiendo automáticamente — presiona "Tomar control" para intervenir
        </div>
      </div>
    );
  }

  const canSend = texto.trim() && !sending && ventana.activa;

  return (
    <div className="glass-md flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: 0 }}>
      {/* Banner ventana */}
      <div
        className={`px-4 py-1.5 text-xs flex items-center gap-1.5 border-b ${
          ventana.activa
            ? 'text-[#ED8E06] border-[rgba(237,142,6,0.12)]'
            : 'text-[#64748b] border-[rgba(255,255,255,0.06)]'
        }`}
        style={{ background: ventana.activa ? 'rgba(237,142,6,0.06)' : 'rgba(255,255,255,0.02)' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: ventana.activa ? '#ED8E06' : '#475569' }}
        />
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
            className={`glass-input flex-1 rounded-xl px-4 py-2.5 text-sm resize-none max-h-32 overflow-y-auto transition-all duration-200 ${sending ? 'opacity-60 cursor-wait' : ''}`}
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            style={{
              background: canSend ? 'linear-gradient(135deg, #ED8E06, #f59e0b)' : 'rgba(255,255,255,0.08)',
              boxShadow: canSend ? '0 0 18px rgba(237,142,6,0.45)' : 'none',
            }}
          >
            {sending ? (
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white dot-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-white dot-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-white dot-3" />
              </span>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
        {ventana.activa && (
          <p className="text-[10px] text-[#475569] mt-1.5 px-1">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        )}
      </div>
    </div>
  );
}
