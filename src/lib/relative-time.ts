/**
 * Convert match date+time to relative Vietnamese label.
 * e.g. "2 giờ nữa", "30 phút nữa", "Ngày mai 22:00"
 */
export function getRelativeTime(date: string, time: string): string | null {
  // matchTime is anchored to GMT+7 with explicit offset, so it parses to a
  // real epoch ms. Compare against Date.now() — no manual shift needed.
  const matchTime = new Date(`${date}T${time}:00+07:00`);
  const diffMs = matchTime.getTime() - Date.now();

  if (diffMs < 0) return null; // past

  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin <= 0) return "Sắp đá";
  if (diffMin < 60) return `${diffMin} phút nữa`;
  if (diffMin < 120) return "1 giờ nữa";
  if (diffMin < 360) return `${Math.floor(diffMin / 60)} giờ nữa`;

  return null; // too far, just show the time
}
