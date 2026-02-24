import { useState, type FormEvent } from 'react';
import type { UserSummary } from '../../context/AuthContext';
import type { Timeblock, CreateTimeblockRequest } from '../../types/calendar';
import {
  createTimeblock,
  updateTimeblock,
  deleteTimeblock,
} from '../../services/calendarApi';
import ConfirmDialog from '../ConfirmDialog';
import { showToast } from '../Toast';

type Location = 'B2-1' | 'BU';

/** Convert "HH:MM" to total minutes */
function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Generate every slot from fromH:fromM to toH:toM inclusive, stepping by stepMin */
function generateSlots(
  fromH: number,
  fromM: number,
  toH: number,
  toM: number,
  stepMin: number,
): string[] {
  const slots: string[] = [];
  let minutes = fromH * 60 + fromM;
  const end = toH * 60 + toM;
  while (minutes <= end) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    minutes += stepMin;
  }
  return slots;
}

/** 07:30 → 18:00 in 15-min steps */
const ALL_SLOTS = generateSlots(7, 30, 18, 0, 15);
/** Valid start times: 07:30 → 17:45 */
const START_SLOTS = ALL_SLOTS.slice(0, -1);

interface TimeblockFormProps {
  currentUser: UserSummary;
  existing?: Timeblock;
  prefilledSlot?: { date: string; startTime: string };
  onClose: () => void;
}

export function TimeblockForm({
  currentUser,
  existing,
  prefilledSlot,
  onClose,
}: TimeblockFormProps) {
  const isEdit = !!existing;

  const [date, setDate] = useState(
    existing?.date ?? prefilledSlot?.date ?? '',
  );
  const [startTime, setStartTime] = useState(
    existing?.startTime ?? prefilledSlot?.startTime ?? '07:30',
  );
  const [endTime, setEndTime] = useState(() => {
    if (existing?.endTime) return existing.endTime;
    const start = existing?.startTime ?? prefilledSlot?.startTime ?? '07:30';
    const firstValid =
      ALL_SLOTS.find((s) => toMin(s) >= toMin(start) + 60) ??
      ALL_SLOTS.find((s) => toMin(s) > toMin(start)) ??
      '18:00';
    return firstValid;
  });
  const [location, setLocation] = useState<Location>(
    existing?.location ?? 'B2-1',
  );
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const autoTitle = `${currentUser.name} - ${location}`;

  function handleStartChange(val: string) {
    setStartTime(val);
    if (toMin(endTime) <= toMin(val)) {
      const firstValid = ALL_SLOTS.find((s) => toMin(s) > toMin(val));
      if (firstValid) setEndTime(firstValid);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (toMin(endTime) <= toMin(startTime)) {
      showToast("L'heure de fin doit être après l'heure de début", 'error');
      return;
    }
    setLoading(true);
    try {
      const req: CreateTimeblockRequest = { date, startTime, endTime, location };
      if (isEdit && existing) {
        await updateTimeblock(existing.id, req);
        showToast('Créneau mis à jour', 'success');
      } else {
        await createTimeblock(req);
        showToast('Créneau créé', 'success');
      }
      onClose();
    } catch (err) {
      showToast((err as Error).message ?? 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    setLoading(true);
    try {
      await deleteTimeblock(existing.id);
      showToast('Créneau supprimé', 'success');
      onClose();
    } catch (err) {
      showToast((err as Error).message ?? 'Échec de la suppression', 'error');
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer — bottom sheet on mobile, right sidebar on sm+ */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto
                      h-[92dvh] sm:h-full w-full sm:w-96
                      bg-white shadow-2xl flex flex-col
                      rounded-t-2xl sm:rounded-none
                      transition-transform duration-300"
      >
        {/* Handle bar (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              {isEdit ? 'Modifier le créneau' : 'Nouveau créneau'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{currentUser.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
        >
          {/* Auto-title preview */}
          <div className="px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800 font-medium">
            {autoTitle}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Début
              </label>
              <select
                required
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              >
                {START_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fin
              </label>
              <select
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              >
                {ALL_SLOTS.filter((s) => toMin(s) > toMin(startTime)).map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Salle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['B2-1', 'BU'] as Location[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    location === loc
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading
                ? 'Enregistrement…'
                : isEdit
                  ? 'Mettre à jour'
                  : 'Créer le créneau'}
            </button>
            {isEdit && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border-2 border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer le créneau"
          message="Voulez-vous supprimer ce créneau ? Cette action est irréversible."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
