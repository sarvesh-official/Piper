"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingQuiz = exports.generateQuiz = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
const quizService_1 = require("../services/quizService");
const generateQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fileKeys, questionCount, difficulty, questionTypes, customPrompt, chatId, forceRegenerate = false // When true, ignores existing quiz and generates a new one
         } = req.body;
        const userId = req.auth.userId; // Get userId from auth middleware
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Get the chat document which contains the files
        const chat = yield chatModel_1.default.findOne({ chatId, userId }).lean();
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }
        // Check if a quiz already exists and we don't need to regenerate
        if (!forceRegenerate && chat.quiz && chat.quiz.questions && chat.quiz.questions.length > 0) {
            console.log("Returning existing quiz from chat document");
            res.status(200).json({
                quiz: chat.quiz.questions,
                isExisting: true,
                generatedAt: chat.quiz.generatedAt
            });
            return;
        }
        // If forceRegenerate is true or no quiz exists, generate a new quiz
        // Filter files based on the provided fileKeys - ensure exact matching
        const selectedFiles = (chat.files || []).filter((file) => {
            // Make sure fileKey exists and is a string before using includes
            const fileKey = file.fileKey;
            return typeof fileKey === 'string' && fileKeys.includes(fileKey);
        });
        console.log(`Filtered ${selectedFiles.length} files from ${fileKeys.length} provided keys`);
        console.log("Selected fileKeys:", fileKeys);
        console.log("Available fileKeys in chat:", (_a = chat.files) === null || _a === void 0 ? void 0 : _a.map(f => f.fileKey).filter(key => typeof key === 'string'));
        if (selectedFiles.length === 0) {
            res
                .status(404)
                .json({ message: "No files found with the provided keys" });
            return;
        }
        // Extract text content from the files
        const extractedTexts = selectedFiles
            .map((file) => file.extractedText || "")
            .filter((text) => text.length > 0);
        if (extractedTexts.length === 0) {
            res
                .status(400)
                .json({ message: "No text content available in the selected files" });
            return;
        }
        console.log(`Generating quiz with ${extractedTexts.length} text sources`);
        // Generate quiz questions using the service
        const quiz = yield (0, quizService_1.generateQuizQuestions)({
            extractedTexts,
            questionCount,
            difficulty,
            questionTypes,
            customPrompt,
            chatId
        });
        res.status(200).json({
            quiz,
            isExisting: false,
            generatedAt: new Date()
        });
    }
    catch (error) {
        console.error("Error generating quiz:", error);
        res
            .status(500)
            .json({
            message: "Failed to generate quiz",
            error: error.message
        });
    }
});
exports.generateQuiz = generateQuiz;
// Add a new endpoint to get existing quiz for a chat
const getExistingQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const userId = req.auth.userId;
        const chat = yield chatModel_1.default.findOne({ chatId, userId }).lean();
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }
        if (!chat.quiz || !chat.quiz.questions || chat.quiz.questions.length === 0) {
            res.status(404).json({ message: "No quiz found for this chat" });
            return;
        }
        res.status(200).json({
            quiz: chat.quiz.questions,
            settings: chat.quiz.settings,
            generatedAt: chat.quiz.generatedAt
        });
        return;
    }
    catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({
            message: "Failed to fetch quiz",
            error: error.message
        });
        return;
    }
});
exports.getExistingQuiz = getExistingQuiz;
