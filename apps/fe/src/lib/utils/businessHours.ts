import { BusinessHours } from '@/types/map';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
  const today = getCurrentDayInTimezone(timezone);
  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.open || !todayHours.close) return false;

  const currentTime = getCurrentTimeInTimezone(timezone);
  const currentMinutes = timeToMinutes(currentTime);
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  // close <= open means closes at or past midnight (e.g. "00:00" or "24:00"+)
  if (closeMinutes <= openMinutes) {
    return currentMinutes >= openMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
