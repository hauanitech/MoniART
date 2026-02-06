import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTypePicker from '../components/ReportTypePicker';
import ReportForm from '../components/ReportForm';
import type { SectionDef } from '../components/ReportForm';
import ReportPreview from '../components/ReportPreview';
import { reportsApi, type ReportTemplate, type RenderedReport } from '../services/reportsApi';

type ReportTypeChoice = 'SALLES_B' | 'BU';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<ReportTypeChoice | null>(null);
  const [metadata, setMetadata] = useState({ reportDate: new Date().toISOString().slice(0, 10), shiftLabel: '', authorName: '' });
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [preview, setPreview] = useState<RenderedReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  const currentTemplate = templates.find((t) => t.type === selectedType);

  const handleSectionChange = (key: string, value: unknown) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedType) return;
    setError('');
    setSaving(true);
    try {
      const report = await reportsApi.create({
        type: selectedType,
        metadata,
        sections,
      });
      const rendered = await reportsApi.render(report.id);
      setPreview(rendered);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setSections({});
    setPreview(null);
    setMetadata({ reportDate: new Date().toISOString().slice(0, 10), shiftLabel: '', authorName: '' });
  };

  if (!selectedType) {
    return <ReportTypePicker onSelect={setSelectedType} />;
  }

  if (preview) {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Rapport genere</h1>
            <p className="text-sm text-surface-500 mt-1">Votre rapport a ete enregistre avec succes</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleReset} className="btn-primary">
              Nouveau rapport
            </button>
            <button onClick={() => navigate('/history')} className="btn-secondary">
              Voir l'historique
            </button>
            {preview && (
              <button onClick={() => navigate(`/email/${preview.reportId}`)} className="btn-secondary">
                Preparer email
              </button>
            )}
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
            Rapport {selectedType === 'SALLES_B' ? 'Salles en B' : 'BU'}
          </h1>
          <p className="text-sm text-surface-500 mt-1">Remplissez les informations du rapport</p>
        </div>
        <button onClick={handleReset} className="btn-ghost self-start sm:self-auto">
          <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Changer de type
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
          reportType={selectedType}
          sections={currentTemplate.sections as SectionDef[]}
          values={sections}
          onChange={handleSectionChange}
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
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
            'Enregistrer et generer'
          )}
        </button>
      </div>
    </div>
  );
}

