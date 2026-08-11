import assert from 'node:assert';
import { isOpenNow } from '../src/lib/utils/businessHours.ts';
import type { BusinessHours } from '../src/types/map.ts';

// Regression check for the midnight-wrap bug in isOpenNow().
// Run: npx tsx scripts/check-business-hours.ts

const originalDate = Date;

function withMockedTime(hhmm: string, run: () => void) {
  const [h, m] = hhmm.split(':').map(Number);
  class MockDate extends originalDate {
    constructor() {
      super();
      return new originalDate(2026, 0, 5, h, m, 0);
    }
    static override now() {
      return new originalDate(2026, 0, 5, h, m, 0).getTime();
    }
  }
  // @ts-expect-error swapping global Date for the duration of the check
  global.Date = MockDate;
  try {
    run();
  } finally {
    global.Date = originalDate;
  }
}

const wrapping: BusinessHours = {
  monday: { open: '22:00', close: '02:00', closed: false },
} as BusinessHours;

const nonWrapping: BusinessHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
} as BusinessHours;

withMockedTime('01:00', () => {
  assert.strictEqual(isOpenNow(wrapping), true, '01:00 should be open for 22:00-02:00 hours');
});

withMockedTime('03:00', () => {
  assert.strictEqual(isOpenNow(wrapping), false, '03:00 should be closed for 22:00-02:00 hours');
});

withMockedTime('23:00', () => {
  assert.strictEqual(isOpenNow(wrapping), true, '23:00 should be open for 22:00-02:00 hours');
});

withMockedTime('12:00', () => {
  assert.strictEqual(isOpenNow(nonWrapping), true, '12:00 should be open for 09:00-18:00 hours');
});

withMockedTime('20:00', () => {
  assert.strictEqual(isOpenNow(nonWrapping), false, '20:00 should be closed for 09:00-18:00 hours');
});

console.log('businessHours.isOpenNow: all checks passed');
