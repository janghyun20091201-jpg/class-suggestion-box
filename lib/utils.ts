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
