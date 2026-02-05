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
      showToast('Rapport supprimé');
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-gray-700">Historique des rapports</h1>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Tous les types</option>
          <option value="SALLES_B">Salles en B</option>
          <option value="BU">BU</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun rapport trouvé.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border p-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                <p className="text-xs text-gray-400">
                  {r.type === 'SALLES_B' ? 'Salles en B' : 'BU'} · {formatDate(r.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/edit/${r.id}`)} className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
                  ✏️ Modifier
                </button>
                <button onClick={() => navigate(`/email/${r.id}`)} className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                  ✉ Email
                </button>
                <button onClick={() => setDeleteTarget(r)} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer le rapport"
          message={`Voulez-vous vraiment supprimer « ${deleteTarget.title} » ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
