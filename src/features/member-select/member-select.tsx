'use client';

import { useRouter } from 'next/navigation';
import { useMembers } from '@/shared/lib/queries';
import { useCurrentMemberId } from '@/shared/lib/stores';
import { Avatar } from '@/shared/ui/avatar';

export function MemberSelect() {
  const router = useRouter();
  const { data: members, isPending, isError, refetch } = useMembers();
  const [currentId, setCurrentId] = useCurrentMemberId();

  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pt-[calc(48px+env(safe-area-inset-top))] pb-[calc(32px+env(safe-area-inset-bottom))]">
      <h1 className="text-2xl leading-[1.3] font-bold">닉네임을 선택해 주세요</h1>
      <p className="mt-1 mb-6 text-sm text-fg-muted">한 번 선택하면 이 기기에 저장되어 다음부터 바로 입장합니다.</p>

      {isError && (
        <div className="rounded-card border border-line bg-card p-4 text-fg-secondary">
          <p>공대원 목록을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 h-11 rounded-ctl bg-primary px-4 font-medium text-white active:bg-primary-strong"
          >
            다시 시도
          </button>
        </div>
      )}

      <ul className="grid gap-2">
        {isPending &&
          Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="h-[72px] animate-pulse-flat rounded-card bg-alt" />
          ))}
        {members?.map((member) => {
          const selected = member.id === currentId;
          return (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => {
                  setCurrentId(member.id);
                  router.replace('/week/me');
                }}
                className={`flex min-h-[72px] w-full items-center gap-3 rounded-card border bg-card px-4 text-left transition-colors duration-100 active:bg-primary-faint ${
                  selected ? 'border-2 border-primary bg-primary-faint' : 'border-line'
                }`}
              >
                <Avatar member={member} size={48} />
                <span className="min-w-0 font-medium break-all">{member.nickname}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
