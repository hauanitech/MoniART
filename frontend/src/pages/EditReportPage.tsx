import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportForm from '../components/ReportForm';
import type { SectionDef } from '../components/ReportForm';
import ReportPreview from '../components/ReportPreview';
import { reportsApi, type Report, type ReportTemplate, type RenderedReport } from '../services/reportsApi';
import { showToast } from '../components/Toast';

export default function EditReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [metadata, setMetadata] = useState({ reportDate: '', shiftLabel: '', authorName: '' });
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [preview, setPreview] = useState<RenderedReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reportId) return;
    Promise.all([reportsApi.get(reportId), reportsApi.getTemplates()])
      .then(([r, t]) => {
        setReport(r);
        setTemplates(t);
        setMetadata({
          reportDate: r.metadata.reportDate || '',
          shiftLabel: r.metadata.shiftLabel || '',
          authorName: r.metadata.authorName || '',
        });
        setSections(r.sections || {});
      })
      .catch(() => setError('Rapport introuvable'))
      .finally(() => setLoading(false));
  }, [reportId]);

  const currentTemplate = templates.find((t) => t.type === report?.type);

  const handleSave = async () => {
    if (!reportId) return;
    setError('');
    setSaving(true);
    try {
      await reportsApi.update(reportId, { metadata, sections });
      const rendered = await reportsApi.render(reportId);
      setPreview(rendered);
      showToast('Rapport mis a jour');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-surface-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-surface-600">{error}</p>
        <button onClick={() => navigate('/history')} className="btn-secondary">
          Retour a l'historique
        </button>
      </div>
    );
  }

  if (!report) return null;

  if (preview) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Rapport mis a jour</h1>
            <p className="text-sm text-surface-500 mt-1">Les modifications ont ete enregistrees</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setPreview(null)} className="btn-primary">
              Continuer l'edition
            </button>
            <button onClick={() => navigate('/history')} className="btn-secondary">
              Retour a l'historique
            </button>
          </div>
        </div>
        <ReportPreview text={preview.text} sectionsText={preview.sectionsText} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">
            {report.title}
          </h1>
          <p className="text-sm text-surface-500 mt-1">Modification du rapport</p>
        </div>
        <button onClick={() => navigate('/history')} className="btn-ghost self-start sm:self-auto">
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

      {currentTemplate && (
        <ReportForm
          reportType={report.type}
          sections={currentTemplate.sections as SectionDef[]}
          values={sections}
          onChange={(key, value) => setSections((prev) => ({ ...prev, [key]: value }))}
          metadata={metadata}
          onMetadataChange={(field, value) => setMetadata((prev) => ({ ...prev, [field]: value }))}
        />
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-0 bg-surface-50/95 backdrop-blur-sm border-t border-surface-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 mr-2 inline-block animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enregistrement...
            </>
          ) : (
            'Sauvegarder et generer'
          )}
        </button>
      </div>
    </div>
  );
}

