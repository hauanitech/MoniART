import https from 'https';
import { config } from '../config.js';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface TimeSlot {
  start: number; // minutes since midnight
  end: number;
}

interface OccupiedSlot extends TimeSlot {
  summary: string;
}

export interface RoomAvailability {
  room: string;
  status: 'free' | 'occupied' | 'unknown';
  currentEvent?: string;
  freeSlots: { start: string; end: string }[];
  occupiedSlots: { start: string; end: string; summary: string }[];
  nextFree?: { start: string; end: string };
}

// ─── Room → ICS ID mapping ─────────────────────────────────────────────────────
// Maps template room names to ICS calendar IDs from ics.ent.upf.pf

const ROOM_ICS_MAP: Record<string, string | null> = {
  'B2-2': 'sal-2190',  // B2-2-TP in ICS
  'B2-3': 'sal-2192',  // B2-3-TP in ICS
  'B2-4': 'sal-2191',  // B2-4-TP in ICS
  'B1-2': 'sal-2193',  // B1-2-TP in ICS
  'B1-3': 'sal-2215',  // B1-3-TP in ICS
};

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Day window in minutes since midnight */
const DAY_START_MIN = 7 * 60 + 30;  // 07:30
const DAY_END_MIN = 20 * 60;         // 20:00

// ─── Cache ──────────────────────────────────────────────────────────────────────

let cachedResult: RoomAvailability[] | null = null;
let cacheTimestamp = 0;

// ─── Utilities ──────────────────────────────────────────────────────────────────

/** Current time in minutes since midnight (Tahiti UTC-10) */
function nowMin(): number {
  const d = new Date();
  // Convert to Tahiti time (UTC-10)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const tahiti = new Date(utc - 10 * 3600000);
  return tahiti.getHours() * 60 + tahiti.getMinutes();
}

/** Today's date as YYYYMMDD in Tahiti timezone */
function todayStr(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const tahiti = new Date(utc - 10 * 3600000);
  return `${tahiti.getFullYear()}${String(tahiti.getMonth() + 1).padStart(2, '0')}${String(tahiti.getDate()).padStart(2, '0')}`;
}

/** Minutes since midnight → "HHhMM" */
function fmt(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}h${String(min % 60).padStart(2, '0')}`;
}

// ─── HTTP fetch ─────────────────────────────────────────────────────────────────

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10_000 }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ─── ICS Parser (RFC 5545) ──────────────────────────────────────────────────────

function parseICS(icsText: string, targetDate: string): OccupiedSlot[] {
  // Normalize line endings + unfold continuation lines (RFC 5545 §3.1)
  const raw = icsText.replace(/\r\n?/g, '\n');
  const lines: string[] = [];
  for (const line of raw.split('\n')) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  const events: Record<string, string>[] = [];
  let inEvent = false;
  let cur: Record<string, string> = {};

  for (const line of lines) {
    const c = line.indexOf(':');
    if (c === -1) continue;
    const key = line.slice(0, c).split(';')[0].toUpperCase().trim();
    const val = line.slice(c + 1).trim();

    if (key === 'BEGIN' && val === 'VEVENT') { inEvent = true; cur = {}; continue; }
    if (key === 'END' && val === 'VEVENT') { inEvent = false; if (cur.DTSTART && cur.DTEND) events.push(cur); cur = {}; continue; }
    if (inEvent) cur[key] = val;
  }

  const slots: OccupiedSlot[] = [];

  for (const ev of events) {
    const s = ev.DTSTART || '';
    const e = ev.DTEND || '';

    // Parse date+time components
    const sMatch = s.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    const eMatch = e.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    if (!sMatch || !eMatch) continue;

    const isUtc = s.endsWith('Z');

    let sMin: number;
    let eMin: number;
    let sDateTahiti: string;
    let eDateTahiti: string;

    if (isUtc) {
      // Convert full UTC datetime to Tahiti (UTC-10) before extracting date & time
      const sUtc = Date.UTC(+sMatch[1], +sMatch[2] - 1, +sMatch[3], +sMatch[4], +sMatch[5]);
      const eUtc = Date.UTC(+eMatch[1], +eMatch[2] - 1, +eMatch[3], +eMatch[4], +eMatch[5]);
      const sTahiti = new Date(sUtc - 10 * 3600000);
      const eTahiti = new Date(eUtc - 10 * 3600000);

      sDateTahiti = `${sTahiti.getUTCFullYear()}${String(sTahiti.getUTCMonth() + 1).padStart(2, '0')}${String(sTahiti.getUTCDate()).padStart(2, '0')}`;
      eDateTahiti = `${eTahiti.getUTCFullYear()}${String(eTahiti.getUTCMonth() + 1).padStart(2, '0')}${String(eTahiti.getUTCDate()).padStart(2, '0')}`;

      sMin = sTahiti.getUTCHours() * 60 + sTahiti.getUTCMinutes();
      eMin = eTahiti.getUTCHours() * 60 + eTahiti.getUTCMinutes();
    } else {
      // Already local time — use as-is
      sDateTahiti = `${sMatch[1]}${sMatch[2]}${sMatch[3]}`;
      eDateTahiti = `${eMatch[1]}${eMatch[2]}${eMatch[3]}`;
      sMin = (+sMatch[4]) * 60 + (+sMatch[5]);
      eMin = (+eMatch[4]) * 60 + (+eMatch[5]);
    }

    // Filter: keep only events whose Tahiti date matches target
    if (sDateTahiti !== targetDate && eDateTahiti !== targetDate) continue;

    if (eMin <= DAY_START_MIN || sMin >= DAY_END_MIN) continue;

    slots.push({
      start: Math.max(sMin, DAY_START_MIN),
      end: Math.min(eMin, DAY_END_MIN),
      summary: (ev.SUMMARY || '').replace(/\\[,;nN]/g, ' ').trim(),
    });
  }

  return slots.sort((a, b) => a.start - b.start);
}

// ─── Free slots computation ─────────────────────────────────────────────────────

function computeFreeSlots(occupied: TimeSlot[]): TimeSlot[] {
  if (!occupied.length) return [{ start: DAY_START_MIN, end: DAY_END_MIN }];

  // Merge overlapping slots
  const sorted = [...occupied].sort((a, b) => a.start - b.start);
  const merged: TimeSlot[] = [];
  for (const s of sorted) {
    if (!merged.length || s.start > merged[merged.length - 1].end) {
      merged.push({ ...s });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, s.end);
    }
  }

  const free: TimeSlot[] = [];
  let cur = DAY_START_MIN;
  for (const o of merged) {
    if (o.start > cur) free.push({ start: cur, end: o.start });
    cur = Math.max(cur, o.end);
  }
  if (cur < DAY_END_MIN) free.push({ start: cur, end: DAY_END_MIN });
  return free;
}

// ─── Main API ───────────────────────────────────────────────────────────────────

export async function getRoomAvailability(): Promise<RoomAvailability[]> {
  // Check cache
  const now = Date.now();
  if (cachedResult && (now - cacheTimestamp) < config.icsCacheTtlMs) {
    return cachedResult;
  }

  const today = todayStr();
  const currentMin = nowMin();
  const rooms = Object.keys(ROOM_ICS_MAP);

  const results: RoomAvailability[] = await Promise.all(
    rooms.map(async (roomName): Promise<RoomAvailability> => {
      const icsId = ROOM_ICS_MAP[roomName];

      // No ICS ID → unknown status
      if (!icsId) {
        return {
          room: roomName,
          status: 'unknown',
          freeSlots: [],
          occupiedSlots: [],
        };
      }

      try {
        const icsText = await fetchText(`${config.icsBaseUrl}?id=${icsId}`);
        const occupied = parseICS(icsText, today);
        const free = computeFreeSlots(occupied);

        const isFreeNow = free.some((s) => s.start <= currentMin && s.end > currentMin);
        const currentOccupied = occupied.find((s) => s.start <= currentMin && s.end > currentMin);
        const nextFreeSlot = free.find((s) => s.start > currentMin);

        return {
          room: roomName,
          status: isFreeNow ? 'free' : 'occupied',
          currentEvent: currentOccupied?.summary,
          freeSlots: free.map((s) => ({ start: fmt(s.start), end: fmt(s.end) })),
          occupiedSlots: occupied.map((s) => ({ start: fmt(s.start), end: fmt(s.end), summary: s.summary })),
          nextFree: nextFreeSlot ? { start: fmt(nextFreeSlot.start), end: fmt(nextFreeSlot.end) } : undefined,
        };
      } catch {
        return {
          room: roomName,
          status: 'unknown',
          freeSlots: [],
          occupiedSlots: [],
        };
      }
    }),
  );

  // Update cache
  cachedResult = results;
  cacheTimestamp = now;

  return results;
}
