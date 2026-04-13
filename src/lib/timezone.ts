/**
 * Vietnam timezone helpers — shared by client and server.
 *
 * Why a dedicated module: importing from football-data.ts in client code
 * would bundle Redis/server-only deps into the browser. This file has zero
 * runtime imports so it tree-shakes cleanly into both environments.
 */

export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
const GMT_PLUS_7_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Today in Vietnam (GMT+7), formatted YYYY-MM-DD. Pass an offset to shift
 *  forward/backward by N calendar days. */
export function getVietnamDate(offsetDays = 0): string {
  const vn = new Date(Date.now() + GMT_PLUS_7_OFFSET_MS);
  vn.setUTCDate(vn.getUTCDate() + offsetDays);
  return vn.toISOString().slice(0, 10);
}

/** Current wall-clock Date object shifted into GMT+7. Useful when you need
 *  hour/minute/weekday in Vietnam time. */
export function getVietnamNow(): Date {
  return new Date(Date.now() + GMT_PLUS_7_OFFSET_MS);
}

/** Convert any UTC ISO string to a Date object whose UTC fields read as
 *  the GMT+7 wall-clock time. */
export function utcToVietnam(utcDateStr: string): Date {
  return new Date(new Date(utcDateStr).getTime() + GMT_PLUS_7_OFFSET_MS);
}
