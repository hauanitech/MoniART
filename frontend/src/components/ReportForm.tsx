import { useState } from 'react';

interface SimpleListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function SimpleListEditor({ items, onChange, placeholder = 'Ajouter un élément' }: SimpleListEditorProps) {
  const [draft, setDraft] = useState('');
  const add = () => {
    if (draft.trim()) {
      onChange([...items, draft.trim()]);
      setDraft('');
    }
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="flex-1">• {item}</span>
          <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button type="button" onClick={add} className="text-sm text-indigo-600 font-medium">+</button>
      </div>
    </div>
  );
}

interface SectionDef {
  key: string;
  label: string;
  kind: 'text' | 'list';
  required: boolean;
}

interface Props {
  sections: SectionDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  metadata: { reportDate: string; shiftLabel: string; authorName: string };
  onMetadataChange: (field: string, value: string) => void;
  reportType: 'SALLES_B' | 'BU';
  incidentEditor: React.ReactNode;
}

export default function ReportForm({
  sections,
  values,
  onChange,
  metadata,
  onMetadataChange,
  incidentEditor,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Metadata */}
      <fieldset className="bg-white rounded-xl border p-4 space-y-3">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Métadonnées</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date du rapport *</label>
            <input
              type="date"
              value={metadata.reportDate}
              onChange={(e) => onMetadataChange('reportDate', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Créneau</label>
            <input
              value={metadata.shiftLabel}
              onChange={(e) => onMetadataChange('shiftLabel', e.target.value)}
              placeholder="ex. Matin"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Moniteur</label>
            <input
              value={metadata.authorName}
              onChange={(e) => onMetadataChange('authorName', e.target.value)}
              placeholder="Nom (optionnel)"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Sections */}
      {sections.map((sec) => (
        <fieldset key={sec.key} className="bg-white rounded-xl border p-4 space-y-2">
          <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {sec.label} {sec.required && <span className="text-red-400">*</span>}
          </legend>

          {sec.key === 'incidents' ? (
            incidentEditor
          ) : sec.kind === 'text' ? (
            <textarea
              value={(values[sec.key] as string) || ''}
              onChange={(e) => onChange(sec.key, e.target.value)}
              placeholder={sec.label}
              className="w-full border rounded px-2 py-2 text-sm min-h-[80px]"
            />
          ) : (
            <SimpleListEditor
              items={(values[sec.key] as string[]) || []}
              onChange={(items) => onChange(sec.key, items)}
              placeholder={`Ajouter — ${sec.label}`}
            />
          )}
        </fieldset>
      ))}
    </div>
  );
}

export type { SectionDef };
