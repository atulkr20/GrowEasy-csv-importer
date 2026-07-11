import { Request, Response } from "express";
import { parseCsvBuffer } from "../services/csvParser.service";
import { extractCrmRecords } from "../services/aiExtraction.service";

// Existing non-streaming handler, unchanged
export async function handleImportUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { rows } = parseCsvBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ error: "CSV file is empty" });
    }

    const result = await extractCrmRecords(rows);

    res.json({
      records: result.records,
      skipped: result.skipped,
      totalImported: result.totalImported,
      totalSkipped: result.totalSkipped,
    });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Failed to process CSV import" });
  }
}


export async function handleImportUploadStream(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { rows } = parseCsvBuffer(req.file.buffer);

  if (rows.length === 0) {
    res.status(400).json({ error: "CSV file is empty" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
  });

  try {
    const result = await extractCrmRecords(rows, (progress) => {
      res.write(JSON.stringify({ type: "progress", ...progress }) + "\n");
    });

    res.write(
      JSON.stringify({
        type: "complete",
        records: result.records,
        skipped: result.skipped,
        totalImported: result.totalImported,
        totalSkipped: result.totalSkipped,
      }) + "\n"
    );
  } catch (err) {
    console.error("Streaming import error:", err);
    res.write(JSON.stringify({ type: "error", message: "Failed to process CSV import" }) + "\n");
  } finally {
    res.end();
  }
}