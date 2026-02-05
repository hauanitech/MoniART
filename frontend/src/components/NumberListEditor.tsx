import { useState } from 'react';

interface Props {
  /** Array of numbers entered by user */
  items: number[];
  onChange: (items: number[]) => void;
  /** Display format, e.g. "BUPF{n}" or "Mat {n}" */
  format: string;
  placeholder?: string;
}

function formatItem(n: number, format: string): string {
  return format.replace('{n}', String(n));
}

export default function NumberListEditor({ items, onChange, format, placeholder = 'Numéro' }: Props) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const num = parseInt(draft.trim(), 10);
    if (!isNaN(num)) {
      onChange([...items, num]);
      setDraft('');
    }
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((n, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-sm font-medium"
            >
              {formatItem(n, format)}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="hover:text-red-500 ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="w-32 border rounded px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded font-medium hover:bg-indigo-200 transition"
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
