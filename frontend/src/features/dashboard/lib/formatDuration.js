export function formatDuration(totalMinutes) {
  const MINUTES_IN_HOUR = 60;
  const MINUTES_IN_DAY = 60 * 24;
  const MINUTES_IN_YEAR = 60 * 24 * 365;

  const years = Math.floor(totalMinutes / MINUTES_IN_YEAR);
  totalMinutes %= MINUTES_IN_YEAR;

  const days = Math.floor(totalMinutes / MINUTES_IN_DAY);
  totalMinutes %= MINUTES_IN_DAY;

  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
  const minutes = totalMinutes % MINUTES_IN_HOUR;

  const parts = [];

  if (years) parts.push(`${years}y`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}