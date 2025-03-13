import { requireAuth } from './../middlewares/authMiddleware';
import express from "express";
import { getUserUploadedDocuments, getUserGeneratedDocuments } from "../controllers/docController";

const router = express.Router();

// Apply authentication middleware if you have one
// router.use(authenticateUser);

// Document routes
router.get("/uploaded", requireAuth, getUserUploadedDocuments);
router.get("/generated",requireAuth, getUserGeneratedDocuments);

export default router;
