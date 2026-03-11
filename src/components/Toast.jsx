import useStore from '../store/useStore.js';

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const selectConversation = useStore((s) => s.selectConversation);
  const removeToast = useStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => {
            selectConversation(toast.conversationId);
            removeToast(toast.id);
          }}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 max-w-[300px] animate-toast"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #ED8E06, #f59e0b)',
              boxShadow: '0 2px 10px rgba(237,142,6,0.4)',
            }}
          >
            {toast.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <p className="text-[#f1f5f9] text-sm font-medium truncate">{toast.name}</p>
            <p className="text-[#64748b] text-xs truncate">{toast.preview}</p>
          </div>

          {/* Cerrar */}
          <button
            onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
            className="text-[#475569] hover:text-[#f1f5f9] flex-shrink-0 text-xs leading-none transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
