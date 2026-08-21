# 우리 반 건의함 · Class Suggestion Box

Apple 지원(Apple Support) 스타일의 학급 건의함 웹앱입니다.
**Next.js 14 (App Router) · Tailwind CSS · Lucide Icons · Supabase** 로 만들었습니다.

- 학생: 로그인 없이 **익명/일반 건의**를 남기고, 발급된 **6자리 접수코드**로 처리 상태·답변을 확인
- 관리자(반장·부반장·선생님): 비밀번호 로그인 후 전체 건의 확인, 상태 변경, 답변 작성

---

## 1. 빠른 시작 (로컬 실행)

> 이 컴퓨터에는 Node.js가 설치되어 있지 않습니다. 아래 순서로 먼저 설치하세요.

### 1) Node.js 설치 (최초 1회)
- <https://nodejs.org> 에서 **LTS 버전**을 내려받아 설치합니다.
- 터미널에서 확인:
  ```bash
  node -v
  npm -v
  ```

### 2) 의존성 설치
```bash
cd "class-suggestion-box"
npm install
```

### 3) Supabase 준비
1. <https://supabase.com> 에서 프로젝트를 생성합니다.
2. 대시보드 → **SQL Editor** 에 `supabase-schema.sql` 내용을 붙여넣고 실행합니다.
   (테이블 `suggestions` + Storage 버킷 `attachments` 가 만들어집니다.)
3. **Project Settings → API** 에서 아래 값을 복사합니다.
   - `Project URL`
   - `service_role` secret (⚠️ 절대 공개 금지)

### 4) 환경변수 설정
`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...        # service_role secret
SUPABASE_STORAGE_BUCKET=attachments
ADMIN_PASSWORD=원하는_관리자_비밀번호
SESSION_SECRET=길고_무작위한_문자열
```

### 5) 개발 서버 실행
```bash
npm run dev
```
브라우저에서 <http://localhost:3000> 접속.

---

## 2. Vercel 배포 (권장)

1. 이 폴더를 GitHub 저장소로 올립니다.
2. <https://vercel.com> → **New Project** → 저장소 선택.
3. **Environment Variables** 에 위 5개 값을 그대로 입력합니다.
4. Deploy. (프레임워크는 자동으로 Next.js 로 인식됩니다.)

> **첨부파일 용량 참고:** Vercel 서버리스 함수는 요청 본문이 약 4.5MB로 제한됩니다.
> 큰 파일(최대 20MB)을 자주 올릴 예정이면, `npm start`로 자체 호스팅하거나
> 업로드 방식을 Supabase 직접 업로드(Signed URL)로 바꾸면 됩니다. (아래 "확장 아이디어" 참고)

---

## 3. 페이지 구조

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 · 3개 액션 카드 (익명/일반/답변확인) |
| `/submit?type=anonymous` | 익명 건의 작성 |
| `/submit?type=named` | 일반(이름) 건의 작성 |
| `/check` | 6자리 코드로 내 건의 조회 |
| `/admin` | 관리자 로그인 + 대시보드 |

### API 라우트
| 메서드 · 경로 | 설명 |
| --- | --- |
| `POST /api/suggestions` | 건의 접수 (코드 발급) |
| `POST /api/check` | 접수코드로 1건 조회 |
| `POST /api/upload` | 첨부파일 업로드 → public URL |
| `POST /api/admin/login` | 관리자 로그인 (쿠키 발급) |
| `POST /api/admin/logout` | 로그아웃 |
| `GET /api/admin/suggestions` | 전체 목록 (인증 필요) |
| `PATCH /api/admin/suggestions/[id]` | 상태·답변 수정 (인증 필요) |

---

## 4. 보안 설계

- 모든 DB 접근은 **서버 라우트에서 service_role 키로만** 이루어집니다.
  `suggestions` 테이블은 RLS를 켜고 정책을 두지 않아 anon 키로는 접근 불가.
- 학생은 **본인 코드로 1건만** 조회할 수 있고, 다른 사람 건의는 볼 수 없습니다.
- **익명** 건의는 이름을 저장/노출하지 않습니다.
- 제출 후 학생의 수정·삭제는 불가능합니다.
- 관리자 인증은 `ADMIN_PASSWORD` 비교 후 `SESSION_SECRET` 서명 쿠키(httpOnly, 8시간)로 유지합니다.
  비밀번호를 바꾸면 기존 세션은 자동 무효화됩니다.

---

## 5. 디자인 시스템 (Apple Support 테마)

- 색상: 배경 `#ffffff` / `#f5f5f7`, 본문 `#1d1d1f`, 보조 `#86868b`, 포인트 `#0071e3`
- 카드: `1px solid rgba(0,0,0,0.08)` 테두리, `rounded-2xl`/`rounded-3xl`, 과한 그림자 없음
- 폰트: **Pretendard** (Apple SD Gothic Neo 대응 웹폰트) + 시스템 폰트 폴백
  - `app/globals.css` 상단 `@import` 로 로드합니다. 다른 폰트로 바꾸려면 이 줄과
    `tailwind.config.ts` 의 `fontFamily.sans` 를 수정하세요.
- 완전 반응형 (모바일 · 태블릿 · 데스크톱)

---

## 6. 확장 아이디어

- **대용량 첨부**: Supabase `createSignedUploadUrl` 로 브라우저에서 스토리지에 직접 업로드하면
  Vercel 본문 제한을 우회할 수 있습니다.
- **알림**: 상태 변경 시 이메일/카카오 알림 연동.
- **정렬/검색**: 관리자 대시보드에 키워드 검색·정렬 추가.

---

## 스크립트
```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm start       # 프로덕션 실행
npm run lint    # 린트
```
