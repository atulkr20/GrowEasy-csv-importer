import { parse } from "csv-parse/sync";

export interface ParsedCsvResult {
    headers: string[];
    rows: Record<string, string>[];
}


export function parseCsvBuffer(buffer: Buffer): ParsedCsvResult {
    const records: Record<string, string>[] = parse(buffer, {
        columns: true, // use first row as object keys
        skip_empty_lines: true,
        trim: true,
    });

    const headers = records.length > 0 ? Object.keys(records[0]) : [];

    return { headers, rows: records };
}