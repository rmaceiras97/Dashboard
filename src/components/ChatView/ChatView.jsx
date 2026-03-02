import { useEffect } from 'react';
import useStore from '../../store/useStore.js';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import ChatInput from './ChatInput.jsx';
import api from '../../api/client.js';

export default function ChatView() {
  const {
    selectedId, messages,
    setMessages, setSelectedMode,
    prependMessages, setLoadingMore,
    conversations,
  } = useStore();

  const conversation = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;

    api.get(`/conversations/${selectedId}/messages`)
      .then(({ data }) => setMessages(data.messages))
      .catch(console.error);

    if (conversation?.modo) {
      setSelectedMode(conversation.modo);
    }

    // Polling mensajes cada 10s — el socket en local no recibe eventos de Railway
    const interval = setInterval(() => {
      const { messages: current, addMessage } = useStore.getState();
      const lastTs = current[current.length - 1]?.created_at;
      if (!lastTs) return;

      api.get(`/conversations/${selectedId}/messages`)
        .then(({ data }) => {
          // Agregar solo los mensajes más nuevos que el último que tenemos
          const newMsgs = data.messages.filter(m => m.created_at > lastTs);
          newMsgs.forEach(m => addMessage(m, selectedId));
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedId]);

  async function loadMore() {
    const earliest = messages[0]?.created_at;
    if (!earliest || !selectedId) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(
        `/conversations/${selectedId}/messages?before=${encodeURIComponent(earliest)}&limit=50`
      );
      prependMessages(data.messages);
    } catch (err) {
      console.error('[loadMore]', err);
      setLoadingMore(false);
    }
  }

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#0b1014] min-w-0 overflow-hidden">
      <ChatHeader conversation={conversation} />
      {conversation.resumen && <ResumenBanner resumen={conversation.resumen} />}
      <MessageList onLoadMore={loadMore} />
      <ChatInput conversationId={selectedId} />
    </div>
  );
}

function ResumenBanner({ resumen }) {
  return (
    <div className="mx-3 mt-2 px-3 py-2 bg-[#1f2c33] border border-[#2a3942] rounded-lg flex gap-2 items-start flex-shrink-0">
      <span className="text-[#00a884] text-sm flex-shrink-0">📋</span>
      <p className="text-[#8696a0] text-xs leading-relaxed line-clamp-2">{resumen}</p>
    </div>
  );
}
