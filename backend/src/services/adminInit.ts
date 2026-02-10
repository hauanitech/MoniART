import { config } from '../config.js';
import { getUserByName, createUser } from './userRepository.js';

export async function initAdmin(): Promise<void> {
  const { adminName, adminPassword } = config;

  if (!adminName || !adminPassword) {
    console.warn('[admin-init] ADMIN_NAME or ADMIN_PASSWORD not set in environment');
    return;
  }

  const existing = await getUserByName(adminName);
  if (existing) {
    console.log(`[admin-init] Admin user "${adminName}" already exists`);
    return;
  }

  try {
    await createUser(adminName, adminPassword, 'ADMIN', false);
    console.log(`[admin-init] Admin user "${adminName}" created successfully`);
  } catch (error) {
    console.error('[admin-init] Failed to create admin user:', error);
    throw error;
  }
}
