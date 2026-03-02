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
          className="pointer-events-auto flex items-center gap-3 bg-[#1f2c33] border border-[#2a3942] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#2a3942] transition-colors shadow-2xl max-w-[300px] animate-toast"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {toast.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <p className="text-[#e9edef] text-sm font-medium truncate">{toast.name}</p>
            <p className="text-[#8696a0] text-xs truncate">{toast.preview}</p>
          </div>

          {/* Cerrar */}
          <button
            onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
            className="text-[#8696a0] hover:text-[#e9edef] flex-shrink-0 text-xs leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
