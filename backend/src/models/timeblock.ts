// ── TypeScript interfaces (API contract) ──────────────────────────────────────

export interface Timeblock {
  id: string;
  userId: string;
  userName: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  location: 'B2-1' | 'BU';
  title: string;      // auto-generated: "[Name] - [Location]"
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

/** "[User Name] - [Location]" */
export function generateTitle(userName: string, location: string): string {
  return `${userName} - ${location}`;
}
