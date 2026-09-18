'use client';

import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** 모바일: 바텀시트 / 데스크톱: 가운데 카드. 그림자 없이 스크림 + 헤어라인으로 구분 */
export function Sheet({ title, onClose, children }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-scrim"
      />
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-[640px] animate-sheet-in rounded-t-card border-t border-line bg-card px-4 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))] lg:max-w-[400px] lg:animate-fade-in lg:rounded-card lg:border lg:pt-4"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-input lg:hidden" />
        <h2 className="mb-3 text-base font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
