import { describe, expect, it } from 'vitest';
import { commonStart, commonStartLabel, formatSlot, isValidSlot, slotLabel, slotShort, TIME_SLOTS } from './time';

describe('time slots', () => {
  it('00:00 ~ 23:30, 30분 단위 48개', () => {
    expect(TIME_SLOTS).toHaveLength(48);
    expect(formatSlot(TIME_SLOTS[0])).toBe('00:00');
    expect(formatSlot(TIME_SLOTS[1])).toBe('00:30');
    expect(formatSlot(TIME_SLOTS.at(-1)!)).toBe('23:30');
  });

  it('라벨', () => {
    expect(slotLabel(null)).toBe('종일');
    expect(slotLabel(1230)).toBe('20:30 이후');
    expect(slotShort(1230)).toBe('20:30~');
  });

  it('공통 시작 시간은 가장 늦은 시작', () => {
    expect(commonStart([null, 1200, 1320, 1230])).toBe(1320);
    expect(commonStart([null, null])).toBeNull();
    expect(commonStartLabel(1320)).toBe('22:00부터');
    expect(commonStartLabel(null)).toBe('종일 가능');
  });

  it('isValidSlot', () => {
    expect(isValidSlot(1230)).toBe(true);
    expect(isValidSlot(1245)).toBe(false);
    expect(isValidSlot(0)).toBe(true);
    expect(isValidSlot(-30)).toBe(false);
    expect(isValidSlot(24 * 60)).toBe(false);
  });
});
