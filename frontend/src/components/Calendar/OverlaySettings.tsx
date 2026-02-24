import { useState, useEffect, type FormEvent } from 'react';
import type { OverlayFeed } from '../../types/calendar';
import {
  listFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
} from '../../services/calendarApi';
import { showToast } from '../Toast';
import ConfirmDialog from '../ConfirmDialog';

// ── Preset colour palette ─────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#ef4444', // red
  '#84cc16', // lime
];

interface OverlaySettingsProps {
  onFeedsChanged: () => void;
  onClose: () => void;
  clickable: boolean;
  onClickableChange: (val: boolean) => void;
}

export function OverlaySettings({
  onFeedsChanged,
  onClose,
  clickable,
  onClickableChange,
}: OverlaySettingsProps) {
  const [feeds, setFeeds] = useState<OverlayFeed[]>([]);
  const [loading, setLoading] = useState(true);

  // New-feed form state
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]!);
  const [creating, setCreating] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listFeeds()
      .then((f) => {
        if (!cancelled) setFeeds(f);
      })
      .catch((err: Error) =>
        showToast(err.message ?? 'Erreur de chargement', 'error'),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(feed: OverlayFeed) {
    try {
      const updated = await updateFeed(feed.id, {
        isEnabled: !feed.isEnabled,
      });
      setFeeds((prev) => prev.map((f) => (f.id === feed.id ? updated : f)));
      onFeedsChanged();
    } catch (err) {
      showToast((err as Error).message ?? 'Erreur', 'error');
    }
  }

  async function handleColorChange(feed: OverlayFeed, color: string) {
    try {
      const updated = await updateFeed(feed.id, { color });
      setFeeds((prev) => prev.map((f) => (f.id === feed.id ? updated : f)));
      onFeedsChanged();
    } catch (err) {
      showToast((err as Error).message ?? 'Erreur', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFeed(id);
      setFeeds((prev) => prev.filter((f) => f.id !== id));
      onFeedsChanged();
      showToast('Calendrier supprimé', 'success');
    } catch (err) {
      showToast((err as Error).message ?? 'Erreur', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newLabel || !newUrl) return;
    setCreating(true);
    try {
      const feed = await createFeed({
        label: newLabel,
        url: newUrl,
        color: newColor,
      });
      setFeeds((prev) => [...prev, feed]);
      onFeedsChanged();
      setNewLabel('');
      setNewUrl('');
      setNewColor(PRESET_COLORS[0]!);
      showToast('Calendrier ajouté', 'success');
    } catch (err) {
      showToast((err as Error).message ?? 'Erreur', 'error');
    } finally {
      setCreating(false);
    }
  }

  const canAdd = feeds.length < 3;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto
                      h-[92dvh] sm:h-full w-full sm:w-96
                      bg-white shadow-2xl flex flex-col
                      rounded-t-2xl sm:rounded-none"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            Calendriers personnels
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Existing feeds */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Mes calendriers ({feeds.length}/3)
            </h3>

            {loading ? (
              <p className="text-sm text-gray-400">Chargement…</p>
            ) : feeds.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Aucun calendrier ajouté.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {feeds.map((feed) => (
                  <li
                    key={feed.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => void handleToggle(feed)}
                      title={feed.isEnabled ? 'Désactiver' : 'Activer'}
                      className={`mt-0.5 flex-shrink-0 w-9 h-5 rounded-full transition-colors ${
                        feed.isEnabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
                          feed.isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${!feed.isEnabled ? 'text-gray-400' : 'text-gray-800'}`}
                      >
                        {feed.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {feed.url}
                      </p>

                      <div className="flex gap-1 mt-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => void handleColorChange(feed, c)}
                            title={c}
                            className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${
                              feed.color === c
                                ? 'border-gray-700 scale-110'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(feed.id)}
                      title="Supprimer ce calendrier"
                      className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add new feed */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Ajouter un calendrier
            </h3>

            {!canAdd ? (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                Maximum 3 calendriers atteint.
              </p>
            ) : (
              <form
                onSubmit={(e) => void handleCreate(e)}
                className="flex flex-col gap-3"
              >
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mon emploi du temps"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    URL iCal / ICS
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://calendar.google.com/…/basic.ics"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Couleur
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          newColor === c
                            ? 'border-gray-700 scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Ajout…' : 'Ajouter le calendrier'}
                </button>
              </form>
            )}
          </section>

          {/* Preferences */}
          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Préférences
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Détails au clic
                </p>
                <p className="text-xs text-gray-400">
                  Ouvrir une fiche en cliquant sur un événement
                </p>
              </div>
              <button
                type="button"
                onClick={() => onClickableChange(!clickable)}
                title={clickable ? 'Désactiver' : 'Activer'}
                className={`flex-shrink-0 w-9 h-5 rounded-full transition-colors ${
                  clickable ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
                    clickable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          <p className="text-xs text-gray-400 pt-2">
            Les événements de vos calendriers s'affichent sur la vue partagée.
            Seul vous pouvez les voir — ils ne sont pas modifiables.
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Supprimer le calendrier"
          message="Supprimer ce calendrier ? Les événements disparaîtront de votre vue."
          onConfirm={() => void handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </>
  );
}
