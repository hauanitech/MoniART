import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTypePicker from '../components/ReportTypePicker';
import ReportForm from '../components/ReportForm';
import type { SectionDef } from '../components/ReportForm';
import IncidentListEditor from '../components/IncidentListEditor';
import type { IncidentItem } from '../components/IncidentListEditor';
import ReportPreview from '../components/ReportPreview';
import { reportsApi, type ReportTemplate, type RenderedReport } from '../services/reportsApi';

type ReportTypeChoice = 'SALLES_B' | 'BU';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<ReportTypeChoice | null>(null);
  const [metadata, setMetadata] = useState({ reportDate: new Date().toISOString().slice(0, 10), shiftLabel: '', authorName: '' });
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
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
      const allSections = { ...sections, incidents };
      const report = await reportsApi.create({
        type: selectedType,
        metadata,
        sections: allSections,
      });
      // Render
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
    setIncidents([]);
    setPreview(null);
    setMetadata({ reportDate: new Date().toISOString().slice(0, 10), shiftLabel: '', authorName: '' });
  };

  if (!selectedType) {
    return <ReportTypePicker onSelect={setSelectedType} />;
  }

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            ✚ Nouveau rapport
          </button>
          <button onClick={() => navigate('/history')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
            📋 Voir l'historique
          </button>
          {preview && (
            <button onClick={() => navigate(`/email/${preview.reportId}`)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              ✉ Préparer email
            </button>
          )}
        </div>
        <ReportPreview text={preview.text} sectionsText={preview.sectionsText} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-700">
          Rapport {selectedType === 'SALLES_B' ? 'Salles en B' : 'BU'}
        </h1>
        <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700">
          ← Changer de type
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {currentTemplate && (
        <ReportForm
          reportType={selectedType}
          sections={currentTemplate.sections as SectionDef[]}
          values={sections}
          onChange={handleSectionChange}
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
          incidentEditor={
            <IncidentListEditor
              items={incidents}
              onChange={setIncidents}
              locationLabel={selectedType === 'SALLES_B' ? 'Lieu' : 'Zone'}
            />
          }
        />
      )}

      <div className="sticky bottom-0 bg-gray-50 border-t py-3 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : '💾 Enregistrer & Générer'}
        </button>
      </div>
    </div>
  );
}
