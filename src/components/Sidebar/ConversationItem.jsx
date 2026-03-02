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
      className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-[#2a3942] transition-colors text-left border-b border-[#1f2c33] ${
        isSelected ? 'bg-[#2a3942]' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white text-base ${
        isHuman ? 'bg-blue-600' : 'bg-[#00a884]'
      }`}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[#e9edef] text-sm font-medium truncate pr-2">{name}</span>
          <span className="text-[#8696a0] text-[11px] flex-shrink-0">{formatTime(time)}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className={`text-xs truncate ${unread > 0 ? 'text-[#e9edef] font-medium' : 'text-[#8696a0]'}`}>
            {preview}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Badge de no leídos */}
            {unread > 0 && (
              <span className="min-w-[18px] h-[18px] rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
            {/* Modo IA / Humano */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              isHuman ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/40 text-emerald-400'
            }`}>
              {isHuman ? '👤' : '🤖'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
