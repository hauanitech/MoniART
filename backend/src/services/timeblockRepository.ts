import { Collection, ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import { v4 as uuid } from 'uuid';
import type { Timeblock } from '../models/timeblock.js';
import { generateTitle } from '../models/timeblock.js';

// ── Internal document shape ───────────────────────────────────────────────────

interface TimeblockDoc {
  _id: string;
  userId: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  location: string;   // "B2-1" | "BU"
  createdAt: string;
  updatedAt: string;
}

function col(): Collection<TimeblockDoc> {
  return getDb().collection<TimeblockDoc>('timeblocks');
}

// ── Ensure indexes (called once at startup) ─────────────────────────────────

export async function ensureTimeblockIndexes(): Promise<void> {
  await col().createIndex({ userId: 1, date: 1 });
  await col().createIndex({ location: 1, date: 1 });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve userId → userName via the users collection */
async function getUserName(userId: string): Promise<string> {
  const user = await getDb().collection('users').findOne({ _id: userId as any }, { projection: { name: 1 } });
  return (user as { name?: string } | null)?.name ?? 'Unknown';
}

function toTimeblock(doc: TimeblockDoc, userName: string): Timeblock {
  return {
    id: doc._id,
    userId: doc.userId,
    userName,
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    location: doc.location as 'B2-1' | 'BU',
    title: generateTitle(userName, doc.location),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ── CRUD operations ──────────────────────────────────────────────────────────

export async function createTimeblock(
  userId: string,
  date: string,
  startTime: string,
  endTime: string,
  location: string,
): Promise<TimeblockDoc> {
  const now = new Date().toISOString();
  const doc: TimeblockDoc = {
    _id: uuid(),
    userId,
    date,
    startTime,
    endTime,
    location,
    createdAt: now,
    updatedAt: now,
  };
  await col().insertOne(doc as any);
  return doc;
}

export async function getTimeblockById(id: string): Promise<Timeblock | null> {
  const doc = await col().findOne({ _id: id });
  if (!doc) return null;
  const userName = await getUserName(doc.userId);
  return toTimeblock(doc, userName);
}

export async function getTimeblockDocById(id: string): Promise<TimeblockDoc | null> {
  return col().findOne({ _id: id });
}

export async function listTimeblocks(from?: string, to?: string): Promise<Timeblock[]> {
  const filter: Record<string, unknown> = {};
  if (from && to) filter['date'] = { $gte: from, $lte: to };
  else if (from)  filter['date'] = { $gte: from };
  else if (to)    filter['date'] = { $lte: to };

  const docs = await col().find(filter).sort({ date: 1, startTime: 1 }).toArray();

  // Batch-resolve user names
  const userIds = [...new Set(docs.map(d => d.userId))];
  const users = await getDb().collection('users')
    .find({ _id: { $in: userIds } as any }, { projection: { _id: 1, name: 1 } })
    .toArray();
  const nameMap = new Map(users.map(u => [String(u._id), (u as any).name as string]));

  return docs.map(doc => toTimeblock(doc, nameMap.get(doc.userId) ?? 'Unknown'));
}

export async function updateTimeblock(
  id: string,
  updates: { date?: string; startTime?: string; endTime?: string; location?: string },
): Promise<Timeblock | null> {
  const now = new Date().toISOString();
  const setFields: Record<string, unknown> = { updatedAt: now };
  if (updates.date !== undefined) setFields.date = updates.date;
  if (updates.startTime !== undefined) setFields.startTime = updates.startTime;
  if (updates.endTime !== undefined) setFields.endTime = updates.endTime;
  if (updates.location !== undefined) setFields.location = updates.location;

  const result = await col().findOneAndUpdate(
    { _id: id },
    { $set: setFields },
    { returnDocument: 'after' },
  );
  if (!result) return null;
  const doc = result as unknown as TimeblockDoc;
  const userName = await getUserName(doc.userId);
  return toTimeblock(doc, userName);
}

export async function deleteTimeblock(id: string): Promise<boolean> {
  const result = await col().deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function deleteTimeblocksByUserId(userId: string): Promise<string[]> {
  const docs = await col().find({ userId }, { projection: { _id: 1 } }).toArray();
  const ids = docs.map(d => d._id);
  if (ids.length > 0) {
    await col().deleteMany({ userId });
  }
  return ids;
}
