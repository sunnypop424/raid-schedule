# 레이드 일정 공유 캘린더

로스트아크 고정 공대원 8명이 주 단위(수~화)로 레이드 가능/불가능 날짜를 체크하고 공유하는 모바일 우선 웹앱.

- 기획: [`docs/raid-calendar-spec.md`](docs/raid-calendar-spec.md)
- 디자인: [`docs/DESIGN.md`](docs/DESIGN.md) · 시안: Claude Design 캔버스(입력 3번안, 공유 뷰 S4/L4 확정)

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 주차·마감 계산 / 집계 단위 테스트
npm run typecheck
npm run lint
```

환경변수 없이 실행하면 **로컬 모드**로 동작한다 (데이터는 브라우저 localStorage, 같은 브라우저의 탭끼리만 동기화). UI 개발은 이 상태로 가능하다.

## Supabase 연결

1. Supabase 프로젝트 생성 후 SQL Editor(또는 `supabase db push`)로 아래 순서대로 실행
   - `supabase/migrations/20260918000000_init.sql`
   - `supabase/migrations/20260918010000_status_and_start_time.sql` (상태 가능/불가능/미정 + 30분 단위 시작 시간)
   - `supabase/seed.sql`
2. `.env.example` 을 `.env.local` 로 복사하고 값 채우기

| 환경변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable 키 (읽기 + `set_availability` RPC 만 허용). 기존 anon 키는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 로도 인식 |
| `CRON_SECRET` | `/api/cron/keepalive` 검증용 (서버 전용) |

쓰기는 전부 `set_availability` RPC 를 거치며, 지난 날짜(KST) 수정은 DB에서도 거부된다. `service_role` 키는 사용하지 않는다.

## 구조

```
src/
  app/                  라우트 (/select, /week, /week/me, /api/cron/keepalive)
  features/
    member-select/      "누구세요?"
    my-schedule/        내 일정 입력 (날짜·가능 여부 셀렉트·시간 셀렉트, 자동 저장)
    team-schedule/      공유 뷰 (날짜별 카드, 집계 summary.ts)
    week-nav/           헤더·탭바·마감 배너·화면 조립(week-screen)
  shared/
    lib/week.ts         주차·마감 계산 (KST 고정, 단위 테스트)
    lib/time.ts         시작 시간 슬롯(00:00~23:30, 30분 단위)
    lib/queries.ts      TanStack Query 훅, 낙관적 자동 저장
    api/                ScheduleApi — supabase 구현 / 로컬 구현
    config/constants.ts RAID_SIZES, DEADLINE_OFFSET_MS, MAX_WEEKS_AHEAD 등
    ui/                 상태 글리프, 아바타, 시트, 아이콘
supabase/               마이그레이션, seed
vercel.json             Keep-alive Cron (매일 KST 12:00)
```

## 진행 상황 (spec §9)

- [x] Phase 1 기반 · 2 사용자 선택 · 3 내 일정 입력 · 4 공유 뷰 · 5 마감 & 주차
- [x] Realtime 구독, 다크 모드, 빈/로딩/에러 상태, Keep-alive 엔드포인트
- [ ] Phase 5.5 (P1) 변경 이력 UI — `availability_logs` 기록은 RPC에 구현됨, "최근 변경"·확인 모달 미구현
- [ ] PWA manifest/아이콘, PIN
- [ ] Phase 7 배포 (Vercel + Supabase 연결)
