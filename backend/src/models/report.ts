export type ReportType = 'SALLES_B' | 'BU';

export type SectionKind = 'text' | 'list' | 'number' | 'numberList' | 'roomChecklist';

export interface RoomChecklistConfig {
  rooms: string[];
  checkItems: { key: string; label: string }[];
}

export interface ReportSectionDefinition {
  key: string;
  label: string;
  kind: SectionKind;
  required: boolean;
  /** For numberList: display format, e.g. "BUPF{n}" or "Mat {n}" */
  format?: string;
  /** For roomChecklist: room names + checklist items */
  roomConfig?: RoomChecklistConfig;
}

export interface ReportTemplate {
  id: string;
  type: ReportType;
  version: number;
  sections: ReportSectionDefinition[];
}

/** Per-room data for Salles en B */
export interface RoomData {
  visited: boolean;
  checks: Record<string, boolean>;
  notes: string;
}

export interface IncidentItem {
  time?: string;
  location?: string;
  description: string;
  actionTaken?: string;
}

export interface ReportMetadata {
  reportDate: string; // ISO date
  shiftLabel?: string;
  authorName?: string;
}

export interface Report {
  id: string;
  workspaceId: string;
  type: ReportType;
  templateId: string;
  templateVersion: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata: ReportMetadata;
  sections: Record<string, unknown>;
}

export interface ReportCreateRequest {
  type: ReportType;
  title?: string;
  templateId?: string;
  metadata: ReportMetadata;
  sections: Record<string, unknown>;
}

export interface ReportUpdateRequest {
  title?: string;
  metadata: ReportMetadata;
  sections: Record<string, unknown>;
}

export interface ReportSummary {
  id: string;
  type: ReportType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenderedReport {
  reportId: string;
  text: string;
  sectionsText: Record<string, string>;
}

export interface PreparedEmail {
  subject: string;
  body: string;
  to?: string[];
  invalidRecipients?: string[];
}

const VALID_TYPES: ReportType[] = ['SALLES_B', 'BU'];

export function isValidReportType(val: unknown): val is ReportType {
  return typeof val === 'string' && VALID_TYPES.includes(val as ReportType);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
