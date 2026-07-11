import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { handleImportUpload, handleImportUploadStream } from "../controllers/import.controller";

const router = Router();

router.post("/upload", uploadMiddleware.single("file"), handleImportUpload);
router.post("/upload-stream", uploadMiddleware.single("file"), handleImportUploadStream);

export default router;