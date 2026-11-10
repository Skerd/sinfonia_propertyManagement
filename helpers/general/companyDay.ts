import {zonedParts} from "@coreModule/helpers/general/dateTime.ts";

/**
 * Calendar days of propertyManagement (due, sale, lease, expiry days) are local `YYYY-MM-DD` strings (GLB-09, D115).
 * These helpers give the company's "today" (pass `useCompanyTimeZone()`, D116) and step days without a timezone, so
 * a filter or a default means the same day the server and its crons use.
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** The company's calendar day at `now`, in `timeZone`. */
export function companyToday(timeZone: string, now: Date = new Date()): string {
    const parts = zonedParts(now, timeZone);
    if (!parts) return now.toISOString().slice(0, 10);
    return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

/** `day` moved by `days` calendar days (negative goes back); both `YYYY-MM-DD`. */
export function addDays(day: string, days: number): string {
    const [year, month, date] = day.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, date + days));
    return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

/** The first and last day of the month `day` falls in. */
export function monthOf(day: string): {from: string; to: string} {
    const [year, month] = day.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const prefix = day.slice(0, 7);
    return {from: `${prefix}-01`, to: `${prefix}-${pad2(lastDay)}`};
}
