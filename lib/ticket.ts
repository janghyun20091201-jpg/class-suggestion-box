import crypto from 'crypto';

// 서버 전용: SUG-482913 형태의 6자리 접수코드 (총 10자, varchar(10)에 정확히 맞음)
export function generateTicketCode(): string {
  const n = crypto.randomInt(0, 1_000_000); // 000000 ~ 999999
  return `SUG-${n.toString().padStart(6, '0')}`;
}
