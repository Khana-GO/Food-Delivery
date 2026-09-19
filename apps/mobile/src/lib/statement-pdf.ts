const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;

const CRIMSON: [number, number, number] = [181 / 255, 18 / 255, 42 / 255];
const GREEN: [number, number, number] = [22 / 255, 131 / 255, 75 / 255];
const DARK: [number, number, number] = [10 / 255, 10 / 255, 10 / 255];
const GRAY: [number, number, number] = [100 / 255, 116 / 255, 139 / 255];
const LIGHT: [number, number, number] = [242 / 255, 241 / 255, 239 / 255];
const BORDER: [number, number, number] = [230 / 255, 230 / 255, 230 / 255];

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export interface StatementPdf {
  bytes: Uint8Array;
  fileName: string;
}

export function buildStatementPdf(opts: {
  headerTitle: string;
  headerSub: string;
  summary: Array<{ label: string; value: string }>;
  rows: Array<{ id: string; customer: string; date: string; amount: string }>;
  totalLabel: string;
  totalValue: string;
  footer: string;
}): StatementPdf {
  let page = 0;
  let y = 0;
  const pages: Array<Array<string>> = [[]];
  const ops = (): Array<string> => pages[page];

  const setColor = (c: [number, number, number]): void => {
    ops().push(`${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(3)} rg`);
  };

  const rect = (x: number, ty: number, w: number, h: number, fill: [number, number, number]): void => {
    setColor(fill);
    ops().push(`${x} ${PAGE_H - ty - h} ${w} ${h} re f`);
  };

  const line = (x1: number, ty1: number, x2: number, ty2: number, color: [number, number, number]): void => {
    setColor(color);
    ops().push(`${x1} ${PAGE_H - ty1} m ${x2} ${PAGE_H - ty2} l S`);
  };

  const text = (str: string, x: number, ty: number, size: number, font: string, color: [number, number, number]): void => {
    setColor(color);
    ops().push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${PAGE_H - ty} Tm (${esc(str)}) Tj ET`);
  };

  const newPage = (): void => {
    pages.push([]);
    page += 1;
    y = MARGIN;
  };

  const ensureSpace = (needed: number): void => {
    if (y + needed > PAGE_H - MARGIN) {
      newPage();
    }
  };

  // ─── Header band ───
  rect(0, 30, PAGE_W, 52, CRIMSON);
  text(opts.headerTitle, MARGIN, 42, 15, 'F2', [1, 1, 1]);
  text(opts.headerSub, MARGIN, 64, 8.5, 'F3', [1, 1, 1]);
  y = 106;

  // ─── Summary boxes ───
  const boxW = (PAGE_W - MARGIN * 2 - 14) / 2;
  opts.summary.forEach((sm, i) => {
    const bx = MARGIN + i * (boxW + 14);
    rect(bx, y, boxW, 46, LIGHT);
    text(sm.label.toUpperCase(), bx + 10, y + 10, 7, 'F2', GRAY);
    text(sm.value, bx + 10, y + 27, 13, 'F2', DARK);
  });
  y += 60;

  // ─── Table header ───
  text('#', MARGIN, y + 8, 7.5, 'F2', GRAY);
  text('ORDER', MARGIN + 42, y + 8, 7.5, 'F2', GRAY);
  text('CUSTOMER', MARGIN + 150, y + 8, 7.5, 'F2', GRAY);
  text('DATE', MARGIN + 280, y + 8, 7.5, 'F2', GRAY);
  text('AMOUNT', PAGE_W - MARGIN - 100, y + 8, 7.5, 'F2', GRAY);
  line(MARGIN, y + 20, PAGE_W - MARGIN, y + 20, BORDER);
  y += 32;

  // ─── Table rows ───
  const rowH = 18;
  for (const row of opts.rows) {
    ensureSpace(rowH + 30);
    text(row.id, MARGIN, y + 5, 8.5, 'F1', DARK);
    text(row.customer, MARGIN + 42, y + 5, 8.5, 'F1', GRAY);
    text(row.date, MARGIN + 280, y + 5, 8.5, 'F1', GRAY);
    text(row.amount, PAGE_W - MARGIN - 100, y + 5, 8.5, 'F2', GREEN);
    line(MARGIN, y + rowH, PAGE_W - MARGIN, y + rowH, BORDER);
    y += rowH;
  }

  // ─── Total box ───
  ensureSpace(50);
  y += 12;
  rect(MARGIN, y, PAGE_W - MARGIN * 2, 34, LIGHT);
  text(opts.totalLabel, MARGIN + 12, y + 12, 9, 'F2', DARK);
  text(opts.totalValue, PAGE_W - MARGIN - 12, y + 12, 12, 'F2', CRIMSON);
  y += 46;

  // ─── Footer ───
  text(opts.footer, MARGIN, PAGE_H - 26, 7.5, 'F3', GRAY);

  return { bytes: toPdf(pages), fileName: `KhanaGo-Earnings-Statement-${new Date().toISOString().slice(0, 10)}.pdf` };
}

function toPdf(pages: Array<Array<string>>): Uint8Array {
  const header = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  let body = header;
  const objNumbers = { catalog: 1, pages: 2, f1: 3, f2: 4, f3: 5 };
  const pageObjs = pages.map((_, i) => ({ page: 6 + i * 2, content: 7 + i * 2 }));

  const push = (t: string): void => {
    body += t;
  };

  push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjs.map((p) => `${p.page} 0 R`).join(' ')}] /Count ${pageObjs.length} >>\nendobj\n`);
  push(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
  push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n`);

  pages.forEach((opsList, i) => {
    const info = pageObjs[i];
    push(
      `${info.page} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${info.content} 0 R >>\nendobj\n`,
    );
    const stream = opsList.join('\n') + '\n';
    push(`${info.content} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);
  });

  const xrefOffset = body.length;
  const lastObj = pageObjs[pageObjs.length - 1].content;
  const offsets: Record<number, number> = {
    [objNumbers.catalog]: header.length + 0,
  };
  // Recompute offsets precisely by tracking each push length.
  let cursor = header.length;
  const track = (t: string, id: number): void => {
    offsets[id] = cursor;
    cursor += t.length;
  };
  cursor = header.length;
  track(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`, 1);
  track(`2 0 obj\n<< /Type /Pages /Kids [${pageObjs.map((p) => `${p.page} 0 R`).join(' ')}] /Count ${pageObjs.length} >>\nendobj\n`, 2);
  track(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`, 3);
  track(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`, 4);
  track(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n`, 5);
  pages.forEach((opsList, i) => {
    const info = pageObjs[i];
    const pageStr =
      `${info.page} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${info.content} 0 R >>\nendobj\n`;
    track(pageStr, info.page);
    const stream = opsList.join('\n') + '\n';
    track(`${info.content} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`, info.content);
  });

  let xref = `xref\n0 ${lastObj + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= lastObj; i++) {
    xref += `${String(offsets[i] ?? 0).padStart(10, '0')} 00000 n \n`;
  }
  body += xref;
  body += `trailer\n<< /Size ${lastObj + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) {
    bytes[i] = body.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function triggerDownload(data: Uint8Array, fileName: string): void {
  const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}