import { Collection, ObjectId } from 'mongodb';
import { getDb } from './mongo.js';
import { Report, ReportSummary, ReportType } from '../models/report.js';
import { v4 as uuid } from 'uuid';
import { getTemplateByType } from '../templates/index.js';

interface ReportDoc {
  _id: string;
  userId: string;
  type: ReportType;
  templateId: string;
  templateVersion: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata: Report['metadata'];
  sections: Record<string, unknown>;
}

function col(): Collection<ReportDoc> {
  return getDb().collection<ReportDoc>('reports');
}

function toReport(doc: ReportDoc): Report {
  return {
    id: doc._id,
    userId: doc.userId,
    type: doc.type,
    templateId: doc.templateId,
    templateVersion: doc.templateVersion,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    metadata: doc.metadata,
    sections: doc.sections,
  };
}

export async function createReport(
  userId: string,
  type: ReportType,
  title: string,
  metadata: Report['metadata'],
  sections: Record<string, unknown>,
  templateId?: string,
): Promise<Report> {
  const template = getTemplateByType(type);
  const now = new Date().toISOString();
  const doc: ReportDoc = {
    _id: uuid(),
    userId,
    type,
    templateId: templateId || template?.id || `${type.toLowerCase()}@1`,
    templateVersion: template?.version || 1,
    title: title || `Rapport ${type === 'SALLES_B' ? 'Salles en B' : 'BU'} — ${metadata.reportDate}`,
    createdAt: now,
    updatedAt: now,
    metadata,
    sections,
  };
  await col().insertOne(doc as any);
  return toReport(doc);
}

export async function listReports(
  userId: string,
  type?: ReportType,
): Promise<ReportSummary[]> {
  const filter: Record<string, unknown> = { userId };
  if (type) filter.type = type;
  const docs = await col()
    .find(filter)
    .sort({ updatedAt: -1 })
    .project<Pick<ReportDoc, '_id' | 'type' | 'title' | 'createdAt' | 'updatedAt'>>({
      _id: 1, type: 1, title: 1, createdAt: 1, updatedAt: 1,
    })
    .toArray();
  return docs.map((d) => ({
    id: d._id,
    type: d.type,
    title: d.title,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

export async function listAllReports(
  type?: ReportType,
): Promise<ReportSummary[]> {
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  const docs = await col()
    .find(filter)
    .sort({ updatedAt: -1 })
    .project<Pick<ReportDoc, '_id' | 'type' | 'title' | 'createdAt' | 'updatedAt'>>({
      _id: 1, type: 1, title: 1, createdAt: 1, updatedAt: 1,
    })
    .toArray();
  return docs.map((d) => ({
    id: d._id,
    type: d.type,
    title: d.title,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

export async function getReport(userId: string, reportId: string): Promise<Report | null> {
  const doc = await col().findOne({ _id: reportId, userId });
  return doc ? toReport(doc) : null;
}

export async function getReportById(reportId: string): Promise<Report | null> {
  const doc = await col().findOne({ _id: reportId });
  return doc ? toReport(doc) : null;
}

export async function updateReport(
  userId: string,
  reportId: string,
  title: string | undefined,
  metadata: Report['metadata'],
  sections: Record<string, unknown>,
): Promise<Report | null> {
  const now = new Date().toISOString();
  const setFields: Record<string, unknown> = { metadata, sections, updatedAt: now };
  if (title !== undefined && title !== null) setFields.title = title;
  const result = await col().findOneAndUpdate(
    { _id: reportId, userId },
    { $set: setFields },
    { returnDocument: 'after' },
  );
  return result ? toReport(result as unknown as ReportDoc) : null;
}

export async function deleteReport(userId: string, reportId: string): Promise<boolean> {
  const result = await col().deleteOne({ _id: reportId, userId });
  return result.deletedCount === 1;
}
