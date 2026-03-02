export function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) {
    return date.toLocaleDateString('es', { weekday: 'short' });
  }
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
}

export function formatFullTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// Extrae la URL si el contenido tiene formato [AUDIO_URL:https://...]
export function parseAudioUrl(contenido) {
  const match = contenido?.match(/^\[AUDIO_URL:(https?:\/\/.+)\]$/);
  return match ? match[1] : null;
}
