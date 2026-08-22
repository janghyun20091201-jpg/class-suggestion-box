import { SuggestionStatus } from '@/lib/types';

// 흑백 톤: 접수됨 = 옅은 회색 / 완료 = 검정 채움
const STYLES: Record<string, string> = {
  '접수됨': 'bg-surface-gray text-ink-soft ring-1 ring-inset ring-black/[0.06]',
  '완료': 'bg-accent text-white',
};

export default function StatusBadge({
  status,
  size = 'md',
}: {
  status: SuggestionStatus | string;
  size?: 'sm' | 'md';
}) {
  const style = STYLES[status] ?? STYLES['접수됨'];
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${style} ${sizeClass}`}>
      {status}
    </span>
  );
}
