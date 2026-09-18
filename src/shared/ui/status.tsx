import type { AvailabilityStatus } from '@/shared/api/types';

export type StatusKey = AvailabilityStatus | 'none';

interface StatusMeta {
  label: string;
  shortLabel: string;
  /** 글리프/도트 색 */
  text: string;
  /** 틴트 위 글자색 */
  strong: string;
  /** 칩·셀 배경 */
  tint: string;
  /** 선택된 세그먼트 */
  solid: string;
}

export const STATUS_META: Record<StatusKey, StatusMeta> = {
  available: {
    label: '가능',
    shortLabel: '가능',
    text: 'text-available',
    strong: 'text-available-text',
    tint: 'bg-available-tint',
    solid: 'bg-available text-white',
  },
  undecided: {
    label: '미정',
    shortLabel: '미정',
    text: 'text-undecided',
    strong: 'text-undecided-text',
    tint: 'bg-undecided-tint',
    solid: 'bg-undecided text-ink',
  },
  unavailable: {
    label: '불가능',
    shortLabel: '불가',
    text: 'text-unavailable',
    strong: 'text-unavailable-text',
    tint: 'bg-unavailable-tint',
    solid: 'bg-unavailable text-white',
  },
  none: {
    label: '미입력',
    shortLabel: '미입력',
    text: 'text-none',
    strong: 'text-none-text',
    tint: 'bg-none-tint',
    solid: 'bg-none text-white',
  },
};

/** 셀렉트 옵션·정렬 순서 */
export const STATUS_ORDER: AvailabilityStatus[] = ['available', 'unavailable', 'undecided'];

/** ○ △ ✕ – : 색에만 의존하지 않도록 상태마다 고유 글리프 */
export function StatusGlyph({ status, size = 14 }: { status: StatusKey; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: 'shrink-0',
  };
  switch (status) {
    case 'available':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
        </svg>
      );
    case 'undecided':
      return (
        <svg {...common}>
          <path d="M8 2.5 14 13.5H2Z" />
        </svg>
      );
    case 'unavailable':
      return (
        <svg {...common}>
          <path d="m3 3 10 10M13 3 3 13" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 8h8" />
        </svg>
      );
  }
}
