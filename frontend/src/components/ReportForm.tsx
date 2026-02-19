import { useState, useEffect } from 'react';
import RoomChecklistEditor from './RoomChecklistEditor';
import type { RoomConfig, RoomData } from './RoomChecklistEditor';
import type { RoomAvailabilityInfo } from './RoomChecklistEditor';
import NumberListEditor from './NumberListEditor';
import { fetchRoomAvailability } from '../services/roomsApi';

// Générer les créneaux de 30 min entre 7h30 et 18h00
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let hour = 7;
  let minute = 30;
  
  while (hour < 18 || (hour === 18 && minute === 0)) {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    slots.push(`${h}h${m}`);
    
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

interface SimpleListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function SimpleListEditor({ items, onChange, placeholder = 'Ajouter un element' }: SimpleListEditorProps) {
  const [draft, setDraft] = useState('');
  const add = () => {
    if (draft.trim()) {
      onChange([...items, draft.trim()]);
      setDraft('');
    }
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm group">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-400 flex-shrink-0" />
              <span className="flex-1 text-surface-700">{item}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-opacity p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="btn-secondary px-3"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

interface TimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  // Parse existing value like "07h30 - 08h00" into start and end
  const parseValue = (val: string): { start: string; end: string } => {
    if (!val) return { start: '', end: '' };
    const parts = val.split(' - ');
    return { start: parts[0] || '', end: parts[1] || '' };
  };

  const { start, end } = parseValue(value);

  const handleChange = (field: 'start' | 'end', newVal: string) => {
    const current = parseValue(value);
    if (field === 'start') {
      if (newVal && current.end) {
        onChange(`${newVal} - ${current.end}`);
      } else if (newVal) {
        onChange(newVal);
      } else {
        onChange('');
      }
    } else {
      if (current.start && newVal) {
        onChange(`${current.start} - ${newVal}`);
      } else if (current.start) {
        onChange(current.start);
      } else {
        onChange('');
      }
    }
  };

  // Filtrer les heures de fin pour qu'elles soient après l'heure de début
  const endSlots = start
    ? TIME_SLOTS.filter((slot) => slot > start)
    : TIME_SLOTS;

  return (
    <div className="flex items-center gap-2">
      <select
        value={start}
        onChange={(e) => handleChange('start', e.target.value)}
        className="input-field flex-1"
      >
        <option value="">Début</option>
        {TIME_SLOTS.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      <span className="text-surface-500">-</span>
      <select
        value={end}
        onChange={(e) => handleChange('end', e.target.value)}
        className="input-field flex-1"
        disabled={!start}
      >
        <option value="">Fin</option>
        {endSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SectionDef {
  key: string;
  label: string;
  kind: 'text' | 'list' | 'number' | 'numberList' | 'roomChecklist';
  required: boolean;
  format?: string;
  roomConfig?: RoomConfig;
}

interface Props {
  sections: SectionDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  metadata: { reportDate: string; shiftLabel: string; authorName: string };
  onMetadataChange: (field: string, value: string) => void;
  reportType: 'SALLES_B' | 'BU';
}

export default function ReportForm({
  sections,
  values,
  onChange,
  metadata,
  onMetadataChange,
}: Props) {
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailabilityInfo[]>([]);

  // Fetch room availability if any section uses roomChecklist
  const hasRoomSection = sections.some((s) => s.kind === 'roomChecklist');
  useEffect(() => {
    if (!hasRoomSection) return;
    fetchRoomAvailability()
      .then((data) => setRoomAvailability(data))
      .catch(() => { /* silently ignore — badges just won't show */ });
  }, [hasRoomSection]);

  const renderSectionEditor = (sec: SectionDef) => {
    switch (sec.kind) {
      case 'text':
        return (
          <textarea
            value={(values[sec.key] as string) || ''}
            onChange={(e) => onChange(sec.key, e.target.value)}
            placeholder={`Saisissez ${sec.label.toLowerCase()}...`}
            className="input-field min-h-[100px] resize-y"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={(values[sec.key] as number) ?? ''}
            onChange={(e) => onChange(sec.key, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            className="input-field w-32"
            min={0}
          />
        );
      case 'numberList':
        return (
          <NumberListEditor
            items={(values[sec.key] as number[]) || []}
            onChange={(items) => onChange(sec.key, items)}
            format={sec.format || '{n}'}
          />
        );
      case 'roomChecklist':
        return sec.roomConfig ? (
          <RoomChecklistEditor
            config={sec.roomConfig}
            value={(values[sec.key] as Record<string, RoomData>) || {}}
            onChange={(val) => onChange(sec.key, val)}
            availability={roomAvailability}
          />
        ) : null;
      case 'list':
        return (
          <SimpleListEditor
            items={(values[sec.key] as string[]) || []}
            onChange={(items) => onChange(sec.key, items)}
            placeholder={`Ajouter - ${sec.label}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Informations generales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Date du rapport <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={metadata.reportDate}
              onChange={(e) => onMetadataChange('reportDate', e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Créneau horaire
            </label>
            <TimeSlotPicker
              value={metadata.shiftLabel}
              onChange={(val) => onMetadataChange('shiftLabel', val)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Moniteur
            </label>
            <input
              value={metadata.authorName}
              onChange={(e) => onMetadataChange('authorName', e.target.value)}
              placeholder="Nom (optionnel)"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.key} className="card p-5">
          <h2 className="section-title mb-4">
            {sec.label}
            {sec.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {renderSectionEditor(sec)}
        </div>
      ))}
    </div>
  );
}

export type { SectionDef };
