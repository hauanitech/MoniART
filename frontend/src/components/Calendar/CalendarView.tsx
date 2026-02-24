import { useMemo, useCallback, useState } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type SlotInfo,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Timeblock } from '../../types/calendar';
import type { OverlayEvent } from '../../types/calendar';
import { TimeblockEvent, paletteForUser } from './TimeblockEvent';
import { ThreeDayView } from './ThreeDayView';

/** Extended view type that includes our custom 3-day view */
export type AppView = View | 'threeDay';

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ── Unified event type for react-big-calendar ─────────────────────────────────

export type CalendarEvent =
  | {
      id: string;
      title: string;
      start: Date;
      end: Date;
      allDay?: boolean;
      resource: { type: 'timeblock'; data: Timeblock };
    }
  | {
      id: string;
      title: string;
      start: Date;
      end: Date;
      allDay?: boolean;
      resource: { type: 'overlay'; color: string; feedLabel: string };
    };

interface CalendarViewProps {
  timeblocks: Timeblock[];
  overlayEvents?: OverlayEvent[];
  view: AppView;
  date: Date;
  onView: (view: AppView) => void;
  onNavigate: (date: Date) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onEditRequest: (timeblock: Timeblock) => void;
  overlayClickable?: boolean;
}

const MIN_TIME = new Date(1970, 1, 1, 7, 0, 0);
const MAX_TIME = new Date(1970, 1, 1, 18, 30, 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RBC_VIEWS: any = {
  month: true,
  week: true,
  day: true,
  threeDay: ThreeDayView,
};

export function CalendarView({
  timeblocks,
  overlayEvents = [],
  view,
  date,
  onView,
  onNavigate,
  onSelectSlot,
  onEditRequest,
  overlayClickable = true,
}: CalendarViewProps) {
  const [overlayDetail, setOverlayDetail] = useState<CalendarEvent | null>(
    null,
  );

  const events = useMemo<CalendarEvent[]>(
    () =>
      timeblocks.map((tb) => {
        const [sh, sm] = tb.startTime.split(':').map(Number);
        const [eh, em] = tb.endTime.split(':').map(Number);
        const [y, mo, d] = tb.date.split('-').map(Number);
        return {
          id: tb.id,
          title: tb.title,
          start: new Date(y!, mo! - 1, d!, sh!, sm!),
          end: new Date(y!, mo! - 1, d!, eh!, em!),
          resource: { type: 'timeblock' as const, data: tb },
        };
      }),
    [timeblocks],
  );

  const bgEvents = useMemo<CalendarEvent[]>(
    () =>
      overlayEvents
        .filter((ov) => !ov.allDay)
        .map((ov) => ({
          id: ov.id,
          title: ov.title,
          start: new Date(ov.start),
          end: new Date(ov.end),
          allDay: false,
          resource: {
            type: 'overlay' as const,
            color: ov.color,
            feedLabel: ov.feedLabel ?? '',
          },
        })),
    [overlayEvents],
  );

  const allDayOvEvents = useMemo<CalendarEvent[]>(
    () =>
      overlayEvents
        .filter((ov) => ov.allDay)
        .map((ov) => ({
          id: ov.id,
          title: ov.title,
          start: new Date(ov.start),
          end: new Date(ov.end),
          allDay: true,
          resource: {
            type: 'overlay' as const,
            color: ov.color,
            feedLabel: ov.feedLabel ?? '',
          },
        })),
    [overlayEvents],
  );

  const allEvents = useMemo(
    () => [...events, ...allDayOvEvents, ...bgEvents],
    [events, allDayOvEvents, bgEvents],
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    if (event.resource.type === 'overlay') {
      return {
        style: {
          backgroundColor: event.resource.color,
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '0.7rem',
          opacity: 0.9,
        },
      };
    }
    const { bg, border } = paletteForUser(event.resource.data.userId);
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `4px solid ${border}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '5px',
        color: '#fff',
        fontSize: '0.75rem',
        cursor: 'pointer',
        margin: '1px 3px 1px 0',
        padding: '2px 4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      },
    };
  }, []);

  const components = useMemo(
    () => ({
      event: (props: any) => {
        if (props.event.resource.type === 'overlay') {
          return (
            <span className="truncate text-xs leading-tight px-1">
              {props.event.title}
            </span>
          );
        }
        return <TimeblockEvent {...props} />;
      },
    }),
    [],
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (event.resource.type === 'overlay') {
        if (overlayClickable) setOverlayDetail(event);
        return;
      }
      onEditRequest(event.resource.data);
    },
    [onEditRequest, overlayClickable],
  );

  return (
    <div className="absolute inset-0 sm:relative sm:h-full flex flex-col overflow-hidden rounded-lg">
      {/* Overlay event detail popup */}
      {overlayDetail && overlayDetail.resource.type === 'overlay' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOverlayDetail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-80 p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="mt-1 w-3 h-3 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: overlayDetail.resource.color }}
              />
              <p className="flex-1 font-semibold text-gray-800 leading-snug">
                {overlayDetail.title}
              </p>
              <button
                onClick={() => setOverlayDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {overlayDetail.allDay ? (
                <p>
                  {format(overlayDetail.start, 'EEE d MMM yyyy', {
                    locale: fr,
                  })}
                </p>
              ) : (
                <p>
                  {format(overlayDetail.start, 'EEE d MMM yyyy', {
                    locale: fr,
                  })}
                  {' · '}
                  {format(overlayDetail.start, 'HH:mm', { locale: fr })}
                  {' → '}
                  {format(overlayDetail.end, 'HH:mm', { locale: fr })}
                </p>
              )}
              {overlayDetail.resource.feedLabel && (
                <p className="text-xs text-gray-400">
                  {overlayDetail.resource.feedLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <Calendar<CalendarEvent>
        localizer={localizer}
        culture="fr"
        events={allEvents}
        view={view as View}
        date={date}
        views={RBC_VIEWS}
        min={MIN_TIME}
        max={MAX_TIME}
        step={30}
        timeslots={2}
        onView={onView as (v: View) => void}
        onNavigate={onNavigate}
        onSelectSlot={onSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        components={components}
        style={{ height: '100%' }}
      />
    </div>
  );
}
