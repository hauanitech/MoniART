import { api } from './apiClient';
import type {
  Timeblock,
  CreateTimeblockRequest,
  UpdateTimeblockRequest,
  OverlayFeed,
  OverlayEvent,
  CreateOverlayFeedRequest,
  UpdateOverlayFeedRequest,
} from '../types/calendar';

// ── Timeblocks ───────────────────────────────────────────────────────────────

export function listTimeblocks(from: string, to: string): Promise<Timeblock[]> {
  return api.get<Timeblock[]>(`/api/timeblocks?from=${from}&to=${to}`);
}

export function createTimeblock(req: CreateTimeblockRequest): Promise<Timeblock> {
  return api.post<Timeblock>('/api/timeblocks', req);
}

export function updateTimeblock(id: string, req: UpdateTimeblockRequest): Promise<Timeblock> {
  return api.put<Timeblock>(`/api/timeblocks/${id}`, req);
}

export function deleteTimeblock(id: string): Promise<void> {
  return api.delete<void>(`/api/timeblocks/${id}`);
}

// ── Admin Timeblocks ─────────────────────────────────────────────────────────

export function listAdminTimeblocks(from?: string, to?: string): Promise<Timeblock[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return api.get<Timeblock[]>(`/api/timeblocks/admin${qs ? `?${qs}` : ''}`);
}

export function deleteAdminTimeblock(id: string): Promise<void> {
  return api.delete<void>(`/api/timeblocks/admin/${id}`);
}

// ── Overlay Feeds ────────────────────────────────────────────────────────────

export function listFeeds(): Promise<OverlayFeed[]> {
  return api.get<OverlayFeed[]>('/api/overlays');
}

export function createFeed(req: CreateOverlayFeedRequest): Promise<OverlayFeed> {
  return api.post<OverlayFeed>('/api/overlays', req);
}

export function updateFeed(id: string, req: UpdateOverlayFeedRequest): Promise<OverlayFeed> {
  return api.put<OverlayFeed>(`/api/overlays/${id}`, req);
}

export function deleteFeed(id: string): Promise<void> {
  return api.delete<void>(`/api/overlays/${id}`);
}

export function getFeedEvents(id: string, from: string, to: string): Promise<OverlayEvent[]> {
  return api.get<OverlayEvent[]>(`/api/overlays/${id}/events?from=${from}&to=${to}`);
}
