interface CheckItem {
  key: string;
  label: string;
  inputType?: 'boolean' | 'number';
}

interface RoomConfig {
  rooms: string[];
  checkItems: CheckItem[];
}

interface RoomData {
  visited: boolean;
  checks: Record<string, boolean | number>;
  notes: string;
}

export interface RoomAvailabilityInfo {
  room: string;
  status: 'free' | 'occupied' | 'unknown';
  currentEvent?: string;
  nextFree?: { start: string; end: string };
}

interface Props {
  config: RoomConfig;
  value: Record<string, RoomData>;
  onChange: (value: Record<string, RoomData>) => void;
  availability?: RoomAvailabilityInfo[];
}

const emptyRoom = (config: RoomConfig): RoomData => ({
  visited: false,
  checks: Object.fromEntries(config.checkItems.map((ci) => [ci.key, ci.inputType === 'number' ? 0 : false])),
  notes: '',
});

export default function RoomChecklistEditor({ config, value, onChange, availability }: Props) {
  const getAvailability = (name: string): RoomAvailabilityInfo | undefined =>
    availability?.find((a) => a.room === name);
  const getRoom = (name: string): RoomData => value[name] || emptyRoom(config);

  const toggleVisited = (name: string) => {
    const room = getRoom(name);
    onChange({ ...value, [name]: { ...room, visited: !room.visited } });
  };

  const toggleCheck = (roomName: string, checkKey: string) => {
    const room = getRoom(roomName);
    onChange({
      ...value,
      [roomName]: {
        ...room,
        checks: { ...room.checks, [checkKey]: !room.checks[checkKey] },
      },
    });
  };

  const updateCheckNumber = (roomName: string, checkKey: string, num: number) => {
    const room = getRoom(roomName);
    onChange({
      ...value,
      [roomName]: {
        ...room,
        checks: { ...room.checks, [checkKey]: num },
      },
    });
  };

  const updateNotes = (roomName: string, notes: string) => {
    const room = getRoom(roomName);
    onChange({ ...value, [roomName]: { ...room, notes } });
  };

  return (
    <div className="space-y-4">
      {/* Room picker */}
      <div className="flex flex-wrap gap-2">
        {config.rooms.map((name) => {
          const room = getRoom(name);
          const avail = getAvailability(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleVisited(name)}
              title={
                avail
                  ? avail.status === 'free'
                    ? `${name} — Libre`
                    : avail.status === 'occupied'
                      ? `${name} — Occupée${avail.currentEvent ? ` (${avail.currentEvent})` : ''}${avail.nextFree ? ` · Libre à ${avail.nextFree.start}` : ''}`
                      : `${name} — Disponibilité inconnue`
                  : undefined
              }
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                room.visited
                  ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                  : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {room.visited && (
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {name}
              {avail && (
                <span
                  className={`inline-block w-2 h-2 rounded-full ml-2 -mt-0.5 ${
                    avail.status === 'free'
                      ? 'bg-green-400'
                      : avail.status === 'occupied'
                        ? 'bg-red-400'
                        : 'bg-surface-300'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Per-room checklist */}
      {config.rooms.map((name) => {
        const room = getRoom(name);
        if (!room.visited) return null;
        return (
          <div key={name} className="bg-surface-50 border border-surface-200 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-semibold text-primary-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              {name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.checkItems.map((ci) =>
                ci.inputType === 'number' ? (
                  <div key={ci.key} className="flex items-center justify-between gap-3 text-sm">
                    <label className="text-surface-600">{ci.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={(room.checks[ci.key] as number) || 0}
                      onChange={(e) => updateCheckNumber(name, ci.key, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 input-field text-center"
                    />
                  </div>
                ) : (
                  <label key={ci.key} className="flex items-center gap-3 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!room.checks[ci.key]}
                      onChange={() => toggleCheck(name, ci.key)}
                      className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className={`transition-colors ${
                      room.checks[ci.key] ? 'text-red-600 font-medium' : 'text-surface-600 group-hover:text-surface-800'
                    }`}>
                      {ci.label}
                    </span>
                  </label>
                )
              )}
            </div>
            <input
              placeholder="Notes supplementaires..."
              value={room.notes}
              onChange={(e) => updateNotes(name, e.target.value)}
              className="input-field"
            />
          </div>
        );
      })}
    </div>
  );
}

export type { RoomConfig, RoomData };
