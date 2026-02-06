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
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 uppercase tracking-wide">
              Incident {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-surface-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Heure (optionnel)"
              value={item.time}
              onChange={(e) => update(idx, 'time', e.target.value)}
              className="input-field"
            />
            <input
              placeholder={`${locationLabel} (optionnel)`}
              value={item.location}
              onChange={(e) => update(idx, 'location', e.target.value)}
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Description *"
            value={item.description}
            onChange={(e) => update(idx, 'description', e.target.value)}
            className="input-field min-h-[80px] resize-y"
          />
          <input
            placeholder="Action prise (optionnel)"
            value={item.actionTaken}
            onChange={(e) => update(idx, 'actionTaken', e.target.value)}
            className="input-field"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un incident
      </button>
    </div>
  );
}

export type { IncidentItem };
