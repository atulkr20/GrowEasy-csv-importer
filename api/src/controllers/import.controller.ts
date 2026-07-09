import { Request, Response } from "express";
import { parseCsvBuffer } from "../services/csvParser.service";

export function handleImportUpload(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded"});
        }

        const { headers, rows } = parseCsvBuffer(req.file.buffer);

        if(rows.length === 0) {
            return res.status(400).json({error:  "CSV file is empty"});
        }
        res.json({
            headers,
            rowCount: rows.length,
            rows,
        });
    } catch (err) {
        console.error("CSV parse error", err);
        res.status(400).json({ error: "Failed to parse CSV file"});
    }
}