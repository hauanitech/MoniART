import { api } from './apiClient';
import type { UserSummary } from '../context/AuthContext';

export interface UserPublic {
  id: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function getUsers(): Promise<UserPublic[]> {
  return api.get<UserPublic[]>('/api/auth/users', false);
}

export async function login(userId: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { userId, password }, false);
}

export async function getMe(): Promise<UserSummary> {
  return api.get<UserSummary>('/api/auth/me');
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/change-password', {
    currentPassword,
    newPassword,
  });
}
