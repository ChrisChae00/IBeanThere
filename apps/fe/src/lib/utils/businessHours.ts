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

export function isOpenNow(businessHours?: BusinessHours, timezone?: string): boolean {
  if (!businessHours) return false;
  const today = getCurrentDayInTimezone(timezone);
  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return false;
  const currentTime = getCurrentTimeInTimezone(timezone);
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}
