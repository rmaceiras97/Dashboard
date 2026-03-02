import { useState, useEffect } from 'react';
import { formatFullTime, parseAudioUrl } from '../../utils/format.js';
import api, { API_BASE } from '../../api/client.js';

export default function MessageBubble({ message }) {
  const { rol, contenido, created_at } = message;
  const [audioSrc, setAudioSrc] = useState(null);

  const isUser    = rol === 'user';
  const isAgent   = rol === 'human_agent';
  const isBot     = rol === 'assistant';
  const audioUrl  = parseAudioUrl(contenido);

  // Cargar audio vía proxy autenticado
  useEffect(() => {
    if (!audioUrl) return;
    api.get('/media/proxy', {
      params: { url: audioUrl },
      responseType: 'blob',
    }).then((res) => {
      setAudioSrc(URL.createObjectURL(res.data));
    }).catch(() => {
      setAudioSrc(null);
    });
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [audioUrl]);

  // Layout: user = izquierda, bot/agente = derecha
  const alignRight = isBot || isAgent;

  const bubbleColor = isUser
    ? 'bg-[#202c33] text-[#e9edef]'
    : isAgent
      ? 'bg-[#1d4ed8] text-white'
      : 'bg-[#005c4b] text-[#e9edef]';

  const label = isAgent ? '👤 Agente' : isBot ? '🤖 Jarvis' : null;

  return (
    <div className={`flex ${alignRight ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[75%] px-3 py-2 rounded-lg ${bubbleColor} shadow-sm`}>
        {/* Etiqueta de quien envía (solo para bot/agente) */}
        {label && (
          <p className="text-[10px] opacity-70 mb-1 font-medium">{label}</p>
        )}

        {/* Contenido: audio o texto */}
        {audioUrl ? (
          <div>
            {audioSrc ? (
              <audio controls src={audioSrc} />
            ) : (
              <span className="text-xs opacity-70">🎤 Cargando audio...</span>
            )}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{contenido}</p>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] mt-1 opacity-60 ${alignRight ? 'text-right' : 'text-left'}`}>
          {formatFullTime(created_at)}
        </p>
      </div>
    </div>
  );
}
