import express from "express";
import multer from "multer";
import { uploadFilesAndExtractText } from "../controllers/uploadController";

const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-files", upload.array("files", 3), uploadFilesAndExtractText);

export default router;