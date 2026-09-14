import type { BusinessHours, DayHours } from '@/types/map';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/*
  A shop that is shut for now but not gone -- a renovation, a family emergency, a
  seasonal break.

  It rides inside `business_hours` rather than in a column of its own, so no migration is
  needed and the admin endpoint keeps passing one opaque JSON object through. The trade is
  written down where it can be found: this key lives in the same blob the days live in, so
  anything that *replaces* `business_hours` wholesale drops the flag with them. A Google
  Places refresh does exactly that -- un-closing a shop because Google believes it is open
  is a defensible reading, but it is a silent one.

  Everything below is the only place that names the key. `BusinessHours` stays typed as a
  day map because every other reader indexes it by day.
*/
const TEMPORARILY_CLOSED_KEY = 'temporarily_closed';

export function isTemporarilyClosed(businessHours?: BusinessHours): boolean {
  if (!businessHours) return false;
  return (businessHours as unknown as Record<string, unknown>)[TEMPORARILY_CLOSED_KEY] === true;
}

/*
  Setting it off removes the key rather than storing `false`. The absence of the flag is
  already what "open as usual" means, and a stored `false` would leave every row that was
  ever closed carrying a key that reads like a decision.
*/
export function setTemporarilyClosed(
  businessHours: BusinessHours | undefined,
  closed: boolean
): BusinessHours | undefined {
  const next = { ...(businessHours || {}) } as unknown as Record<string, unknown>;
  if (closed) {
    next[TEMPORARILY_CLOSED_KEY] = true;
  } else {
    delete next[TEMPORARILY_CLOSED_KEY];
  }
  return Object.keys(next).length > 0 ? (next as unknown as BusinessHours) : undefined;
}

/*
  The day rows, with the flag filtered out. `Object.keys(business_hours).length > 0` was
  the test for "are there any hours to show", and the flag on its own would have answered
  yes and rendered an hours panel with nothing in it.
*/
export function dayHourEntries(businessHours?: BusinessHours): [string, DayHours][] {
  if (!businessHours) return [];
  return DAYS_OF_WEEK.flatMap((day) => {
    const hours = businessHours[day];
    return hours ? [[day, hours] as [string, DayHours]] : [];
  });
}

export function hasDayHours(businessHours?: BusinessHours): boolean {
  return dayHourEntries(businessHours).length > 0;
}

export function getCurrentDayInTimezone(timezone?: string): string {
  const now = new Date();
  const dayIndex = timezone
    ? new Date(now.toLocaleString('en-US', { timeZone: timezone })).getDay()
    : now.getDay();
  return DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
}

export function getCurrentTimeInTimezone(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    return `${hour}:${minute}`;
  }
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isOpenNow(businessHours?: BusinessHours, timezone?: string): boolean {
  if (!businessHours) return false;
  // Whatever the timetable says, the door is locked.
  if (isTemporarilyClosed(businessHours)) return false;
  const today = getCurrentDayInTimezone(timezone);
  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.open || !todayHours.close) return false;

  const currentTime = getCurrentTimeInTimezone(timezone);
  const currentMinutes = timeToMinutes(currentTime);
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  // close <= open means hours wrap past midnight (e.g. 22:00-02:00)
  if (closeMinutes <= openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
