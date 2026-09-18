# Raid Calendar Design System (NC-reference based)

> Design contract for the **레이드 일정 공유 캘린더** described in [`raid-calendar-spec.md`](./raid-calendar-spec.md). The visual language (NC Purple, Pretendard, flat/shadowless surfaces, token naming) is adapted from the `nc.com` portal reference. Everything that only made sense for a game portal or a brand magazine (hero carousel, NC PLAY editorial surface, Helvetica Now, NC BLUE heritage storytelling) has been removed. Values marked **(project)** are defined for this app and do not come from the NC token system.

<!-- design-md:section experience -->
## 1. Experience

### Visual Theme & Atmosphere

The app is a small, mobile-first utility for a fixed Lost Ark raid group of 8: each member marks the 7 days of a raid week (수 → 화) as 가능 / 불가능 / 미정 — with a start time for the days they can make it — and everyone sees the combined result. It is opened for a few seconds at a time, usually one-handed on a phone, so the atmosphere is **calm, flat and instantly scannable** — closer to a well-made checklist than to a game site.

From the NC portal reference it keeps: a pure white (`#ffffff`) and cool-grey (`#f2f2f3`) canvas, near-black ink (`#0f1011`), Pretendard as the only typeface, 16px-radius cards, 6px-radius buttons, no shadows, and **NC Purple** (`#7234e0`) as the single saturated action color. On top of that it adds one thing the portal never needed: a strict **four-state status color system** (green / amber / red / grey) that carries almost all of the information on screen. Status colors are the loudest thing in the UI; chrome stays quiet so that "which day can all 8 of us raid?" is answerable at a glance.

Dark mode is a first-class theme (`prefers-color-scheme`), not an afterthought — raid planning happens at night. The dark theme uses the NC dark tokens (`#0f1011` base, `#252628` containers, `#8243f2` purple).

The NC reference is visual inspiration only. The app uses no NC / NCSOFT logos, names, key-art or brand copy.

**Key Characteristics:**
- Mobile-first (360–430px), one-handed; desktop (≥1024px) is a two-panel expansion of the same components
- Status color is the content: green `#21ab79` 가능 · red `#f1415e` 불가능 · amber `#f5a524` **(project)** 미정 · grey `#a3a3a9` 미입력
- Status is never color-only — every state also has a glyph (○ △ ✕ –) and a text label where space allows
- NC Purple (`#7234e0` / dark `#8243f2`) for actions, the selected tab, and the raid-day recommendation highlight — nothing else
- Pretendard only; weight 700 for heads and counts, 400 body, 500 for interactive labels
- Near-black ink (`#0f1011`) on light, white on dark; never pure black text
- Shadowless: separation by tint (`#f2f2f3`), hairlines (`rgba(0,0,0,0.12)`), and 16px-radius cards
- Radius scale: 6px buttons/segments/badges → 16px day cards → full-round avatars and dots
- Member colors identify people (avatar only); they never fill a status cell

### Do's and Don'ts

### Do
- Use NC Purple (`#7234e0`) only for the primary action, the active tab / selected control, focus, and recommended-day emphasis
- Use the four status colors exactly as mapped in §2 — everywhere (input screen, shared view, legends, logs)
- Pair every status color with its glyph (○ △ ✕ –) so the view works for color-blind members
- Use Pretendard for everything; use `font-variant-numeric: tabular-nums` for dates and counts
- Keep touch targets ≥ 44×44px; the input screen is one row per day — date, status select, time select
- Separate with `#f2f2f3` tint and hairlines, not shadows
- Truncate long nicknames (`골드내놔쉴드도유료야`) with an ellipsis and reveal the full name on tap / long-press
- Design every screen in light and dark at the same time

### Don't
- Use green / amber / red for anything other than availability status (no green "success" buttons, no red decorative accents)
- Use member colors as cell backgrounds or status indicators
- Spread NC Purple over decorative elements — it dilutes both the action signal and the recommended-day highlight
- Use drop shadows for elevation — bottom sheets and modals separate with a scrim and a hairline, not a shadow
- Use pill-shaped buttons — buttons and segments are a calm 6px; only avatars, dots and the saved-indicator are full-round
- Allow horizontal page scroll at 360px (nothing on the page scrolls sideways)
- Show locked (past) days as "disabled and mysterious" — always say why they are read-only

### Product Narrative

A fixed 8-person static needs to agree on raid days every week. Today that happens in chat, where answers scroll away and nobody knows who has not replied. This app replaces that with one shared page: pick who you are (no sign-up), tap 7 days, done. The raid week follows the Lost Ark weekly reset — **수요일 ~ 화요일**, all dates in **KST** — and next week's schedule is due by **화요일 23:59**. The deadline is a due date, not a lock: today-and-later days stay editable, and edits after the deadline are marked "변경됨" so others notice.

What the design refuses: sign-up walls, dense admin-style tables on a phone, gamified noise, and guilt-tripping. What it embraces: a 5-second happy path, honest status ("미제출: 항상그놈, 흑마66"), and an unmistakable signal for the day everyone can make it.

### Principles

1. **Answer in five seconds.** Two questions matter: "what did I submit?" and "which day can we raid?". *UI implication:* counts (`가능 6 · 미정 1`), the common start time (`22:00부터`) and the recommended-day highlight sit at card-head level; everything else is secondary.
2. **Status color is sacred.** Green / amber / red / grey mean availability and nothing else. *UI implication:* confirmations, banners and errors use ink, tint and icons before they reach for a status hue.
3. **One action, one color.** NC Purple means "this is the thing to tap / the day to pick". *UI implication:* one purple CTA per screen; recommended-day emphasis uses purple tint and border, not a second accent.
4. **One thumb.** *UI implication:* bottom tab bar, native selects for status and time, 44px minimum targets, `env(safe-area-inset-bottom)` respected.
5. **Flat, fast, honest.** *UI implication:* no shadows, optimistic updates with a visible "저장됨 ✓", real-time changes appear without celebration, locked days explain themselves.
6. **Clear and courteous.** Eight people who know each other, addressed politely. *UI implication:* consistent 합니다/입니다/주세요체 copy ("닉네임을 선택해 주세요"), name the people who haven't submitted, never nag.

### Personas

*Fictional archetypes of a fixed raid group, not the actual members.*

**공대장, 31.** Decides the raid days. Opens the shared view on Tuesday night and needs to see `제출 8/8`, the 8/8 days, and who changed something after the deadline. Wants zero ambiguity.

**퇴근러, 29.** Fills next week's schedule on the subway, one hand, in under 20 seconds. Uses "지난주와 동일" and then changes one day's time to "22:00 이후". Hates typing.

**변수 많은 교대근무자, 34.** Their schedule changes mid-week. Needs to change Saturday from 가능 to 불가능 on Thursday, and wants the others to notice without an awkward chat message — the "변경됨" marker and "최근 변경" list do that.

<!-- design-md:section foundations -->
## 2. Foundations

<!-- design-md:claim foundations kind=rules-or-constraints lang=en -->
### Color Palette & Roles

### Availability Status (the core palette)

| State | Value | Color | Tint (cell / segment background) | Glyph | Label |
|---|---|---|---|---|---|
| 가능 | `available` | **Status Green** `#21ab79` (`--point_green_normal`) | `rgba(33,171,121,0.14)` | ○ | 가능 |
| 미정 | `undecided` | **Status Amber** `#f5a524` **(project)** | `rgba(245,165,36,0.18)` | △ | 미정 |
| 불가능 | `unavailable` | **Status Red** `#f1415e` (`--point_red_normal`) | `rgba(241,65,94,0.14)` | ✕ | 불가 |
| 미입력 | `null` (no row) | **Status Grey** `#a3a3a9` (`--neutral_gray_065`) | `#f2f2f3` (dark: `#252628`) | – | 미입력 |

- Solid status color: dots, glyphs, the selected segment, count numerals. Tint: cell and chip backgrounds. The rgba tints work unchanged on both light and dark surfaces.
- Text on solid green / red is white; text on solid amber is ink `#0f1011` (white on amber fails contrast).
- Text **on a tint** uses the darker status text color: green `#14784f`, amber `#8a5a00`, red `#c21f3d`, grey `#62626a` (dark theme: `#6fd7a4` / `#f2c265` / `#f58a8d` / `#a3a3a9`) **(project)** — the base status hues fail 4.5:1 as text.
- Status colors are reserved. They are not used for buttons, links, banners' backgrounds, or member colors.

### Primary (NC Purple)
- **NC Purple** (`#7234e0`): `--core_primary_normal`. Primary CTA, active tab, selected member, focus ring, 8/8 recommended-day border and badge.
- **Purple Strong** (`#482486`): `--core_primary_strong`. Pressed CTA; text on soft-purple surfaces.
- **Purple Subtle** (`#e8d6ff`): `--core_primary_subtle`. Soft button background; 4+ recommended-day border and badge background.
- **Purple Faint** (`#f6eeff`): `--core_primary_faint`. 8/8 recommended-day card background; hover wash.
- **Purple Dark-theme** (`#8243f2`): `--core_primary_normal` in the dark theme. In dark mode the faint/subtle fills become `rgba(130,67,242,0.16)` / `rgba(130,67,242,0.32)` **(project)**.

### Neutral Scale
- **Ink** (`#0f1011`): primary text on light; page background in dark (`--background_base_1`).
- **Gray 015** (`#252628`): `--neutral_gray_015`. Card / container surface in dark.
- **Gray 025** (`#3d3d43`): `--neutral_gray_025`. Secondary text on light; raised surface / hairline-equivalent fill in dark.
- **Gray 040** (`#62626a`): `--neutral_gray_040`. Tertiary text, captions on light.
- **Gray 055** (`#888890`): `--neutral_gray_055`. Muted labels, metadata (both themes).
- **Gray 065** (`#a3a3a9`): `--neutral_gray_065`. Disabled text, 미입력 status, secondary text on dark.
- **Gray 075** (`#bdbdc1`): `--neutral_gray_075`. Input borders on light.

### Surfaces

| Role | Light | Dark |
|---|---|---|
| Page background | `#ffffff` | `#0f1011` |
| Section / segmenting surface | `#f2f2f3` (`--background_base_2`) | `#0f1011` (cards carry the separation) |
| Card / sheet surface | `#ffffff` | `#252628` |
| Alt surface (locked rows, skeleton) | `#f7f7f8` (`--neutral_gray_097`) | `#3d3d43` |
| Primary text | `#0f1011` | `#ffffff` |
| Secondary text | `#3d3d43` | `#a3a3a9` |
| Muted text | `#888890` | `#888890` |
| Hairline | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` **(project)** |
| Scrim (sheet / modal) | `rgba(0,0,0,0.4)` **(project)** | `rgba(0,0,0,0.6)` **(project)** |

### Informational Accent
- **Light Blue** (`#38aefa`): `--point_light_blue_normal`. The "변경됨" (edited after deadline) dot and the "최근 변경" section marker. Informational only — deliberately not a status color and not purple.

### Member Colors (identity only)

Seeded into `members.color`. Used for the avatar fill (first character of the nickname in white) and nowhere else. Chosen to stay away from status green / amber / red and from NC Purple.

| sort_order | Nickname | Color | Source |
|---|---|---|---|
| 1 | 딘또썬 | `#1d4b99` | `--point_cobalt_normal` |
| 2 | 말랭짱 | `#38aefa` | `--point_light_blue_normal` |
| 3 | 흑마66 | `#6768f6` | `--point_lavender_normal` |
| 4 | 고추좋아해요 | `#fa38ec` | `--point_magenta_normal` |
| 5 | 항상그놈 | `#0e9aa7` | (project) teal |
| 6 | 네이팜고스트 | `#8a5a3c` | (project) brown |
| 7 | 슈레이드성 | `#e0609a` | (project) pink |
| 8 | 골드내놔쉴드도유료야 | `#7a8b2a` | (project) olive |
<!-- design-md:claim-end -->

### Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, rows, inline text |
| Tint (Level 1) | `#f2f2f3` page band vs `#ffffff` card (dark: `#0f1011` vs `#252628`) | Day cards on the shared view, input list container |
| Hairline (Level 2) | `1px solid rgba(0,0,0,0.12)` (dark `rgba(255,255,255,0.12)`) | Header bottom edge, tab bar top edge, row dividers, table grid |
| Emphasis (Level 3) | Purple border + purple tint | Recommended raid day (see Day Card) |
| Overlay (Level 4) | Scrim + card surface + top hairline, **no shadow** | Change-confirm modal, user switcher |

**Shadow Philosophy**: The system is shadowless. Depth comes from tint, hairlines, and — for overlays — a scrim. When emphasis is needed the system reaches for color (purple for "pick this", status hues for availability), never a drop shadow.

### Motion & Easing

**Durations**:

| Token | Value | Use |
|---|---|---|
| `motion-fast` | 120ms | Segment / status change, press feedback, "저장됨 ✓" fade |
| `motion-standard` | 240ms | Bottom sheet, modal, banner in/out, week change crossfade |
| `motion-slow` | 360ms | Realtime update highlight fading back to rest |

**Easings**:

| Token | Curve | Use |
|---|---|---|
| `ease-enter` | `cubic-bezier(0.2, 0.6, 0.25, 1)` | Sheets, modals, banners arriving |
| `ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Dismissals |
| `ease-standard` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Status color change, week crossfade |

**Motion rules**: Status changes are instant-feeling (`motion-fast`) because saving is optimistic. When a Realtime update from another member changes a cell, that cell's tint briefly intensifies and relaxes over `motion-slow` — enough to notice, no toast. Week navigation crossfades; it does not slide (sliding implies swipe gestures that aren't promised). No bounce or spring. Under `prefers-reduced-motion: reduce` all transitions collapse to instant and the realtime highlight is skipped.

<!-- design-md:section typography-assets -->
## 3. Typography & Assets

### Typography Rules

### Font Family
- `Pretendard` for everything, with fallback `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`. Load the variable / dynamic-subset build to keep the mobile payload small.
- Dates and counts use `font-variant-numeric: tabular-nums` so columns of `09.16` / `6/8` don't jitter.

### Hierarchy

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Screen Title | 24px (1.50rem) | 700 | 1.3 | "닉네임을 선택해 주세요" on `/select` |
| Week Range | 18px (1.13rem) | 700 | 1.3 | Header: `09.16(수) ~ 09.22(화)`; year shown as a 12px caption above / beside |
| Card Head | 16px (1.00rem) | 700 | 1.4 | Day card date `09.16 (수)`, input row date |
| Body | 16px (1.00rem) | 400 | 1.5 | Modal copy, body text |
| Action | 16px (1.00rem) | 500 | 1.5 | Buttons, quick-action buttons |
| Label | 14px (0.88rem) | 500 | 1.4 | Segment labels, member names in chips, counts (`가능 6 · 부분 1`), banner text |
| Caption | 12px (0.75rem) | 400 | 1.4 | "저장됨 ✓", relative times ("2시간 전"), tab bar labels, lock reasons |

### Principles
- **One voice**: Pretendard only. No second typeface, no display cut.
- **700 for anchors**: dates, week range and counts are what the eye jumps between — they carry 700. Body stays 400.
- **500 for anything tappable**: buttons, segments, tabs sit a half-step above body.
- **Never below 12px**, and nothing interactive below 14px.
- **Day-of-week tint**: on the input screen and on the shared-view day cards (the `(토)` / `(일)` part of the date; not on the inverted full-raid card, whose text is white) 토 is a vivid blue and 일 a vivid red, following the Korean calendar convention the members expect. It applies to the **weekday glyph only** — never to backgrounds, borders or the date number — so it cannot be mistaken for the 불가능 status, which always comes with a tint and the ✕ glyph. Other weekdays are plain ink; today gets a small purple "오늘" caption.

### Icons & Glyphs
- Status glyphs: ○ (가능) △ (부분) ✕ (불가) – (미입력), drawn as 2px-stroke icons, not emoji, so they take the status color and render identically across platforms. The 🟢🟡🔴⚪ in the spec's ASCII mock are illustrative only.
- UI icons: a single 24px outline set at 1.5–2px stroke (e.g. Lucide): chevrons for week nav, calendar / user for tabs, lock for read-only days, clock for the deadline banner, refresh-dot for "변경됨".
- PWA icon (P1): flat, single-color mark on an NC Purple `#7234e0` field, maskable safe zone respected. No game or company logos.

<!-- design-md:section components-states -->
## 4. Components & States

### Component Stylings

### Buttons

**Primary (NC Purple CTA)**
- Background: `#7234e0` (dark `#8243f2`) · Text: `#ffffff`
- Radius: 6px · Height: 44px · Padding: 0 16px · Font: 16px / 500
- Active: `#482486`
- Use: one per screen at most — modal confirm, "이번 주로" when far from the current week, retry

**Soft Purple**
- Background: `#e8d6ff` (dark `rgba(130,67,242,0.32)`) · Text: `#482486` (dark `#ffffff`)
- Radius: 6px · Height: 44px · Font: 16px / 500
- Use: secondary actions on light surfaces

**Quick Action (neutral)**
- Background: `#f2f2f3` (dark `#3d3d43`) · Text: `#0f1011` (dark `#ffffff`)
- Radius: 6px · Height: 44px · Font: 14px / 500
- Use: "전부 가능" · "전부 불가능" · "지난주와 동일" — a row of three equal-width buttons above the 7-day list. Neutral on purpose: they are shortcuts, not the primary action, and must not borrow status colors.

**Icon Button (week nav ◀ ▶)**
- 44×44px hit area, 24px icon, no background; pressed: `#f2f2f3` full-round wash
- Disabled (beyond "next week"): icon `#a3a3a9`, not hidden

### Schedule Table (내 일정 입력) — confirmed mockup "3 · 한 줄 컴팩트"

One card, a 36px header row (`날짜 · 가능 여부 · 시간`, 12px tertiary) and **seven 64px rows** — the whole week fits one phone screen without scrolling. Grid: `56px | 1fr | 1fr`, 8px gap, hairline between rows.

- **Date cell**: weekday 17px / 700 over `MM.DD` 14px / 500 secondary (the date must be as easy to find as the weekday); today adds a small purple "오늘" after the date. **토 is blue `#1565e8`, 일 is red `#e5243f`** (dark: `#5aa2ff` / `#ff6b7d`) — calendar convention, text only. Locked (past) rows: 60% opacity + lock icon.
- **Status select**: a real `<select>`, 44px, 6px radius, 15px text, chevron on the right. Options: `- 선택 -` · `○ 가능` · `✕ 불가능` · `△ 미정`.
  - Empty: card background, `#bdbdc1` border, tertiary text.
  - Chosen: status **tint** background, 1px status-text-color border, status text color, 700.
- **Time select**: same size; options `종일` then `00:00 이후` … `23:30 이후` in **30-minute steps**, tabular numerals. Enabled only when the status is 가능 (defaults to 종일); otherwise it shows a disabled "시간" placeholder on the alt surface.
- Native selects on purpose: the OS picker is the fastest one-handed control on a phone and needs no custom popover.

### Day Card (공유 뷰) — confirmed mockups "S4" (mobile) / "L4" (desktop)

One card per day, 8px apart. No table view.

- Surface: card, radius 16px, no shadow. **≥4 가능** → 1px `#e8d6ff` border. **8/8 가능** → the whole card inverts: background `#7234e0`, white text — the single loudest element on the page.
- **Status bar**: 8 equal segments (10px tall, 2px radius, 2px gap) sorted 가능 → 미정 → 불가능 → 미입력, solid status colors. On the inverted card: 가능 = white, everything else = white at 35%.
- **Mobile layout** (stacked): row 1 `09.26(토)` 16px / 700 left, `8인 가능 · 22:00부터` (or `가능 3명`) 14px / 700 right · row 2 status bar · row 3 `가능 7 · 미정 1 · 불가 2` 12px secondary.
- **Desktop layout** (one 76px row): `110px` date 17px / 700 · `1fr` status bar with a one-line, ellipsized `닉네임 20:30~ · …` under it · `210px` right-aligned big count `7 /8 가능` (20px / 700) over `4인 · 23:00부터` (13px, purple-strong) or the rest counts.
- "모이는 시각" = the latest start time among the available members; all-day only → `종일 가능`.
- **Expanded** (tap the card): available members as chips — `○ 닉네임 20:30~`, 32px, 6px radius, green tint, ordered by start time — then one text line each for 미정 / 불가능 / 미입력 (`△ 미정 · 딘또썬, 슈레이드성`). On the inverted card chips are white at 20%.
- The current user's chip gets a 1px ink outline. A chip edited after the deadline carries a 6px `#38aefa` dot (tooltip: when); the card header shows the same dot if any of its cells changed.
- "오늘" purple caption next to the date; past days in the current week at 60% opacity.

### Avatar

- Full-round, member color fill, white first character of the nickname (14px / 700)
- Sizes: 24px (lists), 36px (schedule table head), 48px (`/select` list)
- Switching user lives in the **Schedule Table head** (confirmed mockup "N5"): 36px avatar · nickname 15px / 700 over the input status line (`5/7 입력 · 저장되었습니다 ✓`, 12px tertiary) · a soft-purple **"닉네임 변경"** button (36px, 6px radius) linking to `/select`. The label says 닉네임 so it cannot be read as "change the schedule".

### Member Select (`/select`)

- Title "닉네임을 선택해 주세요" 24px / 700; 8 rows (or a 2×4 grid ≥ 400px), each ≥ 56px tall: 48px avatar + full nickname (no truncation here)
- Row surface `#ffffff` / dark `#252628`, radius 16px, hairline border; pressed / previously selected: 2px `#7234e0` border + `#f6eeff` wash
- One tap selects and navigates — no separate confirm button

### Header & Week Navigation

- Height 56px, page surface, bottom hairline, sticky
- `◀  2026 · 09.16(수) ~ 09.22(화)  ▶` — the header holds week navigation only (18px / 700, tabular-nums): prev at the left edge, next at the right. No avatar here.
- A "이번 주" soft-purple chip (height 28px visual / 44px hit area, 6px radius) appears under or beside the range only when the viewed week is not the current week
- Past weeks show a "지난 주 · 조회만 가능" caption in muted text

### Bottom Tab Bar (mobile)

- Two tabs: **내 일정** (first, and the landing screen after picking a nickname) / **전체 일정**; height 56px + `env(safe-area-inset-bottom)`; card surface, top hairline, no shadow
- Active: icon + label in `#7234e0` (dark `#8243f2`); inactive: `#888890`; label 12px / 500
- Hidden at ≥1024px, where both panels are visible at once

### Submission Summary (공유 뷰 상단) — confirmed mockup "P3 · 큰 숫자 + 한 문장"

- One card (16px radius, no shadow): a big count on the left — `5` 32px / 700 tabular with `/8` 16px / 500 tertiary — and one sentence on the right, 15px / 700:
  - some missing → "3명이 아직 제출하지 않았습니다" with the nicknames on a second line (13px secondary, wraps — never truncated)
  - nobody yet → "아직 제출한 공대원이 없습니다" (no name list; all eight would be noise)
  - everyone → "전원 제출을 완료했습니다" and the big number turns purple
- A 4px progress line runs flush along the bottom edge of the card: track `#f2f2f3`, fill `#7234e0`.
- The status legend sits right-aligned under the card, above the day cards.
- A per-member "제출 완료" mark on the input screen is plain purple text, not a green badge: green is reserved for 가능.

### Deadline Banner

- Shown from 24h before the deadline to members who haven't fully submitted next week: `⏰ 다음 주 일정 마감까지 5시간`
- Surface `#f6eeff` (dark `rgba(130,67,242,0.16)`), text ink, clock icon `#7234e0`, radius 6px, 14px / 500, whole banner tappable → next week's 내 일정
- Inside the last 3 hours the icon and the hours numeral switch to `#f1415e`. The background never turns red.

### "변경됨" Marker & 최근 변경 (P1)

- Marker: 6px `#38aefa` dot at the top-right of a chip / cell whose `updated_at` is after that week's deadline
- Hover / long-press → tooltip: `마감 후 변경됨 · 2시간 전` (P1: `가능 → 불가능` as status chips, needs `availability_logs`)
- "최근 변경" block under the submission summary: up to 3 rows, 14px — avatar 24px · nickname · date · `가능 → 불가능` as status chips · relative time in muted caption

### Change-confirm Modal (P1)

- Centered card, radius 16px, max-width 320px, scrim, no shadow
- Copy: "이미 공유된 일정을 변경합니다. 공대원에게도 따로 알려 주세요." — body 16px; shows `가능 → 불가능` as status chips above the copy
- Buttons: "취소" (neutral) + "변경하기" (primary purple). Never a red destructive button — red is a status.

### Inputs

- Background: card surface · Text: primary · Border: 1px `#bdbdc1` (dark `rgba(255,255,255,0.12)`) · Radius: 6px · Height: 44px · Font: 16px / 400
- Focus: 1px `#7234e0` border (+ 2px `#e8d6ff` ring for keyboard focus)
- PIN entry (P1): four 44×52px boxes, same border rules, numeric keypad

### Save Indicator

- Caption-size, right-aligned above the day list: "저장 중입니다" (muted) → "저장되었습니다 ✓" (muted text, check in `#7234e0`), fades after 2s
- Failure: "저장 실패 · 다시 시도" with a `#f1415e` icon; the row reverts to its last saved state

### States

| State | Treatment |
|---|---|
| **Empty (내 일정 — nothing entered)** | The 7 rows are the empty state: all segments unselected, quick-action row on top, one muted caption "가능 여부를 선택해 주세요". No illustration. |
| **Empty (공유 뷰 — nobody submitted)** | Day cards still render with all-grey chips and `제출 0/8`; a single muted line "아직 제출한 공대원이 없습니다". |
| **Loading (first fetch)** | Skeleton day cards / rows at final dimensions on the `#f2f2f3` band (dark `#3d3d43` blocks), 16px radius, flat pulse — no shimmer sweep. |
| **Loading (week change / refetch)** | Previous week's content stays at 60% opacity until the new data arrives; no spinner over content. |
| **Saving** | Optimistic: the segment changes immediately; Save Indicator shows progress. |
| **Realtime update** | Changed chip / cell tint intensifies then relaxes over `motion-slow`. No toast. |
| **Error (load failed)** | Inline card: ink text "일정을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요." + retry button; `#f1415e` on the icon only. No bare "오류가 발생했습니다". |
| **Error (save failed / rejected by RPC)** | Row reverts; Save Indicator shows failure. If the RPC rejected a past date: "지난 날짜는 수정할 수 없습니다". |
| **Offline** | Thin banner under the header: "오프라인입니다 · 연결되면 다시 시도합니다", neutral tint; inputs stay enabled only if writes are queued, otherwise disabled. |
| **Locked (past day / past week)** | 60% opacity, lock icon, caption with the reason. Status colors stay visible — the data is still useful. |
| **Validation (memo)** | Counter turns `#f1415e` at 40 chars and further input is blocked; 부분 without a memo is allowed but shows the placeholder nudge. |
| **Disabled** | `#a3a3a9` text on reduced-opacity surface; purple actions fade rather than turn grey. |
| **Initial-reset window (수 00:00–05:59, P2)** | Muted caption under the header: "아직 로아 초기화 전입니다 (06:00)". |

<!-- design-md:section layout-platforms -->
## 5. Layout & Platforms

### Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px
- Page gutter: 16px on mobile, 24px on tablet, 32px on desktop
- Card padding 16px; gap between cards 12px; gap between chips 6–8px

### Screens & Structure

| Route | Mobile structure |
|---|---|
| `/select` | Title → 8 member rows. No header, no tab bar. |
| `/week?w=` | Sticky header (week nav + avatar) → deadline banner (conditional) → submission summary → 최근 변경 (P1) → "카드 / 표" view toggle → 7 day cards → tab bar |
| `/week/me?w=` | Sticky header → deadline banner (conditional) → quick-action row + save indicator → one card with 7 day rows → 제출 완료 badge when all 7 are filled → tab bar |

- **Desktop (≥1024px)**: two panels in a max-width 1200px centered container — left: 내 일정 input panel (fixed 360px); right: shared view, table mode by default. The tab bar disappears; the header spans both.
- The page band is `#f2f2f3` with white cards on it (dark: `#0f1011` with `#252628` cards).

### Whitespace Philosophy
- **Dense where it's data, calm where it's chrome**: chips pack tightly inside a day card; cards themselves breathe (12px gaps, 16px padding).
- **Everything important above the first fold at 360×640**: header, banner, submission summary and at least the first two day cards.

### Border Radius Scale
- Small (4px): segments inside the Status Segment container
- Button (6px): buttons, inputs, chips, badges, banners, segment container
- XL (16px): day cards, list cards, member-select rows, sheet top corners, modals
- Full (9999px): avatars, dots, progress bar, grabber

### Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile (primary) | 360–639px | Single column; shared view as day-card list, chips 4-up; tab bar; bottom sheets. Design target 360–430px. |
| Small mobile | <360px | Still usable: segments drop their text labels (glyph only), chips go 3-up |
| Tablet | 640–1023px | Single column, max-width 640px centered; chips 8-up in one row; table view comfortable without scroll from ~768px |
| Desktop | ≥1024px | Two-panel layout; table view default; tooltips replace bottom sheets for memo / change detail; no tab bar |

### Touch Targets
- Minimum 44×44px for everything tappable — segments, week-nav arrows, avatar, tab items, table cells that open a memo
- Visually smaller elements (28px chip, 32px avatar, 32px member chip with a memo) extend their hit area with padding
- Status controls sit on the right edge of each row; primary sheet actions sit at the bottom

### Collapsing Strategy
- Shared view: 8-column table (desktop) → day-card list (mobile); "표 보기" toggle brings the table back with a sticky date column and contained horizontal scroll
- Nicknames: full (select screen, sheets, tooltips) → truncated with ellipsis (chips, table header)
- Week range: `2026.09.16(수) ~ 09.22(화)` (desktop) → `09.16(수) ~ 09.22(화)` with the year as a caption (mobile)
- Segment labels: glyph + text → glyph only under 360px
- **No horizontal page scroll at 360px** in card mode or on the input screen (acceptance criterion)

### Platform Notes
- Tab bar and bottom sheets pad with `env(safe-area-inset-bottom)`; the header pads with `env(safe-area-inset-top)` in standalone PWA mode
- Inputs are 16px to avoid iOS focus zoom
- PWA (P1): `theme_color` `#ffffff` / dark `#0f1011`, `background_color` matching, `display: standalone`
- Dark mode follows `prefers-color-scheme`; every token in §2 has a dark value, and the status tints are theme-independent
- All displayed dates and "today" are KST regardless of device timezone — never format with the browser's local zone

<!-- design-md:section content-locales -->
## 6. Content & Locales

### Voice & Tone

Korean only, **formal-polite 합쇼체 — every sentence ends in `-합니다` / `-입니다` / `-주세요`**. No 해요체 (`-해요`, `-이에요`, `-돼요`), no questions as headings, no banmal. Instructions are requests (`~를 선택해 주세요`), facts are statements (`저장되었습니다`). Labels, buttons and counts stay noun phrases (`전부 가능`, `제출 6/8`). Keep it short, state facts, name people, and never use pressure.

| Context | Tone | Example |
|---|---|---|
| Identity | Request | "닉네임을 선택해 주세요" · "한 번 선택하면 이 기기에 저장됩니다." |
| Status labels | One word | 가능 · 불가능 · 미정 · 미입력 · `- 선택 -` |
| Quick actions | Noun phrase | "전부 가능" · "전부 불가능" · "지난주와 동일" |
| Progress | Plain fact | "제출 6/8" · "미제출: 항상그놈, 흑마66" · "전원 제출 완료" |
| Input guidance | Request | "가능 여부를 선택해 주세요" |
| Deadline | Informative | "다음 주 일정 마감까지 5시간 남았습니다" |
| Save feedback | Statement | "저장 중입니다" · "저장되었습니다" |
| Locks | Say why | "지난 날짜는 수정할 수 없습니다" · "지난 주 일정은 조회만 가능합니다" |
| Change confirm | Statement + request | "이미 공유된 일정을 변경합니다. 공대원에게도 따로 알려 주세요." |
| Change log | Compact | "말랭짱 · 09.19(토) 가능 → 불가능 · 2시간 전" |
| Errors | What happened + request | "일정을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요." |

### Formats
- Date: `MM.DD(요일)` — `09.16(수)`; week range: `2026.09.16(수) ~ 09.22(화)`; week order is always 수 목 금 토 일 월 화
- Counts: `가능 5 · 부분 1` (부분 is never folded into 가능 as 0.5); submission: `제출 6/8`
- Raid-size badges: "8인 가능" · "4인 가능"
- Relative time for changes within 24h ("2시간 전"), then `MM.DD HH:mm`; all KST
- Time: `종일` or `HH:mm 이후` in options, `HH:mm~` in chips, `HH:mm부터` for the common start; 30-minute steps, 00:00–23:30

**Forbidden register**: 해요체 and banmal, guilt or shaming of late members, fake urgency, vague system-speak with no next step ("오류가 발생했습니다" alone), and English status words in the UI (`available` etc. are data values only).

<!-- design-md:section governance -->
## 7. Governance

### Agent Prompt Guide

### Quick Color Reference
- Status: 가능 `#21ab79` · 부분 `#f5a524` · 불가 `#f1415e` · 미입력 `#a3a3a9`; tints `rgba(33,171,121,0.14)` / `rgba(245,165,36,0.18)` / `rgba(241,65,94,0.14)` / `#f2f2f3`
- Action / highlight: NC Purple `#7234e0` (dark `#8243f2`), pressed `#482486`, subtle `#e8d6ff`, faint `#f6eeff`
- Light: page band `#f2f2f3`, card `#ffffff`, ink `#0f1011`, secondary `#3d3d43`, muted `#888890`, hairline `rgba(0,0,0,0.12)`
- Dark: page `#0f1011`, card `#252628`, raised `#3d3d43`, text `#ffffff`, secondary `#a3a3a9`, hairline `rgba(255,255,255,0.12)`
- Info ("변경됨"): `#38aefa`
- Member colors: see §2 table (avatar only)

### Suggested Token Names (Tailwind theme / CSS variables)
`--bg-page`, `--bg-card`, `--bg-raised`, `--text-primary`, `--text-secondary`, `--text-muted`, `--line`, `--primary`, `--primary-strong`, `--primary-subtle`, `--primary-faint`, `--status-available`, `--status-undecided`, `--status-unavailable`, `--status-none` (+ `-tint` and `-text` variants), `--info`. Define light values on `:root` and dark values under `@media (prefers-color-scheme: dark)`; components reference tokens only, never raw hex.

### Example Component Prompts
- "Build the schedule table for `/week/me`: one 16px-radius white card, a 36px header row (날짜 · 가능 여부 · 시간, 12px `#62626a`) and seven 64px rows on a `52px | 1fr | 1fr` grid with hairlines. Date cell: weekday 16px/700 over MM.DD 12px. Status cell: native select, 44px, 6px radius, options `- 선택 -` / `○ 가능` / `✕ 불가능` / `△ 미정`; when chosen it takes the status tint, a 1px status-text border and 700 weight. Time cell: native select, `종일` + `00:00 이후`…`23:30 이후` every 30 minutes, disabled unless 가능. No shadows."
- "Build the shared-view day card: `#ffffff` card, 16px radius, no shadow, 8px apart on a `#f2f2f3` page. Mobile: `09.26(토)` 16px/700 left and `8인 가능 · 22:00부터` 14px/700 right, then an 8-segment status bar (10px tall, sorted 가능→미정→불가능→미입력), then `가능 7 · 미정 1` 12px. If ≥4 are 가능: 1px `#e8d6ff` border. If all 8: invert the card — `#7234e0` background, white text, white segments (others white 35%). Tapping expands `○ 닉네임 20:30~` chips plus one text line per other status. Desktop: one 76px row — 110px date · bar with an ellipsized `닉네임 시간` line · 210px right-aligned `7 /8 가능` 20px/700."
- "Build the mobile bottom tab bar: two tabs 전체 일정 / 내 일정, 56px + safe-area inset, card surface, top hairline `rgba(0,0,0,0.12)`, active color `#7234e0`, inactive `#888890`, 12px/500 labels, no shadow."

### Iteration Guide
1. Status colors (green / amber / red / grey) mean availability only — never reuse them for chrome
2. Every status is color **and** glyph (○ △ ✕ –)
3. NC Purple is for the action, the active control, and the recommended day — nothing decorative
4. Pretendard only; 700 anchors, 500 tappable, 400 body; tabular numerals for dates and counts
5. No shadows — tint, hairline, scrim
6. Radius: 6px controls, 16px cards / sheets / modals, full-round avatars and dots
7. 44px minimum touch targets; no horizontal page scroll at 360px
8. Light and dark together, tokens only
9. Member colors live on avatars only
10. Locked things explain why; copy is 합니다/입니다/주세요체 throughout and never nags
11. When this document and `raid-calendar-spec.md` disagree on behavior, the spec wins; when the spec is silent on appearance, this document wins

<!-- design-md:claim authority kind=evidence-backed-reconstruction lang=en -->
### Authority

The NC-derived values in this document (purple, neutral and point tokens, Pretendard, radius and flat-surface rules) are an evidence-backed reconstruction of the `nc.com` reference. Their application to the raid calendar — and every value marked **(project)** — is a project decision made for `raid-calendar-spec.md`, not a claim about NC's own system. This document is authoritative for this project's appearance only.
<!-- design-md:claim-end -->

<!-- design-md:claim application-priority order=prompt-fact,repository-fact,system-contract,reference-inspiration lang=en -->
### Application priority

1. Direct user instructions for the requested scope.
2. Repository facts — including `docs/raid-calendar-spec.md` for behavior, data and scope.
3. This system contract.
4. Reference inspiration (the NC portal).
<!-- design-md:claim-end -->

<!-- design-md:claim unknowns policy=absent-at-smallest-unresolved-boundary lang=en -->
### Unknowns

Omit only the smallest unresolved value or group. Do not replace it with a plausible default.

Currently unresolved (tracks spec §8): visual treatment of a "지각 제출" marker (only if that option is adopted); week-nav range beyond next week; time-slot input UI (only if date + memo is replaced); PIN entry flow details beyond the input boxes.
<!-- design-md:claim-end -->

<!-- design-md:claim changes policy=review-record-validate-before-adoption lang=en -->
### Changes

Record, review, and validate changes before adoption.

- 2026-09-18 — Input model and layouts confirmed on the Claude Design canvas: status set is 가능 / 불가능 / 미정 with a per-day start time (30-minute steps) replacing 부분 가능 + memo; input = Schedule Table (mockup 3), shared view = Day Card list (S4 mobile / L4 desktop), table view removed; UI copy unified to 합니다/입니다/주세요체.
- 2026-09-18 — Adapted from the NCSOFT reference design system to the raid calendar spec: removed the NC PLAY editorial surface, Helvetica Now, hero carousel, brand narrative and NC BLUE heritage roles; added availability status palette (incl. project-defined amber), dark-theme surface map, member colors, app components (status segment, day card, member chip, table view, tab bar, banner, sheets), app states, mobile-first layout and Korean UI copy rules.
<!-- design-md:claim-end -->
