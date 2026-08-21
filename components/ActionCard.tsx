import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';

export default function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  accent = 'blue',
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: 'blue' | 'violet' | 'teal';
}) {
  const accentMap = {
    blue: 'bg-appleblue/10 text-appleblue',
    violet: 'bg-violet-500/10 text-violet-600',
    teal: 'bg-teal-500/10 text-teal-600',
  } as const;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-3xl border border-black/[0.08] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-card-hover sm:p-7"
    >
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${accentMap[accent]} transition-transform duration-300 group-hover:scale-105`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{title}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-muted">{description}</p>

      <div className="mt-5 flex items-center gap-1 text-sm font-medium text-appleblue">
        바로가기
        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
