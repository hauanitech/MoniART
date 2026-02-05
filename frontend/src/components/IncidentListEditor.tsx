interface IncidentItem {
  time: string;
  location: string;
  description: string;
  actionTaken: string;
}

interface Props {
  items: IncidentItem[];
  onChange: (items: IncidentItem[]) => void;
  locationLabel?: string;
}

const empty = (): IncidentItem => ({ time: '', location: '', description: '', actionTaken: '' });

export default function IncidentListEditor({ items, onChange, locationLabel = 'Lieu' }: Props) {
  const add = () => onChange([...items, empty()]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, field: keyof IncidentItem, value: string) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-400 font-mono">#{idx + 1}</span>
            <button type="button" onClick={() => remove(idx)} className="ml-auto text-red-400 hover:text-red-600 text-sm">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              placeholder="Heure (opt.)"
              value={item.time}
              onChange={(e) => update(idx, 'time', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              placeholder={`${locationLabel} (opt.)`}
              value={item.location}
              onChange={(e) => update(idx, 'location', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <textarea
            placeholder="Description *"
            value={item.description}
            onChange={(e) => update(idx, 'description', e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
            rows={2}
          />
          <input
            placeholder="Action prise (opt.)"
            value={item.actionTaken}
            onChange={(e) => update(idx, 'actionTaken', e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + Ajouter un incident
      </button>
    </div>
  );
}

export type { IncidentItem };
