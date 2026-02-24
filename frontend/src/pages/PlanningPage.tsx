import { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
         addWeeks, subWeeks, addMonths, subMonths, addDays, subDays } from 'date-fns';
import type { SlotInfo } from 'react-big-calendar';
import { useAuth } from '../context/AuthContext';
import { useSSE } from '../hooks/useSSE';
import {
  listTimeblocks, listFeeds, getFeedEvents,
} from '../services/calendarApi';
import { exportTimeblocksPdf } from '../services/exportPdf';
import { CalendarView, type AppView } from '../components/Calendar/CalendarView';
import { CalendarToolbar } from '../components/Calendar/CalendarToolbar';
import { TimeblockForm } from '../components/Calendar/TimeblockForm';
import { OverlaySettings } from '../components/Calendar/OverlaySettings';
import NavBar from '../components/NavBar';
import type { Timeblock } from '../types/calendar';
import type { OverlayEvent } from '../types/calendar';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function getDateRange(view: AppView, date: Date): { from: string; to: string } {
  if (view === 'month') {
    return {
      from: format(startOfMonth(date), 'yyyy-MM-dd'),
      to:   format(endOfMonth(date),   'yyyy-MM-dd'),
    };
  }
  if (view === 'day') {
    const d = format(date, 'yyyy-MM-dd');
    return { from: d, to: d };
  }
  if (view === 'threeDay') {
    return {
      from: format(date,             'yyyy-MM-dd'),
      to:   format(addDays(date, 2), 'yyyy-MM-dd'),
    };
  }
  // week
  return {
    from: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    to:   format(endOfWeek(date,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

/**
 * Snap a clicked slot time to the nearest 15-min boundary,
 * then clamp to the allowed window [07:30 – 17:45].
 */
function snapAndClampStart(d: Date): string {
  const totalMin = d.getHours() * 60 + d.getMinutes();
  const MIN_SLOT = 7 * 60 + 30;  // 07:30
  const MAX_SLOT = 17 * 60 + 45; // 17:45
  const floored  = Math.floor(totalMin / 15) * 15;
  const clamped  = Math.max(MIN_SLOT, Math.min(MAX_SLOT, floored));
  const rh = Math.floor(clamped / 60);
  const rm = clamped % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function PlanningPage() {
  const { token, user } = useAuth();

  const [view, setView]   = useState<AppView>('week');
  const [date, setDate]   = useState<Date>(new Date());
  const [timeblocks, setTimeblocks] = useState<Timeblock[]>([]);
  const [loading, setLoading] = useState(true);

  /* responsive view switching */
  useEffect(() => {
    function getBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
      const w = window.innerWidth;
      if (w < 640)  return 'mobile';
      if (w < 1024) return 'tablet';
      return 'desktop';
    }

    function adapt(bp: 'mobile' | 'tablet' | 'desktop') {
      setView(v => {
        if (bp === 'mobile')  return (v === 'week' || v === 'threeDay') ? 'day' : v;
        if (bp === 'tablet')  return v === 'week' ? 'threeDay' : v;
        return v === 'threeDay' ? 'week' : v;
      });
    }

    adapt(getBreakpoint());

    let timer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(timer);
      timer = setTimeout(() => adapt(getBreakpoint()), 150);
    }

    window.addEventListener('resize', onResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, []);

  /* overlay events */
  const [overlayEvents, setOverlayEvents] = useState<OverlayEvent[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('overlay_events_cache');
      if (cached) setOverlayEvents(JSON.parse(cached) as OverlayEvent[]);
    } catch { /* ignore */ }
  }, []);

  /* overlay clickable preference */
  const [overlayClickable, setOverlayClickable] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem('overlay_clickable');
    if (stored !== null) setOverlayClickable(stored !== 'false');
  }, []);
  function handleOverlayClickableChange(val: boolean) {
    setOverlayClickable(val);
    localStorage.setItem('overlay_clickable', String(val));
  }

  /* settings & form state */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTimeblock, setEditingTimeblock] = useState<Timeblock | undefined>(undefined);
  const [prefilledSlot, setPrefilledSlot] = useState<{ date: string; startTime: string } | undefined>(undefined);

  /* fetch timeblocks */
  const fetchTimeblocks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { from, to } = getDateRange(view, date);
      const data = await listTimeblocks(from, to);
      setTimeblocks(data);
    } catch (err) {
      console.error('Failed to load timeblocks', err);
    } finally {
      setLoading(false);
    }
  }, [token, view, date]);

  useEffect(() => { void fetchTimeblocks(); }, [fetchTimeblocks]);

  /* fetch overlay events */
  const fetchOverlays = useCallback(async () => {
    if (!token) return;
    try {
      const { from, to } = getDateRange(view, date);
      const feeds = await listFeeds();
      const enabled = feeds.filter(f => f.isEnabled);
      const nested = await Promise.all(
        enabled.map(f =>
          getFeedEvents(f.id, from, to)
            .then(evs => evs.map(ev => ({ ...ev, feedLabel: f.label })))
            .catch((err: Error) => {
              console.warn(`[overlays] fetch failed for feed ${f.id}:`, err.message);
              return [] as OverlayEvent[];
            }),
        ),
      );
      const evs = nested.flat();
      setOverlayEvents(evs);
      const anySucceeded = enabled.length === 0 || evs.length > 0;
      if (anySucceeded) {
        try { localStorage.setItem('overlay_events_cache', JSON.stringify(evs)); } catch { /* quota */ }
      }
    } catch (err) {
      console.warn('[overlays] Failed to load feeds:', (err as Error).message);
    }
  }, [token, view, date]);

  useEffect(() => { void fetchOverlays(); }, [fetchOverlays]);

  /* SSE real-time */
  useSSE(token ?? null, {
    onCreated: (tb) => setTimeblocks(prev =>
      prev.some(t => t.id === tb.id) ? prev : [...prev, tb],
    ),
    onUpdated: (tb) => setTimeblocks(prev =>
      prev.map(t => t.id === tb.id ? tb : t),
    ),
    onDeleted: (id) => setTimeblocks(prev =>
      prev.filter(t => t.id !== id),
    ),
  });

  /* navigation */
  const handlePrev = useCallback(() => {
    setDate(d =>
      view === 'month'    ? subMonths(d, 1) :
      view === 'day'      ? subDays(d, 1)   :
      view === 'threeDay' ? addDays(d, -3)  :
                            subWeeks(d, 1)
    );
  }, [view]);

  const handleNext = useCallback(() => {
    setDate(d =>
      view === 'month'    ? addMonths(d, 1) :
      view === 'day'      ? addDays(d, 1)   :
      view === 'threeDay' ? addDays(d, 3)   :
                            addWeeks(d, 1)
    );
  }, [view]);

  const handleNewEvent = useCallback(() => {
    setEditingTimeblock(undefined);
    setPrefilledSlot(undefined);
    setFormOpen(true);
  }, []);

  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    setEditingTimeblock(undefined);
    setPrefilledSlot({
      date:      format(slot.start, 'yyyy-MM-dd'),
      startTime: snapAndClampStart(slot.start),
    });
    setFormOpen(true);
  }, []);

  const handleEditRequest = useCallback((tb: Timeblock) => {
    setPrefilledSlot(undefined);
    setEditingTimeblock(tb);
    setFormOpen(true);
  }, []);

  if (!token || !user) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-50">
      <NavBar />
      <CalendarToolbar
        currentView={view}
        date={date}
        onViewChange={setView}
        onToday={() => setDate(new Date())}
        onPrev={handlePrev}
        onNext={handleNext}
        onSettingsOpen={() => setSettingsOpen(true)}
        onNewEvent={handleNewEvent}
        onExportPdf={() => {
          const { from, to } = getDateRange(view, date);
          exportTimeblocksPdf(timeblocks, from, to);
        }}
        onRefresh={() => {
          void fetchTimeblocks();
          void fetchOverlays();
        }}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden p-1 sm:p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Chargement…
          </div>
        ) : (
          <CalendarView
            timeblocks={timeblocks}
            overlayEvents={overlayEvents}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onSelectSlot={handleSelectSlot}
            onEditRequest={handleEditRequest}
            overlayClickable={overlayClickable}
          />
        )}
      </div>

      {formOpen && (
        <TimeblockForm
          currentUser={user}
          existing={editingTimeblock}
          prefilledSlot={prefilledSlot}
          onClose={() => setFormOpen(false)}
        />
      )}

      {settingsOpen && (
        <OverlaySettings
          onFeedsChanged={() => void fetchOverlays()}
          onClose={() => setSettingsOpen(false)}
          clickable={overlayClickable}
          onClickableChange={handleOverlayClickableChange}
        />
      )}
    </div>
  );
}
