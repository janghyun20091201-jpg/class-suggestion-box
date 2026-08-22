import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateTicketCode } from '@/lib/ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 학생 건의 접수 (익명/일반)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type =
      body.type === 'NAMED' ? 'NAMED' : body.type === 'ANONYMOUS' ? 'ANONYMOUS' : null;
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const authorName = typeof body.author_name === 'string' ? body.author_name.trim() : '';

    if (!type) {
      return NextResponse.json({ error: '잘못된 건의 유형입니다.' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: '건의 내용을 입력해 주세요.' }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: '내용이 너무 깁니다 (최대 5000자).' }, { status: 400 });
    }
    if (type === 'NAMED' && !authorName) {
      return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 });
    }

    // 유니크한 접수코드 생성 — 충돌 시 최대 8회 재시도
    let ticket = '';
    let createdAt = '';
    for (let i = 0; i < 8; i++) {
      const candidate = generateTicketCode();
      const { data, error } = await supabaseAdmin
        .from('suggestions')
        .insert({
          type,
          author_name: type === 'NAMED' ? authorName.slice(0, 50) : null,
          content,
          ticket_code: candidate,
        })
        .select('ticket_code, created_at')
        .single();

      if (!error && data) {
        ticket = data.ticket_code;
        createdAt = data.created_at;
        break;
      }
      // 23505 = unique_violation → 다른 코드로 재시도, 그 외 에러는 즉시 중단
      if (error && error.code !== '23505') {
        console.error('[suggestions:insert]', error);
        return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    if (!ticket) {
      return NextResponse.json(
        { error: '접수코드 생성에 실패했습니다. 다시 시도해 주세요.' },
        { status: 500 }
      );
    }

    // 몇 번째 건의인지 계산 (이 건의 포함, 접수 순서)
    let order: number | null = null;
    const { count, error: countError } = await supabaseAdmin
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .lte('created_at', createdAt);

    if (!countError && typeof count === 'number') {
      order = count;
    }

    return NextResponse.json({ ticket_code: ticket, order }, { status: 201 });
  } catch (e) {
    console.error('[suggestions:POST]', e);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
