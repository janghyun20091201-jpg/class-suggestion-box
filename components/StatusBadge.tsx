import { SuggestionStatus } from '@/lib/types';

const STYLES: Record<SuggestionStatus, { pill: string; dot: string }> = {
  '접수됨': { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  '검토 중': { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  '완료': { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

export default function StatusBadge({
  status,
  size = 'md',
}: {
  status: SuggestionStatus;
  size?: 'sm' | 'md';
}) {
  const s = STYLES[status] ?? STYLES['접수됨'];
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.pill} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
