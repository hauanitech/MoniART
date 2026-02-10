export type UserRole = 'ADMIN' | 'MONITOR';

export interface User {
  id: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

const VALID_ROLES: UserRole[] = ['ADMIN', 'MONITOR'];

export function isValidUserRole(val: unknown): val is UserRole {
  return typeof val === 'string' && VALID_ROLES.includes(val as UserRole);
}
