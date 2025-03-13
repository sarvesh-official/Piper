"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const quizController_1 = require("../controllers/quizController");
const router = express_1.default.Router();
// Route to generate a quiz based on uploaded files
router.post('/generate', authMiddleware_1.requireAuth, quizController_1.generateQuiz);
// Route to get an existing quiz for a chat
router.get('/:chatId', authMiddleware_1.requireAuth, quizController_1.getExistingQuiz);
exports.default = router;
