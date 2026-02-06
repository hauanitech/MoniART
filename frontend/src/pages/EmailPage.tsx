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
      setError(e.message || 'Erreur de preparation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMailto = () => {
    if (!prepared) return;
    openMailto(prepared.to || [], prepared.subject, prepared.body);
    showToast('Client email ouvert');
  };

  // Auto-prepare on mount
  useEffect(() => {
    if (reportId) {
      reportsApi.prepareEmail(reportId).then(setPrepared).catch(() => {});
    }
  }, [reportId]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Preparer l'email</h1>
          <p className="text-sm text-surface-500 mt-1">Configurez les destinataires et envoyez le rapport</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost self-start sm:self-auto">
          <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Recipients */}
      <div className="card p-5 space-y-4">
        <h2 className="section-title">Destinataires</h2>
        
        {recipients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
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
            type="email"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
            placeholder="email@example.com"
            className="input-field flex-1"
          />
          <button onClick={addRecipient} className="btn-secondary">
            Ajouter
          </button>
        </div>

        {prepared?.invalidRecipients && prepared.invalidRecipients.length > 0 && (
          <p className="text-xs text-red-500">
            Adresses invalides ignorees : {prepared.invalidRecipients.join(', ')}
          </p>
        )}
      </div>

      {/* Prepared preview */}
      {prepared && (
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Apercu de l'email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">
                Objet
              </label>
              <p className="text-sm font-medium text-surface-900">{prepared.subject}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">
                Corps du message
              </label>
              <div className="bg-surface-50 rounded-lg border border-surface-200 p-4 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-surface-700 font-mono">
                  {prepared.body}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handlePrepare}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 mr-2 inline-block animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Preparation...
            </>
          ) : (
            'Actualiser l\'apercu'
          )}
        </button>
        {prepared && (
          <button
            onClick={handleOpenMailto}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Ouvrir le client mail
          </button>
        )}
      </div>
    </div>
  );
}
