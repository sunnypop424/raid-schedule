# 레이드 일정 공유 캘린더 — 기획서

> Claude Code 구현용 기획 문서. 로스트아크 고정 공대원 8명이 주 단위(수~화)로 게임 가능/불가능 날짜를 체크하고 서로 공유하는 모바일 우선 웹앱.

---

## 1. 개요

| 항목 | 내용 |
|---|---|
| 목적 | 레이드 일정 조율을 위해 공대원 각자의 주간 가능/불가능 일정을 한눈에 공유 |
| 사용자 | 고정 멤버 8명 (회원가입 없음, 목록에서 선택) |
| 기준 주기 | 로아 주간 초기화 기준 **수요일 ~ 화요일** |
| 제출 마감 | 다음 주차 일정을 **이번 주 화요일 23:59 KST까지** 제출. 마감 후에도 주중 수정 가능 (§4.3 참고) |
| 플랫폼 | 웹 (모바일 우선 반응형, PWA 권장) |
| 타임존 | 모든 날짜 계산은 **Asia/Seoul (KST)** 고정 |

---

## 2. 사용자

### 2.1 멤버 목록 (고정)

| 순서 | 닉네임 |
|---|---|
| 1 | 딘또썬 |
| 2 | 말랭짱 |
| 3 | 흑마66 |
| 4 | 고추좋아해요 |
| 5 | 항상그놈 |
| 6 | 네이팜고스트 |
| 7 | 슈레이드성 |
| 8 | 골드내놔쉴드도유료야 |

- 멤버 목록은 DB seed로 넣고, 각 멤버에 고유 색상(color)을 부여해 공유 뷰에서 구분한다.
- 닉네임이 긴 경우(`골드내놔쉴드도유료야` 등) 모바일에서 말줄임 처리 + 탭/롱프레스 시 전체 표시.

### 2.2 사용자 선택 (로그인 대체)

- 첫 진입 시 **"누구세요?"** 화면에서 8명 중 1명을 선택.
- 선택값은 `localStorage`에 저장 → 다음 방문 시 자동 진입.
- 헤더에서 언제든 사용자 변경 가능.
- **(선택 기능, P1)** 멤버별 4자리 PIN: 다른 사람이 내 일정을 실수로/장난으로 수정하는 것 방지. MVP는 PIN 없이 진행하되 스키마에는 `pin_hash` 컬럼을 nullable로 미리 둔다.

---

## 3. 핵심 기능

### 3.1 내 일정 입력 (주간)

- 선택한 주차의 **수·목·금·토·일·월·화 7일**을 세로 리스트로 표시.
- 날짜마다 상태를 선택:

| 상태 | 값 | 색상 가이드 | 의미 |
|---|---|---|---|
| 가능 | `available` | 초록 | 그날 레이드 가능 |
| 부분 가능 | `partial` | 노랑 | 특정 시간대만 가능 (메모 필수 권장) |
| 불가능 | `unavailable` | 빨강 | 그날 불가 |
| 미입력 | `null` (row 없음) | 회색 | 아직 체크 안 함 |

- **부분 가능**일 때 메모 입력(예: "22시 이후", "저녁만") — 최대 40자.
- 빠른 입력 버튼: **"전부 가능"**, **"전부 불가능"**, **"지난주와 동일"**.
- 탭 한 번으로 상태 순환(미입력 → 가능 → 불가능 → 부분 가능) 또는 세그먼트 버튼 방식 중 택1 (권장: 세그먼트 버튼, 오조작 적음).
- 변경 즉시 자동 저장 (디바운스 300ms) + 저장 상태 표시("저장됨 ✓").

### 3.2 공유 뷰 (주간 전체 현황)

- 해당 주차 8명 × 7일 현황을 한 화면에.
- 날짜별 **가능 인원 카운트** 표시 (가능 = 1, 부분 가능 = 0.5가 아니라 별도 표기: `가능 5 · 부분 1`).
- **레이드 추천일 하이라이트**
  - 8/8 가능 → 강조 (8인 레이드 가능)
  - 4명 이상 가능 → 보조 강조 (4인 레이드 가능)
  - 기준 인원(4, 8)은 설정 상수로 관리.
- 미입력 멤버는 회색으로 표시하고, 상단에 **"미제출: 항상그놈, 흑마66"** 형태로 노출.
- 부분 가능 셀 탭 시 메모를 툴팁/바텀시트로 표시.
- 실시간 반영: Supabase Realtime 구독으로 다른 멤버가 입력하면 즉시 갱신.

### 3.3 주차 이동

- 헤더에 `◀ 이전 주 | 2026.09.16(수) ~ 09.22(화) | 다음 주 ▶`
- 이동 범위: 과거 주차는 조회만, 다음 주차까지 입력 가능 (그 이후 주차는 미리 입력 허용 여부 — §8 확인 필요, 기본값: **다음 주차까지만** 노출).
- "이번 주"로 돌아가기 버튼.

### 3.4 제출 현황

- 멤버가 해당 주 7일을 모두 입력하면 **제출 완료** 뱃지.
- 공유 뷰 상단에 `제출 6/8` 진행 표시.

---

## 4. 주차 · 마감 규칙

### 4.1 주차 정의

- 주차 = **수요일 00:00 ~ 화요일 23:59 (KST)** 의 7일.
- 주차 식별자 `week_start` = 해당 주 수요일 날짜 (`YYYY-MM-DD`).
- 임의 날짜 `d`의 주차 시작일 = `d` 이전(당일 포함) 가장 가까운 수요일.

```ts
// KST 기준으로 계산할 것 (date-fns-tz 또는 dayjs/timezone)
function getWeekStart(date: Date): string {
  const kst = toZonedTime(date, 'Asia/Seoul');
  const day = kst.getDay();            // 0=일 ... 3=수
  const diff = (day - 3 + 7) % 7;      // 수요일로부터 지난 일수
  return format(subDays(kst, diff), 'yyyy-MM-dd');
}
```

### 4.2 "이번 주" 판정

- 로아 초기화는 수요일 06:00이지만, 일정은 **날짜 단위**로 관리하므로 "이번 주" 판정은 달력 날짜 기준(수요일 00:00)으로 한다.
- 단, 수요일 00:00~05:59는 실질적으로 지난 주 레이드 시간대이므로 UI에서 "초기화 전" 안내를 띄우는 정도로 처리 (P2).

### 4.3 제출 마감 & 수정 규칙

- **제출 마감:** N주차(수~화) 일정은 **N주차가 시작되기 전날인 화요일 23:59 KST**까지 제출한다. 즉, 이번 주 화요일까지 다음 주 일정을 내는 구조.
- 마감은 **잠금이 아니라 제출 기한**이다. 마감 이후에도 주중 일정 변경에 대응해 수정 가능.
- 수정 가능 범위:

| 대상 | 수정 |
|---|---|
| 다음 주차 (마감 전) | ✅ 자유롭게 입력/수정 |
| 이번 주차 중 **오늘 이후 날짜** | ✅ 수정 가능 (마감 후 변경으로 표시) |
| 이번 주차 중 **지난 날짜** | ❌ 읽기 전용 |
| 지난 주차 | ❌ 읽기 전용 |

- "오늘" 판정은 KST 날짜 기준. 당일 날짜는 수정 가능.
- 마감 시각은 상수로 분리: `DEADLINE_OFFSET` (주차 시작 기준 -1일 23:59).
- 마감 24시간 전부터, 다음 주차 미제출자에게 `⏰ 다음 주 일정 마감까지 N시간` 배너.
- 지난 날짜 잠금은 클라이언트 UI + **DB 레벨(RPC)** 양쪽에서 강제.

### 4.4 마감 후 변경 표시

- 마감 이후 수정된 칸은 **"변경됨"** 표시(작은 점 또는 🔄 아이콘)로 다른 멤버가 알아챌 수 있게 한다.
  - 판정: `updated_at > 해당 주차 마감 시각`
- 변경된 칸을 탭하면 `언제 · 이전 상태 → 현재 상태` 표시 (P1, `availability_logs` 필요).
- 공유 뷰 상단에 **"최근 변경"** 영역: 이번 주차의 마감 후 변경 내역 최신순 3건 노출 (예: `말랭짱 · 09.19(토) 가능 → 불가능 · 2시간 전`). (P1)
- 이미 레이드 약속을 잡은 날을 불가능으로 바꾸는 경우를 대비해, 저장 전 확인 모달: "이미 공유된 일정을 변경해요. 공대원에게도 따로 알려주세요!" (P1)

---

## 5. 화면 구성

### 5.1 라우트

| 경로 | 화면 |
|---|---|
| `/` | 사용자 미선택 시 → `/select`, 선택 시 → `/week` |
| `/select` | 멤버 선택 |
| `/week?w=YYYY-MM-DD` | 공유 뷰 (기본 탭) |
| `/week/me?w=YYYY-MM-DD` | 내 일정 입력 |

### 5.2 레이아웃

- 상단: 주차 네비게이션 + 현재 사용자 아바타(탭 시 사용자 변경)
- 하단 탭바(모바일): **전체 일정 / 내 일정**
- 데스크톱(≥1024px): 좌측 내 일정 입력 패널 + 우측 공유 그리드 2단 구성

### 5.3 모바일 대응 (필수)

- 기준 뷰포트: 360px ~ 430px 우선 설계, 이후 태블릿/데스크톱 확장.
- **공유 뷰 모바일 레이아웃:** 8열 그리드는 좁으므로 **날짜별 카드 리스트**로 전환.
  ```
  ┌ 09.16 (수) ────── 가능 6 · 부분 1 ┐
  │ 🟢딘또썬 🟢말랭짱 🔴흑마66 🟡항상그놈 │
  │ 🟢고추좋아.. 🟢네이팜.. 🟢슈레이드성 ⚪골드.. │
  └───────────────────────────────┘
  ```
  - 추천일 카드는 테두리/배경 강조.
  - 옵션 토글로 "표 보기" 제공: 첫 열(날짜) sticky + 가로 스크롤.
- 터치 타겟 최소 44×44px.
- 하단 탭바는 `env(safe-area-inset-bottom)` 대응.
- 내 일정 입력은 한 손 조작 기준: 상태 버튼을 행 우측에 배치.
- 부분 가능 메모 입력은 바텀시트.
- PWA: `manifest.json` + 아이콘 → 홈 화면에 추가 가능 (P1).
- 다크 모드 기본 지원 (`prefers-color-scheme`).

---

## 6. 데이터 모델 (Supabase / Postgres)

```sql
create table members (
  id          smallint primary key,
  nickname    text not null unique,
  color       text not null,          -- hex
  sort_order  smallint not null,
  pin_hash    text                    -- P1, nullable
);

create type availability_status as enum ('available', 'partial', 'unavailable');

create table availabilities (
  id          bigint generated always as identity primary key,
  member_id   smallint not null references members(id),
  week_start  date not null,          -- 해당 주 수요일
  date        date not null,
  status      availability_status not null,
  note        text check (char_length(note) <= 40),
  updated_at  timestamptz not null default now(),
  unique (member_id, date)
);

create index on availabilities (week_start);

-- P1: 마감 후 변경 이력
create table availability_logs (
  id          bigint generated always as identity primary key,
  member_id   smallint not null references members(id),
  date        date not null,
  prev_status availability_status,    -- null = 미입력
  next_status availability_status,    -- null = 미입력으로 되돌림
  changed_at  timestamptz not null default now()
);
```

- 미입력은 row가 없는 것으로 표현 (상태를 "미입력"으로 되돌리면 row 삭제).
- `week_start`는 `date`로부터 계산되지만 조회 편의상 저장 (insert 시 트리거로 자동 계산 권장).
- **수정 규칙 강제:** `upsert_availability(member_id, date, status, note)` RPC를 만들고 함수 내에서 `date < (now() at time zone 'Asia/Seoul')::date`이면 예외(지난 날짜 수정 불가). 마감 이후 변경이면 `availability_logs`에 이력 기록. 테이블 직접 쓰기는 RLS로 막고 RPC만 허용.
- 인증이 없으므로 anon 키로 접근 → 공대원끼리만 링크 공유하는 전제. (PIN 도입 시 RPC에서 PIN 검증)

---

## 7. 기술 스택 (권장)

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript |
| 스타일 | Tailwind CSS |
| DB / 실시간 | Supabase (Postgres + Realtime) |
| 날짜 | date-fns + date-fns-tz (Asia/Seoul 고정) |
| 서버 상태 | TanStack Query (낙관적 업데이트) |
| 배포 | Vercel |

### 7.1 폴더 구조 (예시)

```
src/
  app/
    select/page.tsx
    week/page.tsx
    week/me/page.tsx
    api/cron/keepalive/route.ts   # Supabase 일시정지 방지용 핑
    layout.tsx
  features/
    member-select/
    my-schedule/        # 내 일정 입력
    team-schedule/      # 공유 뷰
    week-nav/
  shared/
    lib/week.ts         # 주차·마감 계산 (단위 테스트 필수)
    lib/supabase.ts
    config/constants.ts # RAID_SIZES, DEADLINE_OFFSET 등
    ui/
supabase/
  migrations/
  seed.sql              # 멤버 8명
vercel.json             # Cron 설정
```

### 7.2 배포 & 운영

- **배포:** GitHub 저장소 → Vercel 연결, `main` 푸시 시 자동 배포.
- **DB 연결:** Vercel Marketplace의 Supabase 통합으로 연결 → 환경변수 자동 주입.

| 환경변수 | 용도 | 노출 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon 키 (RLS + RPC로 보호) | 클라이언트 |
| `CRON_SECRET` | Cron 요청 검증용 임의 문자열 | 서버 전용 |

- `service_role` 키는 이 앱에서 사용하지 않는다. (클라이언트 번들에 절대 포함 금지)

### 7.3 Supabase 일시정지 방지 (Keep-alive)

**배경:** Supabase 무료 프로젝트는 약 1주일간 요청이 없으면 자동 일시정지된다. 공대가 한 주 쉬는 경우에도 앱이 멈추지 않도록 Vercel Cron으로 매일 가벼운 조회를 보낸다.

**Cron 설정** (`vercel.json`) — 하루 1회, KST 12:00 (= UTC 03:00)

```json
{
  "crons": [
    { "path": "/api/cron/keepalive", "schedule": "0 3 * * *" }
  ]
}
```

**엔드포인트** (`src/app/api/cron/keepalive/route.ts`)

```ts
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Vercel Cron은 CRON_SECRET을 Authorization 헤더로 전달
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await supabase.from('members').select('id').limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({ ok: true, at: new Date().toISOString() });
}
```

**규칙**
- 조회는 `members` 1건만 — 데이터 변경 없음.
- `CRON_SECRET` 없는 외부 요청은 401로 거부.
- Vercel Hobby 플랜은 Cron이 하루 1회까지라 이 설정으로 충분.
- 실패 여부는 Vercel 대시보드 → Cron Jobs 로그에서 확인.

---

## 8. 확인 필요 사항

- ~~마감 해석~~ → **확정:** 다음 주 일정을 이번 주 화요일 23:59까지 제출
- ~~마감 후 수정~~ → **확정:** 주중에도 오늘 이후 날짜는 수정 가능, 변경 표시

1. 마감까지 미제출한 날짜 처리: 미입력 유지(기본값) vs 마감 후에도 뒤늦게 입력하면 "지각 제출" 표시
2. 미래 주차 선입력: 다음 주차까지만(기본값) vs 2~3주 앞까지
3. 시간대 입력: 날짜 단위 + 메모(기본값) vs 시간대 슬롯(예: 오후/저녁/새벽) 선택
4. PIN 보호 도입 시점

---

## 9. 구현 순서 (Claude Code 작업 단위)

1. **Phase 1 — 기반:** Next.js + Tailwind 세팅, Supabase 마이그레이션 & seed, `lib/week.ts` + 단위 테스트 (수/화 경계, 자정, 연말 연도 전환 케이스)
2. **Phase 2 — 사용자 선택:** `/select` 화면, localStorage 저장, 헤더 사용자 전환
3. **Phase 3 — 내 일정 입력:** 7일 리스트, 상태 세그먼트, 메모 바텀시트, 자동 저장, 빠른 입력 버튼
4. **Phase 4 — 공유 뷰:** 모바일 카드 리스트 / 데스크톱 그리드, 가능 인원 카운트, 추천일 하이라이트, 미제출자 표시
5. **Phase 5 — 마감 & 주차:** 주차 네비게이션, 지난 날짜 잠금(UI + RPC), 마감 임박 배너, 마감 후 변경 표시
6. **Phase 5.5 — 변경 이력 (P1):** `availability_logs`, 최근 변경 영역, 변경 확인 모달
7. **Phase 6 — 실시간 & 마감재:** Realtime 구독, PWA, 다크 모드, 빈/로딩/에러 상태
8. **Phase 7 — 배포:** Vercel 연결, Supabase Marketplace 통합, 환경변수 설정, Keep-alive Cron 등록

### 완료 기준 (Acceptance)

- [ ] 360px 폭에서 가로 스크롤 없이 공유 뷰(카드 모드)와 입력 화면이 사용 가능
- [ ] 주차 진행 중에도 오늘·이후 날짜는 수정되고, 지난 날짜는 UI와 DB 모두에서 거부됨
- [ ] 마감(주차 시작 전 화요일 23:59 KST) 이후 수정한 칸에 "변경됨" 표시가 다른 기기에서도 보임
- [ ] 브라우저 타임존을 바꿔도 주차 계산 결과가 동일 (KST 고정)
- [ ] 한 기기에서 입력하면 다른 기기의 공유 뷰가 새로고침 없이 갱신
- [ ] `/api/cron/keepalive`가 `CRON_SECRET` 없이 호출되면 401, Cron 실행 시 200 반환
- [ ] 배포 후 Vercel Cron Jobs 목록에 keepalive가 등록되어 있음
- [ ] 8명 전원 가능한 날이 시각적으로 즉시 식별됨
