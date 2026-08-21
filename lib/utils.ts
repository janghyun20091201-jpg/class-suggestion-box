// 클라이언트/서버 양쪽에서 안전하게 쓰는 순수 유틸 (Node 전용 모듈 import 금지)

const KST = 'Asia/Seoul';

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: KST,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** 허용 확장자 / 제한 */
export const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.hwp', '.hwpx', '.zip'];
export const MAX_FILE_MB = 20;
export const MAX_FILES = 5;

export function extOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

export function isAllowedFile(name: string): boolean {
  return ALLOWED_EXT.includes(extOf(name));
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 파일 URL에서 표시용 파일명 추출 */
export function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() || 'file';
    return decodeURIComponent(last);
  } catch {
    return url.split('/').pop() || 'file';
  }
}
