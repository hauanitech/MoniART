// ── Timeblock types ──────────────────────────────────────────────────────────

export interface Timeblock {
  id: string;
  userId: string;
  userName: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  location: 'B2-1' | 'BU';
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeblockRequest {
  date: string;
  startTime: string;
  endTime: string;
  location: 'B2-1' | 'BU';
}

export interface UpdateTimeblockRequest {
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: 'B2-1' | 'BU';
}

// ── Overlay types ────────────────────────────────────────────────────────────

export interface OverlayFeed {
  id: string;
  userId: string;
  label: string;
  url: string;
  color: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OverlayEvent {
  id: string;
  feedId: string;
  feedLabel?: string;
  title: string;
  start: string;   // ISO 8601
  end: string;     // ISO 8601
  allDay: boolean;
  color: string;
}

export interface CreateOverlayFeedRequest {
  label: string;
  url: string;
  color?: string;
}

export interface UpdateOverlayFeedRequest {
  label?: string;
  url?: string;
  color?: string;
  isEnabled?: boolean;
}
