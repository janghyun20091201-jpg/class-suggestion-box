# 11-3 건의함 · Class Suggestion Box

Apple 지원(Apple Support) 스타일의 학급 건의함 웹앱입니다.
**Next.js 14 (App Router) · Tailwind CSS · Lucide Icons · Supabase** 로 만들었습니다.

- 학생: 로그인 없이 **익명/일반 건의**를 남기고, 발급된 **6자리 숫자 접수코드**로 처리 상태·답변을 확인
- 관리자(반장·부반장·선생님): 비밀번호 로그인 후 전체 건의 확인, 상태 변경, 답변 작성

---

## 1. 빠른 시작 (로컬 실행)

### 1) Node.js 설치 (최초 1회)
- <https://nodejs.org> 에서 **LTS 버전**을 내려받아 설치합니다.
- 터미널에서 확인: `node -v`

### 2) 의존성 설치
```bash
npm install
```

### 3) Supabase 준비
1. <https://supabase.com> 에서 프로젝트를 생성합니다.
2. 대시보드 → **SQL Editor** 에 `supabase-schema.sql` 내용을 붙여넣고 실행합니다.
3. **Project Settings → API** 에서 `Project URL` 과 `Secret(service_role)` 키를 복사합니다.

### 4) 환경변수 설정
`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_PASSWORD=admin2105
SESSION_SECRET=길고_무작위한_문자열
```

### 5) 개발 서버 실행
```bash
npm run dev
```
브라우저에서 <http://localhost:3000> 접속.

---

## 2. Vercel 배포

1. 코드를 GitHub 저장소에 push 합니다. (`git push`)
2. Vercel 이 자동으로 감지해 1~2분 안에 재배포합니다.
3. 환경변수를 바꿀 때는 Vercel → **Settings → Environment Variables** 에서 수정한 뒤
   **Deployments → 최신 배포 → Redeploy** 를 눌러야 반영됩니다.

---

## 3. 페이지 구조

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 · 건의하기 버튼 + 접수코드 입력창 |
| `/submit` | 익명 / 일반 선택 화면 |
| `/submit?type=anonymous` | 익명 건의 작성 |
| `/submit?type=named` | 일반(이름) 건의 작성 |
| `/check/[code]` | 접수코드로 내 건의 1건 조회 (독립 페이지) |
| `/admin` | 관리자 로그인 + 목록 대시보드 |
| `/admin/[id]` | 건의 상세 · 상태 변경 · 답변 작성 (독립 페이지) |

### API 라우트
| 메서드 · 경로 | 설명 |
| --- | --- |
| `POST /api/suggestions` | 건의 접수 (코드 발급 + 몇 번째 건의인지 반환) |
| `POST /api/admin/login` | 관리자 로그인 (쿠키 발급) |
| `POST /api/admin/logout` | 로그아웃 |
| `GET /api/admin/suggestions` | 전체 목록 (인증 필요) |
| `PATCH /api/admin/suggestions/[id]` | 상태·답변 수정 (인증 필요) |

---

## 4. 보안 설계

- 모든 DB 접근은 **서버에서 service_role(Secret) 키로만** 이루어집니다.
  `suggestions` 테이블은 RLS를 켜고 정책을 두지 않아 anon 키로는 접근 불가.
- 학생은 **본인 접수코드로 1건만** 조회할 수 있고, 목록을 훑어볼 방법이 없습니다.
  (익명·일반 모두 동일하게 본인 건의만 확인 가능)
- **익명** 건의는 이름을 저장하지도, 노출하지도 않습니다.
- 제출 후 학생의 수정·삭제는 불가능합니다.
- 관리자 인증은 `ADMIN_PASSWORD` 비교 후 `SESSION_SECRET` 서명 쿠키(httpOnly, 8시간)로 유지합니다.
  비밀번호를 바꾸면 기존 세션은 자동 무효화됩니다.

---

## 5. 상태 값

`접수됨` → `완료` 두 단계만 사용합니다.

---

## 6. 디자인 시스템 (Apple Support 테마)

- 색상: 배경 `#ffffff` / `#f5f5f7`, 본문 `#1d1d1f`, 보조 `#86868b`, 포인트 `#0071e3`
- 카드: `1px solid rgba(0,0,0,0.08)` 테두리, `rounded-2xl`/`rounded-3xl`, 과한 그림자 없음
- 폰트: **Pretendard** (Apple SD Gothic Neo 대응 웹폰트) + 시스템 폰트 폴백
- 완전 반응형 (모바일 · 태블릿 · 데스크톱)

---

## 스크립트
```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm start       # 프로덕션 실행
npm run lint    # 린트
```
