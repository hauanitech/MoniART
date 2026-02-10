import { Collection } from 'mongodb';
import { getDb } from './mongo.js';
import { User, UserSummary, UserPublic, UserRole } from '../models/user.js';
import { hashPassword, generateTemporaryPassword } from './authService.js';
import { v4 as uuid } from 'uuid';

interface UserDoc {
  _id: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

function col(): Collection<UserDoc> {
  return getDb().collection<UserDoc>('users');
}

function toUser(doc: UserDoc): User {
  return {
    id: doc._id,
    name: doc.name,
    passwordHash: doc.passwordHash,
    role: doc.role,
    mustChangePassword: doc.mustChangePassword,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toUserSummary(doc: UserDoc): UserSummary {
  return {
    id: doc._id,
    name: doc.name,
    role: doc.role,
    mustChangePassword: doc.mustChangePassword,
    createdAt: doc.createdAt,
  };
}

function toUserPublic(doc: UserDoc): UserPublic {
  return {
    id: doc._id,
    name: doc.name,
  };
}

export async function createUser(
  name: string,
  password: string,
  role: UserRole = 'MONITOR',
  mustChangePassword: boolean = true,
): Promise<User> {
  const existing = await col().findOne({ name: name.trim() });
  if (existing) {
    throw new Error('Un utilisateur avec ce nom existe déjà');
  }

  const now = new Date().toISOString();
  const doc: UserDoc = {
    _id: uuid(),
    name: name.trim(),
    passwordHash: await hashPassword(password),
    role,
    mustChangePassword,
    createdAt: now,
    updatedAt: now,
  };
  await col().insertOne(doc as any);
  return toUser(doc);
}

export async function getUserById(userId: string): Promise<User | null> {
  const doc = await col().findOne({ _id: userId });
  return doc ? toUser(doc) : null;
}

export async function getUserByName(name: string): Promise<User | null> {
  const doc = await col().findOne({ name: name.trim() });
  return doc ? toUser(doc) : null;
}

export async function listUsers(): Promise<UserSummary[]> {
  const docs = await col().find().sort({ name: 1 }).toArray();
  return docs.map(toUserSummary);
}

export async function listMonitors(): Promise<UserPublic[]> {
  const docs = await col().find({ role: 'MONITOR' }).sort({ name: 1 }).toArray();
  return docs.map(toUserPublic);
}

export async function listAllUsersPublic(): Promise<UserPublic[]> {
  const docs = await col().find().sort({ name: 1 }).toArray();
  return docs.map(toUserPublic);
}

export async function updateUser(
  userId: string,
  updates: { name?: string; role?: UserRole },
): Promise<User | null> {
  const now = new Date().toISOString();
  const setFields: Record<string, unknown> = { updatedAt: now };
  
  if (updates.name !== undefined) {
    const existing = await col().findOne({ name: updates.name.trim(), _id: { $ne: userId } });
    if (existing) {
      throw new Error('Un utilisateur avec ce nom existe déjà');
    }
    setFields.name = updates.name.trim();
  }
  if (updates.role !== undefined) {
    setFields.role = updates.role;
  }

  const result = await col().findOneAndUpdate(
    { _id: userId },
    { $set: setFields },
    { returnDocument: 'after' },
  );
  return result ? toUser(result as unknown as UserDoc) : null;
}

export async function updatePassword(
  userId: string,
  newPassword: string,
  mustChangePassword: boolean = false,
): Promise<boolean> {
  const now = new Date().toISOString();
  const result = await col().updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: await hashPassword(newPassword),
        mustChangePassword,
        updatedAt: now,
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function resetPassword(userId: string): Promise<string | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const tempPassword = generateTemporaryPassword();
  const success = await updatePassword(userId, tempPassword, true);
  return success ? tempPassword : null;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await col().deleteOne({ _id: userId });
  return result.deletedCount === 1;
}

export async function countAdmins(): Promise<number> {
  return col().countDocuments({ role: 'ADMIN' });
}
