import SubmitForm from '@/components/SubmitForm';

export default function SubmitPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type: 'ANONYMOUS' | 'NAMED' =
    searchParams.type === 'named' ? 'NAMED' : 'ANONYMOUS';

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <SubmitForm type={type} />
    </div>
  );
}
