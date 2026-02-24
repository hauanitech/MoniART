import { Collection } from 'mongodb';
import { getDb } from './mongo.js';
import { v4 as uuid } from 'uuid';
import type { OverlayFeed } from '../models/overlay.js';

// ── Internal document shape ───────────────────────────────────────────────────

interface OverlayFeedDoc {
  _id: string;
  userId: string;
  label: string;
  url: string;
  color: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function col(): Collection<OverlayFeedDoc> {
  return getDb().collection<OverlayFeedDoc>('overlay_feeds');
}

// ── Ensure indexes (called once at startup) ─────────────────────────────────

export async function ensureOverlayIndexes(): Promise<void> {
  await col().createIndex({ userId: 1 });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toOverlayFeed(doc: OverlayFeedDoc): OverlayFeed {
  return {
    id: doc._id,
    userId: doc.userId,
    label: doc.label,
    url: doc.url,
    color: doc.color,
    isEnabled: doc.isEnabled,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ── CRUD operations ──────────────────────────────────────────────────────────

export async function createFeed(
  userId: string,
  label: string,
  url: string,
  color: string = '#6366f1',
): Promise<OverlayFeed> {
  const now = new Date().toISOString();
  const doc: OverlayFeedDoc = {
    _id: uuid(),
    userId,
    label: label.trim(),
    url: url.trim(),
    color: color.trim() || '#6366f1',
    isEnabled: true,
    createdAt: now,
    updatedAt: now,
  };
  await col().insertOne(doc as any);
  return toOverlayFeed(doc);
}

export async function listFeedsByUser(userId: string): Promise<OverlayFeed[]> {
  const docs = await col().find({ userId }).sort({ createdAt: 1 }).toArray();
  return docs.map(toOverlayFeed);
}

export async function getFeedById(id: string, userId: string): Promise<OverlayFeed | null> {
  const doc = await col().findOne({ _id: id, userId });
  return doc ? toOverlayFeed(doc) : null;
}

export async function updateFeed(
  id: string,
  userId: string,
  updates: { label?: string; url?: string; color?: string; isEnabled?: boolean },
): Promise<OverlayFeed | null> {
  const now = new Date().toISOString();
  const setFields: Record<string, unknown> = { updatedAt: now };
  if (updates.label !== undefined) setFields.label = updates.label.trim();
  if (updates.url !== undefined) setFields.url = updates.url.trim();
  if (updates.color !== undefined) setFields.color = updates.color.trim();
  if (updates.isEnabled !== undefined) setFields.isEnabled = updates.isEnabled;

  const result = await col().findOneAndUpdate(
    { _id: id, userId },
    { $set: setFields },
    { returnDocument: 'after' },
  );
  if (!result) return null;
  return toOverlayFeed(result as unknown as OverlayFeedDoc);
}

export async function deleteFeed(id: string, userId: string): Promise<boolean> {
  const result = await col().deleteOne({ _id: id, userId });
  return result.deletedCount === 1;
}

/** Get raw feed doc for ICS url fetch (internal) */
export async function getFeedDocForEvents(
  id: string,
  userId: string,
): Promise<{ url: string; color: string } | null> {
  const doc = await col().findOne({ _id: id, userId }, { projection: { url: 1, color: 1 } });
  if (!doc) return null;
  return { url: doc.url, color: doc.color };
}
