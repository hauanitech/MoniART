import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'MONITOR';

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: UserSummary | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: UserSummary) => void;
  logout: () => void;
  updateAuth: (token: string, user: UserSummary) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'moniart_auth';

interface StoredAuth {
  token: string;
  user: UserSummary;
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveAuth(token: string, user: UserSummary): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    mustChangePassword: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored) {
      setState({
        token: stored.token,
        user: stored.user,
        isAuthenticated: true,
        isAdmin: stored.user.role === 'ADMIN',
        mustChangePassword: stored.user.mustChangePassword,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = (token: string, user: UserSummary) => {
    saveAuth(token, user);
    setState({
      token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      mustChangePassword: user.mustChangePassword,
      isLoading: false,
    });
  };

  const logout = () => {
    clearAuth();
    setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      mustChangePassword: false,
      isLoading: false,
    });
  };

  const updateAuth = (token: string, user: UserSummary) => {
    saveAuth(token, user);
    setState({
      token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      mustChangePassword: user.mustChangePassword,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to get the current token for API calls
export function getAuthToken(): string | null {
  const stored = loadStoredAuth();
  return stored?.token || null;
}
