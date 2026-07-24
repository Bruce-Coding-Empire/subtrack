export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number;
};

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCsvField(col.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvField(col.value(row))).join(','),
  );
  return [header, ...lines].join('\r\n');
}
