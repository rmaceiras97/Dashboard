import useStore from '../../store/useStore.js';
import { formatTime } from '../../utils/format.js';

export default function ConversationItem({ conversation }) {
  const { selectedId, selectConversation, setSelectedMode, unreadCounts } = useStore();
  const isSelected = selectedId === conversation.id;
  const unread = unreadCounts[conversation.id] || 0;

  const contact = conversation.contacto;
  const phone   = (contact?.telefono || '').replace('whatsapp:', '');
  const name    = contact?.nombre || phone;
  const preview = conversation.ultimo_mensaje || 'Nueva conversación';
  const time    = conversation.ultimo_mensaje_at || conversation.created_at;
  const isHuman = conversation.modo === 'human';

  function handleClick() {
    selectConversation(conversation.id);
    setSelectedMode(conversation.modo);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 py-3 text-left transition-all duration-150 hover:bg-white/[0.05] ${
        isSelected ? 'glass-selected pl-[10px]' : 'pl-3'
      }`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white text-base ${
        isHuman ? 'avatar-human' : 'avatar-ai'
      }`}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center justify-between">
          <span className="text-[#f1f5f9] text-sm font-medium truncate pr-2">{name}</span>
          <span className="text-[#475569] text-[11px] flex-shrink-0">{formatTime(time)}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className={`text-xs truncate ${unread > 0 ? 'text-[#f1f5f9] font-medium' : 'text-[#64748b]'}`}>
            {preview}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Badge de no leídos */}
            {unread > 0 && (
              <span
                className="min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                style={{ background: '#ED8E06', boxShadow: '0 0 8px rgba(237,142,6,0.5)' }}
              >
                {unread > 99 ? '99+' : unread}
              </span>
            )}
            {/* Modo IA / Humano */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isHuman ? 'badge-human' : 'badge-ai'}`}>
              {isHuman ? '👤' : '🤖'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
