"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const quizController_1 = require("../controllers/quizController");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
});
// Route to generate a quiz based on uploaded files
router.post('/generate', authMiddleware_1.requireAuth, quizController_1.generateQuiz);
// Route to get an existing quiz for a chat
router.get('/:chatId', authMiddleware_1.requireAuth, quizController_1.getExistingQuiz);
// Get quiz by chat ID
router.get("/:chatId", authMiddleware_1.requireAuth, quizController_1.getQuizByChatId);
// Save quiz to documents
router.post("/save-to-documents", authMiddleware_1.requireAuth, upload.single("file"), // Handle single file upload
quizController_1.saveQuizToDocuments);
exports.default = router;
