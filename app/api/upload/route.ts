import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabaseAdmin';
import { isAllowedFile, MAX_FILE_MB, MAX_FILES } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 첨부파일 업로드 → Supabase Storage → public URL 배열 반환
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll('files').filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ urls: [] });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `첨부파일은 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.` },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!isAllowedFile(file.name)) {
        return NextResponse.json(
          { error: `허용되지 않는 파일 형식입니다: ${file.name}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `"${file.name}" 파일이 너무 큽니다 (최대 ${MAX_FILE_MB}MB).` },
          { status: 400 }
        );
      }

      // 원본 파일명을 유지하되, 고유 폴더로 감싸 충돌을 방지
      const cleanName = file.name.replace(/[/\\]/g, '_');
      const folder = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const path = `${folder}/${cleanName}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(path, arrayBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (error) {
        console.error('[upload]', error);
        return NextResponse.json(
          { error: `파일 업로드에 실패했습니다: ${file.name}` },
          { status: 500 }
        );
      }

      const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (e) {
    console.error('[upload:POST]', e);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
