import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserSummary } from '../context/AuthContext';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  listAllReports,
  type CreateUserRequest,
} from '../services/adminApi';
import type { ReportSummary } from '../services/reportsApi';
import ConfirmDialog from '../components/ConfirmDialog';

type Tab = 'users' | 'reports';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'MONITOR'>('MONITOR');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Temporary password display
  const [tempPassword, setTempPassword] = useState<{ userId: string; password: string } | null>(null);

  // Confirm dialog
  const [confirmDelete, setConfirmDelete] = useState<UserSummary | null>(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [usersData, reportsData] = await Promise.all([
        listUsers(),
        listAllReports(),
      ]);
      setUsers(usersData);
      setReports(reportsData);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingUser(null);
    setFormName('');
    setFormPassword('');
    setFormRole('MONITOR');
    setFormError('');
    setShowUserForm(true);
  }

  function openEditForm(user: UserSummary) {
    setEditingUser(user);
    setFormName(user.name);
    setFormPassword('');
    setFormRole(user.role);
    setFormError('');
    setShowUserForm(true);
  }

  function closeForm() {
    setShowUserForm(false);
    setEditingUser(null);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, { name: formName, role: formRole });
      } else {
        const data: CreateUserRequest = { name: formName, role: formRole };
        if (formPassword) data.password = formPassword;
        const response = await createUser(data);
        if (response.temporaryPassword) {
          setTempPassword({ userId: response.user.id, password: response.temporaryPassword });
        }
      }
      await loadData();
      closeForm();
    } catch (err: any) {
      setFormError(err.message || 'Erreur');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(user: UserSummary) {
    try {
      await deleteUser(user.id);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
    setConfirmDelete(null);
  }

  async function handleResetPassword(user: UserSummary) {
    try {
      const response = await resetPassword(user.id);
      setTempPassword({ userId: user.id, password: response.temporaryPassword });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-surface-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Administration</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'users'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          Utilisateurs ({users.length})
        </button>
        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'reports'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          Rapports ({reports.length})
        </button>
      </div>

      {/* Temporary Password Display */}
      {tempPassword && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <strong>Mot de passe temporaire :</strong>{' '}
              <code className="bg-green-100 px-2 py-1 rounded font-mono">{tempPassword.password}</code>
              <p className="text-sm mt-1">Notez ce mot de passe, il ne sera plus affiché.</p>
            </div>
            <button
              onClick={() => setTempPassword(null)}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-surface-800">Utilisateurs</h2>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              + Nouvel utilisateur
            </button>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Nom</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Rôle</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Statut</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-surface-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-surface-900">{user.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.mustChangePassword && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          Doit changer MDP
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditForm(user)}
                          className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        >
                          Reset MDP
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div>
          <h2 className="text-lg font-semibold text-surface-800 mb-4">Tous les rapports</h2>
          
          {reports.length === 0 ? (
            <p className="text-surface-500 text-center py-8">Aucun rapport</p>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Titre</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Créé le</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700">Modifié le</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-surface-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-surface-900">{report.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            report.type === 'SALLES_B'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {report.type === 'SALLES_B' ? 'Salles B' : 'BU'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {new Date(report.updatedAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-surface-900 mb-4">
              {editingUser ? 'Modifier' : 'Créer'} un utilisateur
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Laisser vide pour générer automatiquement"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                  <p className="text-sm text-surface-500 mt-1">
                    Si vide, un mot de passe temporaire sera généré.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Rôle
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'ADMIN' | 'MONITOR')}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                >
                  <option value="MONITOR">Moniteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              {formError && (
                <div className="text-red-600 text-sm bg-red-50 py-2 px-3 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 text-white font-medium rounded-xl transition-colors"
                >
                  {formLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer "${confirmDelete.name}" ?`}
          confirmLabel="Supprimer"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
