import type { EventProps } from 'react-big-calendar';
import type { CalendarEvent } from './CalendarView';

/**
 * 10-color palette: each entry has a background fill and a darker left-border
 * accent so blocks are visually distinct even when colours are similar.
 */
const USER_PALETTE: { bg: string; border: string }[] = [
  { bg: '#3b82f6', border: '#1d4ed8' }, // blue
  { bg: '#10b981', border: '#047857' }, // emerald
  { bg: '#f59e0b', border: '#b45309' }, // amber
  { bg: '#ef4444', border: '#b91c1c' }, // red
  { bg: '#8b5cf6', border: '#5b21b6' }, // violet
  { bg: '#ec4899', border: '#9d174d' }, // pink
  { bg: '#14b8a6', border: '#0f766e' }, // teal
  { bg: '#f97316', border: '#c2410c' }, // orange
  { bg: '#06b6d4', border: '#0e7490' }, // cyan
  { bg: '#84cc16', border: '#3f6212' }, // lime
];

/** Stable hash: same userId → same palette index */
function hashId(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return h % USER_PALETTE.length;
}

/** Returns { bg, border } for a given userId. */
export function paletteForUser(userId: string): { bg: string; border: string } {
  return USER_PALETTE[hashId(userId)]!;
}

interface TimeblockEventProps extends EventProps<CalendarEvent> {}

const LOCATION_COLORS: Record<string, string> = {
  'B2-1': 'rgba(0,0,0,0.25)',
  BU: 'rgba(0,0,0,0.20)',
};

export function TimeblockEvent({ event }: TimeblockEventProps) {
  if (event.resource?.type !== 'timeblock') return null;

  const { data } = event.resource;
  const durationMin = (event.end.getTime() - event.start.getTime()) / 60000;

  // Compact: block < 45 min  →  single line
  if (durationMin < 45) {
    return (
      <div
        className="flex items-center gap-1 h-full px-1.5 overflow-hidden leading-none"
        title={event.title}
      >
        <span
          className="shrink-0 px-1 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wide"
          style={{
            background: LOCATION_COLORS[data.location] ?? 'rgba(0,0,0,0.2)',
          }}
        >
          {data.location}
        </span>
        <span className="truncate text-white text-xs font-medium">
          {data.userName}
        </span>
      </div>
    );
  }

  // Normal / tall block  →  two lines
  return (
    <div
      className="flex flex-col justify-start h-full px-1.5 py-1 overflow-hidden gap-0.5"
      title={event.title}
    >
      <span className="truncate text-white text-xs font-semibold leading-tight">
        {data.userName}
      </span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className="shrink-0 px-1 rounded text-[0.6rem] font-bold uppercase tracking-wide leading-4"
          style={{
            background: LOCATION_COLORS[data.location] ?? 'rgba(0,0,0,0.2)',
          }}
        >
          {data.location}
        </span>
        {durationMin >= 60 && (
          <span className="truncate text-white/75 text-[0.65rem] leading-4">
            {data.startTime}–{data.endTime}
          </span>
        )}
      </div>
    </div>
  );
}
