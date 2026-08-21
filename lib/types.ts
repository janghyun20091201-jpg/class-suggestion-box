export type SuggestionType = 'ANONYMOUS' | 'NAMED';

export type SuggestionStatus = '접수됨' | '검토 중' | '완료';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  author_name: string | null;
  content: string;
  file_urls: string[];
  status: SuggestionStatus;
  admin_reply: string | null;
  ticket_code: string;
  created_at: string;
}

export const STATUS_LIST: SuggestionStatus[] = ['접수됨', '검토 중', '완료'];
