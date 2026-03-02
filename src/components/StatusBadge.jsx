export default function StatusBadge({ mode, size = 'sm' }) {
  const isHuman = mode === 'human';
  const base = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <span className={`${base} rounded-full font-medium flex-shrink-0 ${
      isHuman
        ? 'bg-blue-900/50 text-blue-300'
        : 'bg-emerald-900/50 text-emerald-400'
    }`}>
      {isHuman ? '👤' : '🤖'}
    </span>
  );
}
