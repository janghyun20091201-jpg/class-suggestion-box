import crypto from 'crypto';

// 서버 전용: 숫자 6자리 접수코드 (예: 482913)
export function generateTicketCode(): string {
  const n = crypto.randomInt(0, 1_000_000); // 000000 ~ 999999
  return n.toString().padStart(6, '0');
}

/** 사용자가 입력한 코드를 정규화 (숫자만 6자리로) */
export function normalizeCode(input: string): string | null {
  const digits = (input || '').replace(/\D/g, '');
  if (digits.length !== 6) return null;
  return digits;
}
