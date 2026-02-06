import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi, type ReportSummary } from '../services/reportsApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ReportSummary | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.list(filterType || undefined);
      setReports(data);
    } catch {
      showToast('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reportsApi.delete(deleteTarget.id);
      showToast('Rapport supprime');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Historique des rapports</h1>
          <p className="text-sm text-surface-500 mt-1">Consultez et gerez vos rapports precedents</p>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">Tous les types</option>
          <option value="SALLES_B">Salles en B</option>
          <option value="BU">BU</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-surface-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Chargement...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-surface-500">Aucun rapport trouve</p>
          <button onClick={() => navigate('/create')} className="btn-primary">
            Creer un rapport
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-soft-lg transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-surface-900 truncate">{r.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    r.type === 'SALLES_B'
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-surface-100 text-surface-600'
                  }`}>
                    {r.type === 'SALLES_B' ? 'Salles en B' : 'BU'}
                  </span>
                  <span className="text-xs text-surface-400">{formatDate(r.updatedAt)}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => navigate(`/edit/${r.id}`)}
                  className="btn-secondary text-xs py-2"
                >
                  Modifier
                </button>
                <button
                  onClick={() => navigate(`/email/${r.id}`)}
                  className="btn-secondary text-xs py-2"
                >
                  Email
                </button>
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="btn-ghost text-xs py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer le rapport"
          message={`Voulez-vous vraiment supprimer "${deleteTarget.title}" ? Cette action est irreversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
