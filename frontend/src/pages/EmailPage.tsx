import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi, type PreparedEmail } from '../services/reportsApi';
import { openMailto } from '../services/mailto';
import { showToast } from '../components/Toast';

export default function EmailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<PreparedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addRecipient = () => {
    const email = recipientInput.trim();
    if (email && !recipients.includes(email)) {
      setRecipients((prev) => [...prev, email]);
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handlePrepare = async () => {
    if (!reportId) return;
    setError('');
    setLoading(true);
    try {
      const result = await reportsApi.prepareEmail(reportId, recipients.length > 0 ? recipients : undefined);
      setPrepared(result);
      if (result.invalidRecipients && result.invalidRecipients.length > 0) {
        showToast(`Adresses invalides : ${result.invalidRecipients.join(', ')}`, 'error');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de préparation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMailto = () => {
    if (!prepared) return;
    openMailto(prepared.to || [], prepared.subject, prepared.body);
    showToast('Client email ouvert !');
  };

  // Auto-prepare on mount
  useEffect(() => {
    if (reportId) {
      reportsApi.prepareEmail(reportId).then(setPrepared).catch(() => {});
    }
  }, [reportId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-700">Préparer l'email</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {/* Recipients */}
      <fieldset className="bg-white rounded-xl border p-4 space-y-3">
        <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Destinataires</legend>
        <div className="flex flex-wrap gap-2">
          {recipients.map((r) => (
            <span key={r} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs">
              {r}
              <button onClick={() => removeRecipient(r)} className="hover:text-red-500">✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
            placeholder="email@example.com"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button onClick={addRecipient} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded font-medium hover:bg-indigo-200">
            Ajouter
          </button>
        </div>
        {prepared?.invalidRecipients && prepared.invalidRecipients.length > 0 && (
          <p className="text-xs text-red-500">
            Adresses invalides ignorées : {prepared.invalidRecipients.join(', ')}
          </p>
        )}
      </fieldset>

      {/* Prepared preview */}
      {prepared && (
        <fieldset className="bg-white rounded-xl border p-4 space-y-3">
          <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Aperçu email</legend>
          <div>
            <p className="text-xs text-gray-400">Objet</p>
            <p className="text-sm font-medium text-gray-800">{prepared.subject}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Corps</p>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono mt-1 max-h-60 overflow-y-auto">
              {prepared.body}
            </pre>
          </div>
        </fieldset>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handlePrepare}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Préparation…' : '🔄 Préparer l\'email'}
        </button>
        {prepared && (
          <button
            onClick={handleOpenMailto}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            ✉ Ouvrir le client mail
          </button>
        )}
      </div>
    </div>
  );
}
