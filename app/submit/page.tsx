import Link from 'next/link';
import { EyeOff, PenLine, ChevronRight, ArrowLeft } from 'lucide-react';
import SubmitForm from '@/components/SubmitForm';

export default function SubmitPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type =
    searchParams.type === 'named'
      ? ('NAMED' as const)
      : searchParams.type === 'anonymous'
      ? ('ANONYMOUS' as const)
      : null;

  // 유형을 아직 고르지 않았으면 선택 화면
  if (!type) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> 홈으로
        </Link>

        <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-3xl">건의하기</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          어떤 방식으로 건의할지 선택해 주세요.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <ChoiceCard
            href="/submit?type=anonymous"
            icon={<EyeOff className="h-6 w-6" strokeWidth={1.8} />}
            accent="bg-accent text-white"
            title="익명으로 건의하기"
            desc="이름이 저장되지 않아요. 누가 작성했는지 아무도 알 수 없습니다."
          />
          <ChoiceCard
            href="/submit?type=named"
            icon={<PenLine className="h-6 w-6" strokeWidth={1.8} />}
            accent="bg-surface-gray text-ink ring-1 ring-inset ring-black/[0.08]"
            title="일반으로 건의하기"
            desc="이름과 함께 남겨요. 더 구체적인 답변이 필요할 때 좋아요."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <SubmitForm type={type} />
    </div>
  );
}

function ChoiceCard({
  href,
  icon,
  accent,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  accent: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-black/[0.08] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-card-hover"
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${accent} transition-transform duration-300 group-hover:scale-105`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{desc}</p>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  );
}
