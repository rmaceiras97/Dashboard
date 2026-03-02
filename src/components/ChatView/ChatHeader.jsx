import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore.js';
import api from '../../api/client.js';

export default function ChatHeader({ conversation }) {
  const { setSelectedMode, updateConversationMode, updateContactName, selectConversation } = useStore();
  const [loading, setLoading]       = useState(false);
  const [editing, setEditing]       = useState(false);
  const [nameInput, setNameInput]   = useState('');
  const [savingName, setSavingName] = useState(false);
  const inputRef = useRef(null);

  const contact = conversation.contacto;
  const phone   = (contact?.telefono || '').replace('whatsapp:', '');
  const name    = contact?.nombre || phone;
  const isHuman = conversation.modo === 'human';

  useEffect(() => {
    if (editing) {
      setNameInput(contact?.nombre || '');
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === contact?.nombre) { setEditing(false); return; }
    setSavingName(true);
    try {
      await api.patch(`/conversations/${conversation.id}/contact-name`, { nombre: trimmed });
      updateContactName(conversation.id, trimmed);
      setEditing(false);
    } catch (err) {
      console.error('Error guardando nombre:', err);
    } finally {
      setSavingName(false);
    }
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter')  handleSaveName();
    if (e.key === 'Escape') setEditing(false);
  }

  async function handleTakeover() {
    setLoading(true);
    try {
      await api.post(`/conversations/${conversation.id}/takeover`);
      setSelectedMode('human');
      updateConversationMode(conversation.id, 'human');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al tomar control');
    } finally {
      setLoading(false);
    }
  }

  async function handleRelease() {
    setLoading(true);
    try {
      await api.post(`/conversations/${conversation.id}/release`);
      setSelectedMode('ai');
      updateConversationMode(conversation.id, 'ai');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al liberar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center px-3 py-3 bg-[#1f2c33] border-b border-[#2a3942] flex-shrink-0 gap-2">
      {/* Botón volver — solo móvil */}
      <button
        onClick={() => selectConversation(null)}
        className="md:hidden text-[#8696a0] hover:text-[#e9edef] p-1 flex-shrink-0"
        aria-label="Volver"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white ${
        isHuman ? 'bg-blue-600' : 'bg-[#00a884]'
      }`}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Nombre editable + teléfono */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={handleSaveName}
            disabled={savingName}
            className="bg-[#2a3942] text-[#e9edef] text-sm px-2 py-0.5 rounded border border-[#00a884] focus:outline-none w-40 max-w-full"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[#e9edef] text-sm font-medium hover:text-white flex items-center gap-1 group max-w-full truncate"
            title="Editar nombre"
          >
            <span className="truncate">{name}</span>
            <svg className="w-3 h-3 text-[#8696a0] opacity-0 group-hover:opacity-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        <p className="text-[#8696a0] text-xs truncate">{phone}</p>
      </div>

      {/* Modo badge + botón control */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium ${
          isHuman ? 'bg-blue-900/60 text-blue-300' : 'bg-emerald-900/50 text-emerald-400'
        }`}>
          {isHuman ? '👤 Humano' : '🤖 IA'}
        </span>

        {isHuman ? (
          <button
            onClick={handleRelease}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '...' : 'Volver a IA'}
          </button>
        ) : (
          <button
            onClick={handleTakeover}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '...' : 'Tomar control'}
          </button>
        )}
      </div>
    </div>
  );
}
