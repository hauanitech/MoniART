import { copyToClipboard } from '../services/clipboard';
import { showToast } from './Toast';

interface Props {
  text: string;
  sectionsText: Record<string, string>;
}

export default function ReportPreview({ text, sectionsText }: Props) {
  const handleCopyAll = async () => {
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Rapport copié !' : 'Échec de la copie', ok ? 'success' : 'error');
  };

  const handleCopySection = async (label: string, content: string) => {
    const ok = await copyToClipboard(content);
    showToast(ok ? `Section "${label}" copiée !` : 'Échec de la copie', ok ? 'success' : 'error');
  };

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Aperçu du rapport</h3>
        <button
          onClick={handleCopyAll}
          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 transition"
        >
          📋 Copier tout
        </button>
      </div>

      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
        {text}
      </pre>

      {Object.keys(sectionsText).length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide">Copier une section</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sectionsText).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleCopySection(key, val)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
              >
                📋 {key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
