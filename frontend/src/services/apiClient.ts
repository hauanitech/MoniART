/// <reference types="vite/client" />
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

import { getAuthToken } from '../context/AuthContext';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

async function request<T>(path: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as unknown as T;

  const body = await res.json();
  
  if (!res.ok) {
    const error: ApiError = new Error(body.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.code = body.code;
    
    // Auto logout on 401
    if (res.status === 401) {
      localStorage.removeItem('moniart_auth');
      window.location.href = '/';
    }
    
    throw error;
  }
  
  return body as T;
}

export const api = {
  get: <T>(path: string, requireAuth = true) => request<T>(path, {}, requireAuth),
  post: <T>(path: string, data?: unknown, requireAuth = true) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }, requireAuth),
  put: <T>(path: string, data?: unknown, requireAuth = true) =>
    request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }, requireAuth),
  delete: <T>(path: string, requireAuth = true) => request<T>(path, { method: 'DELETE' }, requireAuth),
};
