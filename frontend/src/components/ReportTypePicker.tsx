interface Props {
  onSelect: (type: 'SALLES_B' | 'BU') => void;
}

const options = [
  {
    type: 'SALLES_B' as const,
    label: 'Salles en B',
    description: 'Rapport pour les salles en sous-sol',
  },
  {
    type: 'BU' as const,
    label: 'BU',
    description: 'Rapport pour la bibliotheque universitaire',
  },
];

export default function ReportTypePicker({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-surface-900 mb-2">
          Nouveau rapport
        </h1>
        <p className="text-surface-500">
          Selectionnez le type de rapport a creer
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {options.map((o) => (
          <button
            key={o.type}
            onClick={() => onSelect(o.type)}
            className="group card p-6 text-left hover:border-primary-300 hover:shadow-soft-lg transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">
                  {o.label}
                </h3>
                <p className="text-sm text-surface-500 mt-1">
                  {o.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
