import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { generateQuiz, getExistingQuiz, getQuizByChatId, saveQuizToDocuments } from '../controllers/quizController';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

// Route to generate a quiz based on uploaded files
router.post('/generate', requireAuth, generateQuiz);

// Route to get an existing quiz for a chat
router.get('/:chatId', requireAuth, getExistingQuiz);

// Get quiz by chat ID
router.get("/:chatId", requireAuth, getQuizByChatId);

// Save quiz to documents
router.post(
  "/save-to-documents",
  requireAuth,
  upload.single("file"), // Handle single file upload
  saveQuizToDocuments
);

export default router;
