import Link from 'next/link';
import { PenLine, ChevronRight, MessagesSquare, KeyRound, CheckCircle2 } from 'lucide-react';
import CodeLookup from '@/components/CodeLookup';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-14">
      {/* 건의하기 — 최상단 */}
      <Link
        href="/submit"
        className="group flex items-center gap-4 rounded-3xl border border-black/[0.08] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-card-hover sm:p-7"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-appleblue/10 text-appleblue transition-transform duration-300 group-hover:scale-105">
          <PenLine className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">건의하기</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">
            익명 또는 일반 중에서 선택해 의견을 남길 수 있어요.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>

      {/* 코드로 답변 확인 */}
      <div className="mt-4">
        <CodeLookup />
      </div>

      {/* 진행 안내 */}
      <section className="mt-12">
        <div className="rounded-3xl border border-black/[0.08] bg-surface-gray px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="text-center text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            이렇게 진행돼요
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <Step
              icon={<MessagesSquare className="h-5 w-5" strokeWidth={1.8} />}
              step="1"
              title="건의 작성"
              desc="내용을 남기세요."
            />
            <Step
              icon={<KeyRound className="h-5 w-5" strokeWidth={1.8} />}
              step="2"
              title="코드 저장"
              desc="발급된 6자리 접수코드를 안전하게 보관해요."
            />
            <Step
              icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />}
              step="3"
              title="답변 확인"
              desc="관리자가 확인 후 답변을 남기면 코드로 확인해요."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  desc,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-appleblue shadow-card">
        {icon}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-appleblue">
        STEP {step}
      </p>
      <h3 className="mt-1 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}
