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

export default function NumberListEditor({ items, onChange, format, placeholder = 'Numero' }: Props) {
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
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((n, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-lg px-3 py-1.5 text-sm font-medium group"
            >
              {formatItem(n, format)}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
          className="input-field w-32"
        />
        <button
          type="button"
          onClick={add}
          className="btn-secondary"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
