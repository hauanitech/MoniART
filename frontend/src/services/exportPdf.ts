import jsPDF from 'jspdf';
import { format, parseISO, getDay, startOfWeek, addDays } from 'date-fns';
import type { Timeblock } from '../types/calendar';

// ── Page (A4 landscape 297×210 mm) ───────────────────────────────────────────
const PW = 297;
const PH = 210;

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDEBAR_W = 15;

// ── Content area (right of sidebar) ──────────────────────────────────────────
const CX = SIDEBAR_W + 3;
const CW = PW - CX - 3;

// ── Time grid ─────────────────────────────────────────────────────────────────
const DAY_COL_W = 22;
const TIME_START = 7 * 60 + 30;
const TIME_END = 18 * 60;
const SLOT_MIN = 30;
const N_SLOTS = (TIME_END - TIME_START) / SLOT_MIN;
const SLOT_W = (CW - DAY_COL_W) / N_SLOTS;

// ── Vertical positions ────────────────────────────────────────────────────────
const MT = 4;
const TITLE_Y = MT;
const TITLE_H = 11;
const SUBTITLE_Y = TITLE_Y + TITLE_H + 2;
const SUBTITLE_H = 7;
const GRID_Y = SUBTITLE_Y + SUBTITLE_H + 2;
const HDR_H = 7;
const N_DAYS = 6;
const N_SUBROWS = 2;
const SUBROW_H = 12;
const DAY_ROW_H = N_SUBROWS * SUBROW_H;
const GRID_TOTAL_H = HDR_H + N_DAYS * DAY_ROW_H;
const FOOTER_Y = GRID_Y + GRID_TOTAL_H + 4;

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  sidebar: [31, 73, 125] as [number, number, number],
  bu: [68, 114, 196] as [number, number, number],
  b21: [112, 173, 71] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  gridLine: [180, 180, 180] as [number, number, number],
  hdrBg1: [214, 227, 244] as [number, number, number],
  hdrBg2: [255, 255, 255] as [number, number, number],
  cellBg1: [239, 245, 255] as [number, number, number],
  cellBg2: [255, 255, 255] as [number, number, number],
  footer: [0, 176, 240] as [number, number, number],
  grey: [100, 100, 100] as [number, number, number],
};

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function xFor(minutes: number): number {
  return CX + DAY_COL_W + ((minutes - TIME_START) / SLOT_MIN) * SLOT_W;
}

function yForDay(dayIdx: number): number {
  return GRID_Y + HDR_H + dayIdx * DAY_ROW_H;
}

export function exportTimeblocksPdf(
  timeblocks: Timeblock[],
  from: string,
  to: string,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const monday = startOfWeek(parseISO(from), { weekStartsOn: 1 });
  const saturday = addDays(monday, 5);
  const periodStr = `du ${format(monday, 'dd/MM/yyyy')} au ${format(saturday, 'dd/MM/yyyy')}`;

  // ── Sidebar ───────────────────────────────────────────────────────────────
  doc.setFillColor(...C.sidebar);
  doc.rect(0, 0, SIDEBAR_W, PH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text('Assistance Informatique', SIDEBAR_W / 2, PH * 0.62, {
    angle: 90,
    align: 'center',
  });

  // ── Title box ─────────────────────────────────────────────────────────────
  const boxW = 135;
  const boxX = CX + (CW - boxW) / 2;
  doc.setDrawColor(...C.black);
  doc.setLineWidth(0.5);
  doc.rect(boxX, TITLE_Y, boxW, TITLE_H);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text(
    'Horaire Moniteurs de permanence',
    boxX + boxW / 2,
    TITLE_Y + 7.5,
    { align: 'center' },
  );

  // ── Subtitle ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.grey);
  doc.text(`Semaine :  ${periodStr}`, CX + CW / 2, SUBTITLE_Y + 5, {
    align: 'center',
  });

  // ── Hours header row ──────────────────────────────────────────────────────
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.gridLine);
  doc.setLineWidth(0.2);
  doc.rect(CX, GRID_Y, DAY_COL_W, HDR_H, 'FD');

  for (let s = 0; s < N_SLOTS; s++) {
    const x = CX + DAY_COL_W + s * SLOT_W;
    const min = TIME_START + s * SLOT_MIN;
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    const lbl = `${hh}h${mm === 0 ? '00' : String(mm)}`;

    const even = Math.floor(s / 2) % 2 === 0;
    doc.setFillColor(...(even ? C.hdrBg1 : C.hdrBg2));
    doc.setDrawColor(...C.gridLine);
    doc.setLineWidth(0.2);
    doc.rect(x, GRID_Y, SLOT_W, HDR_H, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...C.black);
    doc.text(lbl, x + SLOT_W / 2, GRID_Y + HDR_H - 1.5, { align: 'center' });
  }

  // ── Day rows ──────────────────────────────────────────────────────────────
  for (let d = 0; d < N_DAYS; d++) {
    const dayDate = addDays(monday, d);
    const dayY = yForDay(d);

    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.gridLine);
    doc.setLineWidth(0.2);
    doc.rect(CX, dayY, DAY_COL_W, DAY_ROW_H, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.black);
    doc.text(DAY_NAMES[d]!, CX + 1.5, dayY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.grey);
    doc.text(format(dayDate, 'dd/MM/yyyy'), CX + 1.5, dayY + 13);

    for (let s = 0; s < N_SLOTS; s++) {
      const x = CX + DAY_COL_W + s * SLOT_W;
      const even = Math.floor(s / 2) % 2 === 0;

      for (let sr = 0; sr < N_SUBROWS; sr++) {
        const y = dayY + sr * SUBROW_H;
        doc.setFillColor(...(even ? C.cellBg1 : C.cellBg2));
        doc.setDrawColor(...C.gridLine);
        doc.setLineWidth(0.1);
        if (s > 0) {
          doc.setLineDashPattern([0.8, 0.8], 0);
          doc.line(x, dayY, x, dayY + DAY_ROW_H);
          doc.setLineDashPattern([], 0);
        }
        doc.setFillColor(...(even ? C.cellBg1 : C.cellBg2));
        doc.rect(x, y, SLOT_W, SUBROW_H, 'F');
      }
    }

    doc.setDrawColor(...C.gridLine);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(CX + DAY_COL_W, dayY + SUBROW_H, CX + CW, dayY + SUBROW_H);
    doc.setLineDashPattern([], 0);

    doc.setDrawColor(...C.gridLine);
    doc.setLineWidth(0.3);
    doc.line(CX, dayY + DAY_ROW_H, CX + CW, dayY + DAY_ROW_H);
  }

  // Outer grid border
  doc.setDrawColor(...C.black);
  doc.setLineWidth(0.5);
  doc.rect(CX, GRID_Y, CW, GRID_TOTAL_H);

  doc.setLineWidth(0.4);
  doc.line(CX + DAY_COL_W, GRID_Y, CX + DAY_COL_W, GRID_Y + GRID_TOTAL_H);

  // ── Events ────────────────────────────────────────────────────────────────
  const byDay = new Map<number, Timeblock[]>();
  for (const tb of timeblocks) {
    const dow = getDay(parseISO(tb.date));
    if (dow === 0 || dow > 6) continue;
    const dayIdx = dow - 1;
    if (!byDay.has(dayIdx)) byDay.set(dayIdx, []);
    byDay.get(dayIdx)!.push(tb);
  }

  byDay.forEach((tbs, dayIdx) => {
    const dayY = yForDay(dayIdx);
    tbs.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const slotRanges: { startMin: number; endMin: number }[][] = [[], []];
    const assignments: number[] = [];

    for (const tb of tbs) {
      const s = toMin(tb.startTime);
      const e = toMin(tb.endTime);
      let placed = false;
      for (let sr = 0; sr < N_SUBROWS; sr++) {
        const overlaps = slotRanges[sr]!.some(
          (r) => r.startMin < e && r.endMin > s,
        );
        if (!overlaps) {
          slotRanges[sr]!.push({ startMin: s, endMin: e });
          assignments.push(sr);
          placed = true;
          break;
        }
      }
      if (!placed) assignments.push(N_SUBROWS - 1);
    }

    tbs.forEach((tb, i) => {
      const startMin = toMin(tb.startTime);
      const endMin = toMin(tb.endTime);
      const subRow = assignments[i] ?? 0;

      const cStart = Math.max(startMin, TIME_START);
      const cEnd = Math.min(endMin, TIME_END);
      if (cEnd <= cStart) return;

      const x = xFor(cStart) + 0.5;
      const w = xFor(cEnd) - xFor(cStart) - 1;
      const y = dayY + subRow * SUBROW_H + 0.5;
      const h = SUBROW_H - 1;
      if (w < 1) return;

      const isB21 = tb.location === 'B2-1';
      doc.setFillColor(...(isB21 ? C.b21 : C.bu));
      doc.setDrawColor(...(isB21 ? C.b21 : C.bu));
      doc.setLineWidth(0.1);
      doc.rect(x, y, w, h, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...C.white);
      const lbl = `${tb.userName} \u2013 ${tb.location}`;
      doc.text(lbl, x + w / 2, y + h / 2 + 1.2, {
        align: 'center',
        maxWidth: w - 0.5,
      });
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...C.footer);
  doc.text(
    'Des moniteurs étudiants sont à votre disposition pour vous aider, sollicitez-les\u00a0!',
    CX,
    FOOTER_Y + 4,
  );

  doc.save(`planning-${from}_${to}.pdf`);
}
