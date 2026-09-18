import type { Member } from '@/shared/api/types';

const SIZES = {
  24: 'size-6 text-[11px]',
  32: 'size-8 text-sm',
  36: 'size-9 text-[15px]',
  48: 'size-12 text-lg',
} as const;

export function Avatar({ member, size = 32 }: { member: Member; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: member.color }}
    >
      {Array.from(member.nickname)[0]}
    </span>
  );
}
