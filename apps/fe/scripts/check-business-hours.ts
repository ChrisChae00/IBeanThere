import assert from 'node:assert';
import {
  dayHourEntries,
  hasDayHours,
  isOpenNow,
  isTemporarilyClosed,
  setTemporarilyClosed,
} from '../src/lib/utils/businessHours';
import type { BusinessHours } from '../src/types/map';

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

/*
  Temporarily closed lives inside the same JSON blob as the days, so the two things it
  must not break are the two things that read that blob: "is it open" and "are there any
  hours to show". A flag mistaken for a day would render an hours panel with no hours.
*/
const closedForNow = setTemporarilyClosed(nonWrapping, true)!;

assert.strictEqual(isTemporarilyClosed(closedForNow), true);
assert.strictEqual(isTemporarilyClosed(nonWrapping), false);
assert.strictEqual(isTemporarilyClosed(undefined), false);

// Open inside Monday's hours, and still shut, because the door is what is being reported.
withMockedTime('12:00', () => {
  assert.strictEqual(isOpenNow(nonWrapping), true);
  assert.strictEqual(isOpenNow(closedForNow), false, 'a temporarily closed shop is never open');
});

// The flag is not a day.
assert.deepStrictEqual(
  dayHourEntries(closedForNow).map(([day]) => day),
  ['monday'],
  'the flag was counted as a day'
);
assert.strictEqual(hasDayHours(setTemporarilyClosed(undefined, true)), false,
  'the flag alone must not read as having hours');
assert.strictEqual(hasDayHours(nonWrapping), true);

// Clearing it drops the key rather than storing false, and an otherwise empty blob
// collapses to undefined so no cafe carries `{}` where it had no hours to begin with.
const reopened = setTemporarilyClosed(closedForNow, false)!;
assert.strictEqual(isTemporarilyClosed(reopened), false);
assert.ok(!('temporarily_closed' in reopened), 'clearing should remove the key, not set false');
assert.deepStrictEqual(reopened, nonWrapping, 'reopening should leave the timetable untouched');
assert.strictEqual(setTemporarilyClosed(undefined, false), undefined);

console.log('businessHours.isOpenNow: all checks passed');
