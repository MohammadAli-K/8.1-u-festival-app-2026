/**
 * Minimal RFC 5545 (`text/calendar`) generator for the schedule favourites export.
 * Zero dependencies; UTC timestamps avoid shipping a `VTIMEZONE` block while still
 * rendering correctly in any calendar app (the user's app converts to local tz).
 */

const CRLF = '\r\n';
const PRODID = '-//U-Festival//Schedule Export 1.0//NL';

/** @param {number} n */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format a Date as `YYYYMMDDTHHMMSSZ` (UTC).
 * @param {Date} date
 */
function toIcsUtc(date) {
  return (
    date.getUTCFullYear() +
    pad2(date.getUTCMonth() + 1) +
    pad2(date.getUTCDate()) +
    'T' +
    pad2(date.getUTCHours()) +
    pad2(date.getUTCMinutes()) +
    pad2(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escape characters that have special meaning in ICS TEXT values.
 * @param {unknown} s
 */
function escapeIcsText(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Fold a content line at 75 octets per RFC 5545 §3.1. Continuation lines start
 * with a single SPACE. Operates on JS string length (close enough for ASCII /
 * BMP characters in this app's content).
 * @param {string} line
 */
function foldLine(line) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join(CRLF);
}

/**
 * @typedef {{
 *   id: string;
 *   start: Date;
 *   end: Date;
 *   displayTitle: string;
 *   stageId: string;
 *   description: { nl?: string; en?: string } | null;
 *   youtubeUrl: string | null;
 * }} IcsBlock
 */

/**
 * Build an iCalendar (.ics) document for the given schedule blocks.
 *
 * @param {IcsBlock[]} blocks
 * @param {{
 *   language: 'nl' | 'en';
 *   stageName: (stageId: string) => string;
 *   calendarName?: string;
 * }} opts
 */
export function buildIcsCalendar(blocks, { language, stageName, calendarName }) {
  const dtstamp = toIcsUtc(new Date());
  const calName =
    calendarName ?? (language === 'nl' ? '❤️U Festival – Mijn programma' : '❤️U Festival – My schedule');

  /** @type {string[]} */
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${escapeIcsText(calName)}`),
  ];

  for (const b of blocks) {
    const stage = stageName(b.stageId);
    const desc = b.description?.[language] ?? b.description?.en ?? '';
    const summary = stage ? `${b.displayTitle} (${stage})` : b.displayTitle;
    const location = stage ? `${stage}, ❤️U Festival, Utrecht` : '❤️U Festival, Utrecht';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${b.id}@u-festival-2026.app`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toIcsUtc(b.start)}`,
      `DTEND:${toIcsUtc(b.end)}`,
      foldLine(`SUMMARY:${escapeIcsText(summary)}`),
      foldLine(`LOCATION:${escapeIcsText(location)}`),
      foldLine(`DESCRIPTION:${escapeIcsText(desc)}`),
    );
    if (b.youtubeUrl) {
      lines.push(foldLine(`URL:${b.youtubeUrl}`));
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join(CRLF) + CRLF;
}

/**
 * Trigger a browser download for an ICS payload. Falls back gracefully on iOS
 * Safari (the file opens in-app and the user can pick "Open in Calendar").
 *
 * @param {string} filename
 * @param {string} icsText
 */
export function triggerIcsDownload(filename, icsText) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
