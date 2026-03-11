import { useEffect, useState } from 'react';
import useStore from '../../store/useStore.js';
import ConversationItem from './ConversationItem.jsx';

export default function Sidebar() {
  const { conversations, user, logout } = useStore();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const term = search.toLowerCase();
    const tel  = (c.contacto?.telefono || '').replace('whatsapp:', '');
    const name = (c.contacto?.nombre || '').toLowerCase();
    return tel.includes(term) || name.includes(term);
  });

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.ultimo_mensaje_at || a.created_at;
    const tb = b.ultimo_mensaje_at || b.created_at;
    return new Date(tb) - new Date(ta);
  });

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  return (
    <aside
      className="w-full h-full flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DeepFrame Media" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="text-[#f1f5f9] text-sm font-semibold tracking-wide">DeepFrame Media</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#64748b] hover:text-[#f1f5f9] text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          Salir
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <svg className="w-4 h-4 text-[#475569] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[#f1f5f9] placeholder-[#475569] text-sm focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-center text-[#475569] text-sm py-10 px-4">
            {search ? 'Sin resultados' : 'Sin conversaciones aún'}
          </div>
        ) : (
          sorted.map((c) => <ConversationItem key={c.id} conversation={c} />)
        )}
      </div>
    </aside>
  );
}
