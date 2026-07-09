import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { handleImportUpload } from "../controllers/import.controller";

const router = Router();

router.post("/upload", uploadMiddleware.single("file"), handleImportUpload);

export default router;