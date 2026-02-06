import { copyToClipboard } from '../services/clipboard';
import { showToast } from './Toast';

interface Props {
  text: string;
  sectionsText: Record<string, string>;
}

export default function ReportPreview({ text, sectionsText }: Props) {
  const handleCopyAll = async () => {
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Rapport copie dans le presse-papiers' : 'Echec de la copie', ok ? 'success' : 'error');
  };

  const handleCopySection = async (label: string, content: string) => {
    const ok = await copyToClipboard(content);
    showToast(ok ? `Section "${label}" copiee` : 'Echec de la copie', ok ? 'success' : 'error');
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="section-title">Apercu du rapport</h3>
        <button
          onClick={handleCopyAll}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier tout
        </button>
      </div>

      <div className="bg-surface-50 rounded-lg border border-surface-200 p-4 overflow-x-auto">
        <pre className="whitespace-pre-wrap text-sm text-surface-800 font-mono leading-relaxed">
          {text}
        </pre>
      </div>

      {Object.keys(sectionsText).length > 0 && (
        <div className="border-t border-surface-200 pt-4 space-y-3">
          <h4 className="text-xs text-surface-400 uppercase tracking-wide font-medium">
            Copier une section
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sectionsText).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleCopySection(key, val)}
                className="px-3 py-1.5 text-xs bg-surface-100 text-surface-600 rounded-lg hover:bg-surface-200 transition-colors font-medium"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
