import { useEffect, useLayoutEffect, useRef } from 'react';
import useStore from '../../store/useStore.js';
import MessageBubble from './MessageBubble.jsx';

export default function MessageList({ onLoadMore }) {
  const { messages, messagesLoaded, hasMore, loadingMore } = useStore();
  const containerRef   = useRef(null);
  const bottomRef      = useRef(null);
  const prevCountRef   = useRef(0);
  const isPrependRef   = useRef(false);
  const savedHeightRef = useRef(0);

  // Scroll instantáneo al fondo en carga inicial
  useEffect(() => {
    if (messagesLoaded && prevCountRef.current === 0 && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messagesLoaded]);

  // Scroll suave al fondo en mensajes nuevos (socket / send)
  useEffect(() => {
    if (!messagesLoaded) return;
    if (isPrependRef.current) {
      isPrependRef.current = false;
      prevCountRef.current = messages.length;
      return;
    }
    if (prevCountRef.current > 0 && messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = messages.length;
  }, [messages.length, messagesLoaded]);

  // Restaurar posición antes del paint tras prepend
  useLayoutEffect(() => {
    if (savedHeightRef.current > 0 && containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight - savedHeightRef.current;
      savedHeightRef.current = 0;
    }
  }, [messages.length]);

  async function handleLoadMore() {
    if (!containerRef.current) return;
    savedHeightRef.current = containerRef.current.scrollHeight;
    isPrependRef.current = true;
    await onLoadMore?.();
  }

  if (!messagesLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#8696a0] text-sm">Sin mensajes aún</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
      {hasMore && (
        <div className="flex justify-center pb-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 text-xs text-[#8696a0] hover:text-[#e9edef] bg-[#1f2c33] hover:bg-[#2a3942] px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="w-3 h-3 border border-[#8696a0] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {loadingMore ? 'Cargando...' : 'Mensajes anteriores'}
          </button>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id || msg.created_at} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
