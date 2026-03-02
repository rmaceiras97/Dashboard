import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem('dashboard_token'),

  setAuth(user, token) {
    localStorage.setItem('dashboard_token', token);
    set({ user, token });
  },

  logout() {
    localStorage.removeItem('dashboard_token');
    set({ user: null, token: null });
  },

  // ── Conversaciones ──────────────────────────────────────────────────────────
  conversations: [],
  selectedId: null,
  unreadCounts: {}, // { [conversationId]: number }

  setConversations(conversations) {
    set({ conversations });
  },

  selectConversation(id) {
    set({
      selectedId: id,
      messages: [],
      messagesLoaded: false,
      hasMore: false,
      loadingMore: false,
      unreadCounts: { ...get().unreadCounts, [id]: 0 },
    });
  },

  updateConversationMode(conversationId, modo) {
    set({
      conversations: get().conversations.map((c) =>
        c.id === conversationId ? { ...c, modo } : c
      ),
    });
    if (get().selectedId === conversationId) {
      set({ selectedMode: modo });
    }
  },

  updateContactName(conversationId, nombre) {
    set({
      conversations: get().conversations.map((c) =>
        c.id === conversationId
          ? { ...c, contacto: { ...c.contacto, nombre } }
          : c
      ),
    });
  },

  // ── Mensajes (de la conversación abierta) ───────────────────────────────────
  messages: [],
  messagesLoaded: false,
  selectedMode: 'ai',
  hasMore: false,
  loadingMore: false,

  setMessages(messages) {
    set({ messages, messagesLoaded: true, hasMore: messages.length >= 50 });
  },

  prependMessages(olderMessages) {
    set({
      messages: [...olderMessages, ...get().messages],
      hasMore: olderMessages.length >= 50,
      loadingMore: false,
    });
  },

  setLoadingMore(val) {
    set({ loadingMore: val });
  },

  setSelectedMode(modo) {
    set({ selectedMode: modo });
  },

  addMessage(message, conversationId) {
    const { selectedId, messages, conversations, unreadCounts } = get();

    // Agregar al chat si está abierto
    if (selectedId === conversationId) {
      set({ messages: [...messages, message] });
    } else {
      // Incrementar no leídos
      set({
        unreadCounts: {
          ...unreadCounts,
          [conversationId]: (unreadCounts[conversationId] || 0) + 1,
        },
      });
    }

    // Actualizar preview en sidebar
    set({
      conversations: conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              ultimo_mensaje: message.contenido?.slice(0, 80) || '🎤 Audio',
              ultimo_mensaje_at: message.created_at || new Date().toISOString(),
            }
          : c
      ),
    });
  },

  // ── Toasts ──────────────────────────────────────────────────────────────────
  toasts: [],

  addToast(toast) {
    const id = Date.now();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 4000);
  },

  removeToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export default useStore;
