import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 관리자: 전체 건의 목록 (최신순)
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin:list]', error);
    return NextResponse.json({ error: '목록을 불러오지 못했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data ?? [] });
}
