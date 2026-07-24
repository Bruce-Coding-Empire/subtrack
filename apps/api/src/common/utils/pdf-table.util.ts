import PDFDocument from 'pdfkit';
import type { Response } from 'express';

export type PdfColumn<T> = {
  header: string;
  value: (row: T) => string;
  width: number;
};

export function renderPdfTable<T>(
  res: Response,
  options: {
    filename: string;
    title: string;
    columns: PdfColumn<T>[];
    rows: T[];
  },
): void {
  const { filename, title, columns, rows } = options;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text(title);
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Generated ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown();
  doc.fillColor('#000000');

  const startX = doc.page.margins.left;
  const rowHeight = 18;
  let y = doc.y;

  const columnX: number[] = [];
  let x = startX;
  for (const column of columns) {
    columnX.push(x);
    x += column.width;
  }
  const tableRight = x;

  const drawRow = (values: string[], bold: boolean) => {
    doc.fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica');
    values.forEach((value, i) => {
      doc.text(value, columnX[i], y, {
        width: columns[i].width,
        ellipsis: true,
      });
    });
    y += rowHeight;
  };

  drawRow(
    columns.map((col) => col.header),
    true,
  );
  doc
    .moveTo(startX, y - 4)
    .lineTo(tableRight, y - 4)
    .strokeColor('#cccccc')
    .stroke();

  if (rows.length === 0) {
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text('No data to export', startX, y);
  } else {
    for (const row of rows) {
      if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      drawRow(
        columns.map((col) => col.value(row)),
        false,
      );
    }
  }

  doc.end();
}
