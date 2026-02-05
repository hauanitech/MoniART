import { api } from './apiClient';

export interface ReportTemplate {
  id: string;
  type: 'SALLES_B' | 'BU';
  version: number;
  sections: {
    key: string;
    label: string;
    kind: 'text' | 'list' | 'number' | 'numberList' | 'roomChecklist';
    required: boolean;
    format?: string;
    roomConfig?: {
      rooms: string[];
      checkItems: { key: string; label: string }[];
    };
  }[];
}

export interface Report {
  id: string;
  workspaceId: string;
  type: 'SALLES_B' | 'BU';
  templateId: string;
  templateVersion: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata: { reportDate: string; shiftLabel?: string; authorName?: string };
  sections: Record<string, unknown>;
}

export interface ReportSummary {
  id: string;
  type: 'SALLES_B' | 'BU';
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

export const reportsApi = {
  getTemplates: () => api.get<ReportTemplate[]>('/api/templates'),

  list: (type?: string) =>
    api.get<ReportSummary[]>(`/api/reports${type ? `?type=${type}` : ''}`),

  get: (id: string) => api.get<Report>(`/api/reports/${id}`),

  create: (data: {
    type: string;
    title?: string;
    metadata: { reportDate: string; shiftLabel?: string; authorName?: string };
    sections: Record<string, unknown>;
  }) => api.post<Report>('/api/reports', data),

  update: (id: string, data: {
    title?: string;
    metadata: { reportDate: string; shiftLabel?: string; authorName?: string };
    sections: Record<string, unknown>;
  }) => api.put<Report>(`/api/reports/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/reports/${id}`),

  render: (id: string) => api.post<RenderedReport>(`/api/reports/${id}/render`),

  prepareEmail: (id: string, to?: string[]) =>
    api.post<PreparedEmail>(`/api/reports/${id}/email/prepare`, to ? { to } : {}),
};
