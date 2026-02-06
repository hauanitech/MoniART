import { Report, RenderedReport, RoomData } from '../models/report.js';
import { getTemplateByType } from '../templates/index.js';
import { ReportSectionDefinition } from '../models/report.js';

function formatNumberList(items: number[], format: string): string {
  if (!items || items.length === 0) return '';
  return items.map((n) => `- ${format.replace('{n}', String(n))}`).join('\n');
}

function renderRoomChecklist(roomsData: Record<string, RoomData>, sec: ReportSectionDefinition): string {
  const config = sec.roomConfig;
  if (!config) return '';

  const lines: string[] = [];
  for (const roomName of config.rooms) {
    const room = roomsData?.[roomName];
    if (!room?.visited) {
      lines.push(`- ${roomName} : `);
      continue;
    }
    // Collect issues found
    const issues: string[] = [];
    if (room.checks) {
      for (const item of config.checkItems) {
        const val = room.checks[item.key];
        if (item.inputType === 'number') {
          const num = typeof val === 'number' ? val : 0;
          if (num > 0) issues.push(`${item.label}: ${num}`);
        } else if (val) {
          issues.push(item.label);
        }
      }
    }
    const issueStr = issues.length > 0 ? issues.join(', ') : 'R.A.S';
    const notesStr = room.notes ? ` | Notes: ${room.notes}` : '';
    lines.push(`- ${roomName} : ${issueStr}${notesStr}`);
  }
  return lines.join('\n');
}

function renderSection(value: unknown, sec: ReportSectionDefinition): string {
  switch (sec.kind) {
    case 'text':
      return typeof value === 'string' ? value : '';
    case 'number':
      return value !== undefined && value !== null && value !== '' ? String(value) : '0';
    case 'numberList': {
      const nums = Array.isArray(value) ? (value as number[]) : [];
      return formatNumberList(nums, sec.format || '{n}');
    }
    case 'roomChecklist': {
      const rooms = (value || {}) as Record<string, RoomData>;
      return renderRoomChecklist(rooms, sec);
    }
    case 'list': {
      if (!Array.isArray(value)) return '';
      return value
        .map((item) => {
          if (typeof item === 'string') return `  • ${item}`;
          return `  • ${JSON.stringify(item)}`;
        })
        .join('\n');
    }
    default:
      return typeof value === 'string' ? value : '';
  }
}

export function renderReport(report: Report): RenderedReport {
  const template = getTemplateByType(report.type);
  const sections = template?.sections || [];

  const headerLines: string[] = [
    `-Date, heure, et lieu---------------------------------------------------------------------`,
    `* ${report.metadata.reportDate}`,
  ];
  if (report.metadata.shiftLabel) headerLines.push(`* ${report.metadata.shiftLabel}`);
  if (report.type === 'SALLES_B') {
    // Add visited rooms to header
    const roomsData = report.sections['rooms'] as Record<string, RoomData> | undefined;
    if (roomsData) {
      const visited = Object.entries(roomsData)
        .filter(([, r]) => r.visited)
        .map(([name]) => name);
      if (visited.length > 0) headerLines.push(`* ${visited.join(', ')}`);
    }
  } else {
    headerLines.push('* BU');
  }

  headerLines.push(`-Interventions-----------------------------------------------------------------------------`);
  headerLines.push('');

  const sectionsText: Record<string, string> = {};
  const bodyLines: string[] = [];

  for (const sec of sections) {
    const value = report.sections[sec.key];
    const text = renderSection(value, sec);

    if (sec.kind === 'number') {
      const line = `${sec.label}: ${text}`;
      bodyLines.push(line);
      bodyLines.push('');
      sectionsText[sec.key] = line;
    } else if (sec.kind === 'roomChecklist') {
      bodyLines.push(`${sec.label} :`);
      bodyLines.push(text);
      bodyLines.push('');
      sectionsText[sec.key] = `${sec.label} :\n${text}`;
    } else if (sec.kind === 'numberList') {
      bodyLines.push(`${sec.label} :`);
      if (text) {
        bodyLines.push(text);
      }
      bodyLines.push('');
      sectionsText[sec.key] = text ? `${sec.label} :\n${text}` : `${sec.label} :`;
    } else if (text) {
      bodyLines.push(`${sec.label} : ${text}`);
      bodyLines.push('');
      sectionsText[sec.key] = `${sec.label} : ${text}`;
    } else {
      bodyLines.push(`${sec.label} : `);
      bodyLines.push('');
      sectionsText[sec.key] = `${sec.label} : `;
    }
  }

  // Signature
  if (report.metadata.authorName) {
    bodyLines.push('');
    bodyLines.push('Cordialement,');
    bodyLines.push('');
    bodyLines.push('─────────────────────────────');
    bodyLines.push(report.metadata.authorName);
  }

  const fullText = [...headerLines, ...bodyLines].join('\n').trimEnd();

  return {
    reportId: report.id,
    text: fullText,
    sectionsText,
  };
}

