import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAuthenticated } from '@/lib/auth';
import { STATUS_LIST, SuggestionStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 관리자: 상태 변경 / 답변 저장
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const update: { status?: SuggestionStatus; admin_reply?: string | null } = {};

  if (typeof body.status === 'string') {
    if (!STATUS_LIST.includes(body.status as SuggestionStatus)) {
      return NextResponse.json({ error: '잘못된 상태값입니다.' }, { status: 400 });
    }
    update.status = body.status as SuggestionStatus;
  }

  if (typeof body.admin_reply === 'string') {
    update.admin_reply = body.admin_reply.trim() === '' ? null : body.admin_reply;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('suggestions')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    console.error('[admin:update]', error);
    return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data });
}
