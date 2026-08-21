import CheckClient from '@/components/CheckClient';

export default function CheckPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <CheckClient initialCode={searchParams.code ?? ''} />
    </div>
  );
}
