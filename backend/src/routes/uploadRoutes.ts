import express from "express";
import multer from "multer";
import { handleMulterError, uploadFilesAndExtractText } from "../controllers/uploadController";

const router = express.Router();

// Configure multer with file size limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  }
});

router.post("/upload-files", upload.array("files", 3), handleMulterError, uploadFilesAndExtractText);

export default router;