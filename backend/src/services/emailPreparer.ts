import { isValidEmail } from '../models/report.js';
import { renderReport } from './reportRenderer.js';
import { getReport } from './reportRepository.js';

interface PreparedEmail {
  subject: string;
  body: string;
  to: string[];
  invalidRecipients: string[];
}

export async function prepareEmail(
  reportId: string,
  workspaceId: string,
  recipients?: string[],
): Promise<PreparedEmail> {
  const report = await getReport(workspaceId, reportId);
  if (!report) {
    throw Object.assign(new Error('Report not found'), { statusCode: 404 });
  }

  const rendered = renderReport(report);

  const validTo: string[] = [];
  const invalidRecipients: string[] = [];
  if (recipients && recipients.length > 0) {
    for (const r of recipients) {
      if (isValidEmail(r)) {
        validTo.push(r);
      } else {
        invalidRecipients.push(r);
      }
    }
  }

  const typeLabel = report.type === 'SALLES_B' ? 'Salles en B' : 'BU';
  const subject = `Rapport ${typeLabel} — ${report.metadata.reportDate}${
    report.metadata.shiftLabel ? ` (${report.metadata.shiftLabel})` : ''
  }`;

  return {
    subject,
    body: rendered.text,
    to: validTo,
    invalidRecipients,
  };
}
