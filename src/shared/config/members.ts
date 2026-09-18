import type { Member } from '@/shared/api/types';

/** supabase/seed.sql 과 동일. Supabase 미연결(로컬 모드)일 때 사용. */
export const SEED_MEMBERS: Member[] = [
  { id: 1, nickname: '딘또썬', color: '#1d4b99', sort_order: 1 },
  { id: 2, nickname: '말랭짱', color: '#38aefa', sort_order: 2 },
  { id: 3, nickname: '흑마66', color: '#6768f6', sort_order: 3 },
  { id: 4, nickname: '고추좋아해요', color: '#fa38ec', sort_order: 4 },
  { id: 5, nickname: '항상그놈', color: '#0e9aa7', sort_order: 5 },
  { id: 6, nickname: '네이팜고스트', color: '#8a5a3c', sort_order: 6 },
  { id: 7, nickname: '슈레이드성', color: '#e0609a', sort_order: 7 },
  { id: 8, nickname: '골드내놔쉴드도유료야', color: '#7a8b2a', sort_order: 8 },
];
