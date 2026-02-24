// ── TypeScript interfaces (API contract) ──────────────────────────────────────

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

export interface OverlayEvent {
  id: string;
  feedId: string;
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  allDay: boolean;
  color: string;
}
