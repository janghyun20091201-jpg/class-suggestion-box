import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 학생이 접수코드로 본인 건의 1건만 조회
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json().catch(() => ({ code: '' }));
    const raw = typeof code === 'string' ? code.trim().toUpperCase() : '';
    if (!raw) {
      return NextResponse.json({ error: '접수코드를 입력해 주세요.' }, { status: 400 });
    }

    // "482913" 또는 "SUG-482913" 둘 다 허용
    const normalized = raw.startsWith('SUG-') ? raw : `SUG-${raw}`;

    const { data, error } = await supabaseAdmin
      .from('suggestions')
      .select(
        'id, type, author_name, content, file_urls, status, admin_reply, ticket_code, created_at'
      )
      .eq('ticket_code', normalized)
      .maybeSingle();

    if (error) {
      console.error('[check:POST]', error);
      return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: '해당 코드의 건의를 찾을 수 없습니다. 코드를 다시 확인해 주세요.' },
        { status: 404 }
      );
    }

    // 익명 건의는 이름을 절대 노출하지 않음
    if (data.type === 'ANONYMOUS') {
      data.author_name = null;
    }

    return NextResponse.json({ suggestion: data });
  } catch (e) {
    console.error('[check:POST]', e);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
