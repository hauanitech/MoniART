import { ReportTemplate, ReportType } from '../models/report.js';
import { sallesBTemplate } from './sallesB.js';
import { buTemplate } from './bu.js';

const templates: ReportTemplate[] = [sallesBTemplate, buTemplate];

export function getAllTemplates(): ReportTemplate[] {
  return templates;
}

export function getTemplateByType(type: ReportType): ReportTemplate | undefined {
  return templates.find((t) => t.type === type);
}
