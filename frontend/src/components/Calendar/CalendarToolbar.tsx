import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AppView } from './CalendarView';

interface CalendarToolbarProps {
  currentView: AppView;
  date: Date;
  onViewChange: (view: AppView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSettingsOpen: () => void;
  onNewEvent: () => void;
  onExportPdf?: () => void;
  onRefresh?: () => void;
}

// ── Per-breakpoint view sets ──────────────────────────────────────────────────
const DESKTOP_VIEWS: { label: string; value: AppView }[] = [
  { label: 'Semaine', value: 'week' },
  { label: 'Jour', value: 'day' },
  { label: 'Mois', value: 'month' },
];

const TABLET_VIEWS: { label: string; value: AppView }[] = [
  { label: 'Jour', value: 'day' },
  { label: '3 jours', value: 'threeDay' },
  { label: 'Mois', value: 'month' },
];

const MOBILE_VIEWS: { label: string; short: string; value: AppView }[] = [
  { label: 'Jour', short: 'Jour', value: 'day' },
  { label: 'Mois', short: 'Mois', value: 'month' },
];

/** Human-readable label for the currently visible period */
function getPeriodLabel(view: AppView, date: Date): string {
  if (view === 'month') {
    return format(date, 'MMMM yyyy', { locale: fr });
  }
  if (view === 'day') {
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  }
  if (view === 'threeDay') {
    const end = addDays(date, 2);
    return `${format(date, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
  }
  // week
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${format(start, 'd')} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
  }
  return `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
}

export function CalendarToolbar({
  currentView,
  date,
  onViewChange,
  onToday,
  onPrev,
  onNext,
  onSettingsOpen,
  onNewEvent,
  onExportPdf,
  onRefresh,
}: CalendarToolbarProps) {
  const periodLabel = getPeriodLabel(currentView, date);

  function NavControls({ compact = false }: { compact?: boolean }) {
    return (
      <div className={`flex items-center gap-1 ${compact ? '' : 'gap-2'}`}>
        <button
          onClick={onPrev}
          aria-label="Période précédente"
          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span
          className={`font-semibold text-gray-800 text-center select-none capitalize ${
            compact ? 'text-xs min-w-[120px]' : 'text-sm min-w-[160px]'
          }`}
        >
          {periodLabel}
        </span>

        <button
          onClick={onNext}
          aria-label="Période suivante"
          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          onClick={onToday}
          className={`rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          }`}
        >
          Aujourd&apos;hui
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 bg-white border-b border-gray-200 shadow-sm rounded-t-lg">
      {/* ── Primary row ── */}
      <div className="flex items-center justify-between px-4 py-2 gap-2">
        {/* Center: navigation – desktop only */}
        <div className="hidden sm:flex items-center gap-3">
          <NavControls />

          {/* View selector — tablet (sm–lg) */}
          <div className="flex sm:flex lg:hidden rounded-lg border border-gray-300 overflow-hidden">
            {TABLET_VIEWS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onViewChange(value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View selector — desktop (lg+) */}
          <div className="hidden lg:flex rounded-lg border border-gray-300 overflow-hidden">
            {DESKTOP_VIEWS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onViewChange(value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 text-sm ml-auto">
          {/* Export PDF */}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              title="Exporter en PDF"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-600 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span className="hidden md:inline">PDF</span>
            </button>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Rafraîchir"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-600 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
              </svg>
            </button>
          )}

          {/* New event */}
          <button
            onClick={onNewEvent}
            title="Nouvel événement"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden xs:inline sm:inline">Nouveau</span>
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsOpen}
            title="Calendriers personnels"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-500 hover:text-indigo-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile-only second row ── */}
      <div
        className="sm:hidden flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 bg-gray-50 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <NavControls compact />

        {/* Export PDF (mobile) */}
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            title="Exporter en PDF"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            PDF
          </button>
        )}

        {/* Refresh (mobile) */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Rafraîchir"
            className="inline-flex items-center px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-600 text-xs hover:bg-gray-50 transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
          </button>
        )}

        {/* View switcher — mobile */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
          {MOBILE_VIEWS.map(({ short, value }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                currentView === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              }`}
            >
              {short}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
