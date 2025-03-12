import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { generateQuiz, getExistingQuiz } from '../controllers/quizController';

const router = express.Router();

// Route to generate a quiz based on uploaded files
router.post('/generate', requireAuth, generateQuiz);

// Route to get an existing quiz for a chat
router.get('/:chatId', requireAuth, getExistingQuiz);

export default router;
