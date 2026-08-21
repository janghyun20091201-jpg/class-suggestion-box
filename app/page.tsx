import ActionCard from '@/components/ActionCard';
import { EyeOff, PenLine, ClipboardCheck, ShieldCheck, MessagesSquare, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-surface-gray to-white" />
        <div className="relative mx-auto max-w-content px-5 pb-6 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="mb-3 text-sm font-medium text-appleblue">우리 반 건의함</p>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            무엇을 도와드릴까요?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-ink-muted sm:text-lg">
            우리 반을 위한 솔직한 의견을 남겨주세요.
          </p>
        </div>
      </section>

      {/* Action cards */}
      <section className="mx-auto max-w-content px-5 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <ActionCard
            href="/submit?type=anonymous"
            icon={EyeOff}
            title="익명 건의하기"
            description="이름을 밝히지 않고 편하게 의견을 남길 수 있어요. 누가 썼는지 아무도 알 수 없습니다."
            accent="blue"
          />
          <ActionCard
            href="/submit?type=named"
            icon={PenLine}
            title="일반 건의하기"
            description="이름과 함께 건의를 남겨요. 더 구체적인 답변이나 후속 논의가 필요할 때 좋아요."
            accent="violet"
          />
          <ActionCard
            href="/check"
            icon={ClipboardCheck}
            title="내 건의 답변 확인하기"
            description="접수할 때 받은 6자리 코드로 처리 상태와 관리자의 답변을 확인할 수 있어요."
            accent="teal"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-content px-5 pb-4 sm:px-6">
        <div className="rounded-3xl border border-black/[0.08] bg-surface-gray px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="text-center text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            이렇게 진행돼요
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <Step
              icon={<MessagesSquare className="h-5 w-5" strokeWidth={1.8} />}
              step="1"
              title="건의 작성"
              desc="익명 또는 일반으로 내용을 남기고 파일을 첨부해요."
            />
            <Step
              icon={<Clock className="h-5 w-5" strokeWidth={1.8} />}
              step="2"
              title="코드 저장"
              desc="발급된 6자리 접수코드를 안전하게 보관해요."
            />
            <Step
              icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.8} />}
              step="3"
              title="답변 확인"
              desc="관리자가 검토 후 상태와 답변을 남기면 코드로 확인해요."
            />
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <section className="mx-auto max-w-content px-5 py-8 text-center sm:px-6">
        <div className="mx-auto inline-flex max-w-2xl items-start gap-3 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 text-left">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-appleblue" strokeWidth={1.8} />
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">익명 건의는 이름이 저장되지 않습니다.</span>{' '}
            학생은 다른 사람의 건의를 볼 수 없고, 본인 코드로만 조회할 수 있어요.
          </p>
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
