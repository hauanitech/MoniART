import { api } from './apiClient';
import type { UserSummary } from '../context/AuthContext';
import type { ReportSummary } from './reportsApi';

export type UserRole = 'ADMIN' | 'MONITOR';

export interface CreateUserRequest {
  name: string;
  password?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
}

export interface CreateUserResponse {
  user: UserSummary;
  temporaryPassword?: string;
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
}

export async function listUsers(): Promise<UserSummary[]> {
  return api.get<UserSummary[]>('/api/admin/users');
}

export async function getUser(userId: string): Promise<UserSummary> {
  return api.get<UserSummary>(`/api/admin/users/${userId}`);
}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  return api.post<CreateUserResponse>('/api/admin/users', data);
}

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<UserSummary> {
  return api.put<UserSummary>(`/api/admin/users/${userId}`, data);
}

export async function deleteUser(userId: string): Promise<void> {
  return api.delete(`/api/admin/users/${userId}`);
}

export async function resetPassword(userId: string): Promise<ResetPasswordResponse> {
  return api.post<ResetPasswordResponse>(`/api/admin/users/${userId}/reset-password`);
}

export async function listAllReports(type?: string): Promise<ReportSummary[]> {
  const query = type ? `?type=${type}` : '';
  return api.get<ReportSummary[]>(`/api/admin/reports${query}`);
}
