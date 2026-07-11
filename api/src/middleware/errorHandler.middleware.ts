import { Request, Response, NextFunction } from "express";
import multer from "multer";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Unhandled error:", err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
}