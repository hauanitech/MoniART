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

interface Props {
  config: RoomConfig;
  value: Record<string, RoomData>;
  onChange: (value: Record<string, RoomData>) => void;
}

const emptyRoom = (config: RoomConfig): RoomData => ({
  visited: false,
  checks: Object.fromEntries(config.checkItems.map((ci) => [ci.key, ci.inputType === 'number' ? 0 : false])),
  notes: '',
});

export default function RoomChecklistEditor({ config, value, onChange }: Props) {
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
    <div className="space-y-3">
      {/* Room picker */}
      <div className="flex flex-wrap gap-2">
        {config.rooms.map((name) => {
          const room = getRoom(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleVisited(name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                room.visited
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {room.visited ? '✓ ' : ''}{name}
            </button>
          );
        })}
      </div>

      {/* Per-room checklist */}
      {config.rooms.map((name) => {
        const room = getRoom(name);
        if (!room.visited) return null;
        return (
          <div key={name} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-semibold text-indigo-700">{name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.checkItems.map((ci) =>
                ci.inputType === 'number' ? (
                  <div key={ci.key} className="flex items-center gap-2 text-sm">
                    <label className="flex-1 text-gray-600">{ci.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={(room.checks[ci.key] as number) || 0}
                      onChange={(e) => updateCheckNumber(name, ci.key, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 border rounded px-2 py-1 text-sm text-center"
                    />
                  </div>
                ) : (
                  <label key={ci.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!room.checks[ci.key]}
                      onChange={() => toggleCheck(name, ci.key)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={room.checks[ci.key] ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {ci.label}
                    </span>
                  </label>
                )
              )}
            </div>
            <input
              placeholder="Notes supplémentaires…"
              value={room.notes}
              onChange={(e) => updateNotes(name, e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

export type { RoomConfig, RoomData };
