import { useState, useEffect, useCallback } from 'react';
import { fetchRoomAvailability, type RoomAvailability } from '../services/roomsApi';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

function StatusBadge({ status }: { status: RoomAvailability['status'] }) {
  switch (status) {
    case 'free':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Libre
        </span>
      );
    case 'occupied':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Occupée
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-500">
          <span className="w-2 h-2 rounded-full bg-surface-400" />
          Inconnu
        </span>
      );
  }
}

function RoomCard({ room }: { room: RoomAvailability }) {
  const borderColor =
    room.status === 'free'
      ? 'border-green-200 bg-green-50/30'
      : room.status === 'occupied'
        ? 'border-red-200 bg-red-50/30'
        : 'border-surface-200 bg-surface-50/30';

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-surface-900">{room.room}</h3>
        <StatusBadge status={room.status} />
      </div>

      {/* Current event if occupied */}
      {room.status === 'occupied' && room.currentEvent && (
        <div className="mb-3 px-3 py-2 bg-red-50 rounded-lg">
          <p className="text-xs font-medium text-red-600 mb-0.5">En cours</p>
          <p className="text-sm text-red-800 truncate">{room.currentEvent}</p>
        </div>
      )}

      {/* Next free slot if occupied */}
      {room.status === 'occupied' && room.nextFree && (
        <div className="mb-3 px-3 py-2 bg-amber-50 rounded-lg">
          <p className="text-xs font-medium text-amber-600 mb-0.5">Prochaine dispo</p>
          <p className="text-sm text-amber-800">
            {room.nextFree.start} → {room.nextFree.end}
          </p>
        </div>
      )}

      {room.status === 'occupied' && !room.nextFree && (
        <div className="mb-3 px-3 py-2 bg-surface-50 rounded-lg">
          <p className="text-xs text-surface-500">Plus de disponibilité aujourd'hui</p>
        </div>
      )}

      {/* Free slots */}
      {room.freeSlots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 mb-1.5">Créneaux libres</p>
          <div className="flex flex-wrap gap-1.5">
            {room.freeSlots.map((slot, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"
              >
                {slot.start} – {slot.end}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Occupied slots */}
      {room.occupiedSlots.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-surface-500 mb-1.5">Cours</p>
          <div className="space-y-1">
            {room.occupiedSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-red-600 font-medium whitespace-nowrap">
                  {slot.start} – {slot.end}
                </span>
                {slot.summary && (
                  <span className="text-surface-500 truncate">{slot.summary}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unknown status message */}
      {room.status === 'unknown' && (
        <p className="text-xs text-surface-400 italic">
          Aucune donnée de calendrier disponible pour cette salle.
        </p>
      )}
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const data = await fetchRoomAvailability();
      setRooms(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  const freeCount = rooms.filter((r) => r.status === 'free').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Disponibilité des salles</h1>
          <p className="text-sm text-surface-500 mt-1">
            Bâtiment B · Plage 07h30 – 20h00
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-surface-400">
              Mis à jour à{' '}
              {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {!loading && !error && rooms.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            {freeCount} libre{freeCount > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            {occupiedCount} occupée{occupiedCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-surface-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement des disponibilités...
          </div>
        </div>
      )}

      {/* Room grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.room} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
