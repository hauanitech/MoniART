interface Props {
  onSelect: (type: 'SALLES_B' | 'BU') => void;
}

const options = [
  { type: 'SALLES_B' as const, label: 'Salles en B', icon: '🏢' },
  { type: 'BU' as const, label: 'BU', icon: '📚' },
];

export default function ReportTypePicker({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-xl font-semibold text-gray-700">Choisir le type de rapport</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        {options.map((o) => (
          <button
            key={o.type}
            onClick={() => onSelect(o.type)}
            className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 hover:border-indigo-400 transition text-lg font-medium"
          >
            <span className="text-2xl">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
