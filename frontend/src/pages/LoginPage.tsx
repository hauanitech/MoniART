import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, login, type UserPublic } from '../services/authApi';

export default function LoginPage() {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { login: authLogin, isAuthenticated, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/create', { replace: true });
      }
    }
  }, [isAuthenticated, mustChangePassword, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !password) return;

    setError('');
    setLoginLoading(true);

    try {
      const response = await login(selectedUser.id, password);
      authLogin(response.token, response.user);
      
      if (response.user.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/create', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  }

  function handleUserSelect(user: UserPublic) {
    setSelectedUser(user);
    setPassword('');
    setError('');
  }

  function handleBack() {
    setSelectedUser(null);
    setPassword('');
    setError('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-surface-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <img src="/icons/logo.png" alt="MoniART" className="w-12 h-12 rounded-xl" />
            <span className="font-semibold text-2xl text-surface-900 tracking-tight">
              MoniART
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
          {!selectedUser ? (
            <>
              <h1 className="text-xl font-semibold text-surface-900 mb-2 text-center">
                Connexion
              </h1>
              <p className="text-surface-500 text-sm text-center mb-6">
                Sélectionnez votre nom pour continuer
              </p>

              {users.length === 0 ? (
                <p className="text-center text-surface-500 py-8">
                  Aucun utilisateur disponible
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-3 text-left rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <span className="font-medium text-surface-900">{user.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="mb-4 text-sm text-surface-500 hover:text-surface-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>

              <h1 className="text-xl font-semibold text-surface-900 mb-1 text-center">
                {selectedUser.name}
              </h1>
              <p className="text-surface-500 text-sm text-center mb-6">
                Entrez votre mot de passe
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!password || loginLoading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 text-white font-medium rounded-xl transition-colors"
                >
                  {loginLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
