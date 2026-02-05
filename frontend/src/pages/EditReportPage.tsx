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
      showToast('Rapport mis à jour !');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Chargement…</p>;
  if (error && !report) return <p className="text-sm text-red-500">{error}</p>;
  if (!report) return null;

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setPreview(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            ✏️ Continuer l'édition
          </button>
          <button onClick={() => navigate('/history')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
            📋 Retour historique
          </button>
        </div>
        <ReportPreview text={preview.text} sectionsText={preview.sectionsText} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-700">
          Modifier — {report.title}
        </h1>
        <button onClick={() => navigate('/history')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Retour
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

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

      <div className="sticky bottom-0 bg-gray-50 border-t py-3 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : '💾 Sauvegarder & Générer'}
        </button>
      </div>
    </div>
  );
}

