export default function StatusBadge({ mode, size = 'sm' }) {
  const isHuman = mode === 'human';
  const base = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`${base} rounded-full font-medium flex-shrink-0`}
      style={
        isHuman
          ? { background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }
          : { background: 'rgba(237,142,6,0.15)', color: '#ED8E06', border: '1px solid rgba(237,142,6,0.2)' }
      }
    >
      {isHuman ? '👤' : '🤖'}
    </span>
  );
}
