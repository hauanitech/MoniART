import { Report, RenderedReport, IncidentItem } from '../models/report.js';
import { getTemplateByType } from '../templates/index.js';

function renderIncidentItem(item: IncidentItem): string {
  const parts: string[] = [];
  if (item.time) parts.push(`[${item.time}]`);
  if (item.location) parts.push(`(${item.location})`);
  parts.push(item.description);
  if (item.actionTaken) parts.push(`→ ${item.actionTaken}`);
  return '  • ' + parts.join(' ');
}

function renderListSection(items: unknown[]): string {
  return items
    .map((item) => {
      if (typeof item === 'string') return `  • ${item}`;
      if (typeof item === 'object' && item !== null && 'description' in item) {
        return renderIncidentItem(item as IncidentItem);
      }
      return `  • ${JSON.stringify(item)}`;
    })
    .join('\n');
}

export function renderReport(report: Report): RenderedReport {
  const template = getTemplateByType(report.type);
  const sections = template?.sections || [];

  const typeLabel = report.type === 'SALLES_B' ? 'Salles en B' : 'BU';
  const headerLines: string[] = [
    `═══════════════════════════════════════`,
    `  RAPPORT ${typeLabel.toUpperCase()}`,
    `═══════════════════════════════════════`,
    `Date : ${report.metadata.reportDate}`,
  ];
  if (report.metadata.shiftLabel) headerLines.push(`Créneau : ${report.metadata.shiftLabel}`);
  if (report.metadata.authorName) headerLines.push(`Moniteur : ${report.metadata.authorName}`);
  headerLines.push('');

  const sectionsText: Record<string, string> = {};
  const bodyLines: string[] = [];

  for (const sec of sections) {
    const value = report.sections[sec.key];
    let text = '';

    if (sec.kind === 'text') {
      text = typeof value === 'string' ? value : '';
    } else if (sec.kind === 'list') {
      text = Array.isArray(value) ? renderListSection(value) : '';
    }

    if (text) {
      const sectionBlock = `── ${sec.label} ──\n${text}`;
      bodyLines.push(sectionBlock);
      bodyLines.push('');
      sectionsText[sec.key] = `${sec.label}\n${text}`;
    } else if (sec.required) {
      const sectionBlock = `── ${sec.label} ──\n(aucune donnée)`;
      bodyLines.push(sectionBlock);
      bodyLines.push('');
      sectionsText[sec.key] = `${sec.label}\n(aucune donnée)`;
    }
  }

  const fullText = [...headerLines, ...bodyLines].join('\n').trimEnd();

  return {
    reportId: report.id,
    text: fullText,
    sectionsText,
  };
}
