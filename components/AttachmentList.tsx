import { Download, FileText, ImageIcon } from 'lucide-react';
import { fileNameFromUrl, extOf } from '@/lib/utils';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg'];

export default function AttachmentList({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {urls.map((url, i) => {
        const name = fileNameFromUrl(url);
        const isImg = IMAGE_EXT.includes(extOf(name));
        return (
          <a
            key={`${url}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 transition-colors hover:border-appleblue/40 hover:bg-appleblue/[0.03]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-gray text-ink-soft">
              {isImg ? (
                <ImageIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              ) : (
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} />
              )}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
            <Download className="h-4 w-4 flex-shrink-0 text-ink-muted transition-colors group-hover:text-appleblue" />
          </a>
        );
      })}
    </div>
  );
}
