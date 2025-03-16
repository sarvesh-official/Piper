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
exports.saveQuizToDocuments = exports.getQuizByChatId = exports.getExistingQuiz = exports.generateQuiz = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
const quizService_1 = require("../services/quizService");
const uuid_1 = require("uuid");
const s3Service_1 = require("../services/s3Service"); // Add this import
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
            chatId,
            forceRegenerate // Pass the forceRegenerate flag to the service
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
// Controller method to get quiz by chat ID
const getQuizByChatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const userId = req.auth.userId;
        if (!chatId) {
            res.status(400).json({ error: "Chat ID is required" });
            return;
        }
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const chat = yield chatModel_1.default.findOne({ chatId, userId });
        if (!chat) {
            res.status(404).json({ error: "Chat not found" });
            return;
        }
        if (!chat.quiz || !chat.quiz.questions || chat.quiz.questions.length === 0) {
            res.status(404).json({ error: "No quiz found for this chat" });
            return;
        }
        res.status(200).json({
            quiz: {
                title: "Quiz on " + chat.chatName,
                questions: chat.quiz.questions,
            },
            isExisting: true,
            generatedAt: chat.quiz.generatedAt,
        });
        return;
    }
    catch (error) {
        console.error("Error fetching quiz by chat ID:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.getQuizByChatId = getQuizByChatId;
// Controller method to save quiz to My Documents
const saveQuizToDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, quizTitle } = req.body;
        const userId = req.auth.userId;
        const isSubmitted = req.body.isSubmitted === "true";
        const score = parseInt(req.body.score) || undefined;
        const totalQuestions = parseInt(req.body.totalQuestions) || undefined;
        if (!chatId) {
            res.status(400).json({ error: "Chat ID is required" });
            return;
        }
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: "Quiz file is required" });
            return;
        }
        const chat = yield chatModel_1.default.findOne({ chatId, userId });
        if (!chat) {
            res.status(404).json({ error: "Chat not found" });
            return;
        }
        // Upload file to S3
        const fileBuffer = req.file.buffer;
        const fileKey = `quizzes/${userId}/${(0, uuid_1.v4)()}-${req.file.originalname}`;
        const contentType = req.file.mimetype;
        const uploadResult = yield (0, s3Service_1.uploadToS3)(fileBuffer, fileKey, contentType);
        if (!uploadResult) {
            res.status(500).json({ error: "Failed to upload quiz to storage" });
            return;
        }
        // Add saved quiz to the chat's quiz
        if (!chat.quiz) {
            // Initialize quiz if it doesn't exist
            chat.quiz = {
                questions: [],
                generatedAt: new Date(),
                settings: {
                    difficulty: 'intermediate',
                    questionCount: 10,
                    questionTypes: { mcq: true, trueFalse: true }
                },
                savedQuizzes: [] // Initialize empty array
            };
        }
        else if (!chat.quiz.savedQuizzes) {
            // Initialize savedQuizzes if it doesn't exist
            chat.quiz.savedQuizzes = [];
        }
        // Add the newly saved quiz
        chat.quiz.savedQuizzes.push({
            fileName: req.file.originalname,
            fileUrl: uploadResult.Location,
            fileKey: fileKey,
            quizTitle: quizTitle || "Quiz",
            savedAt: new Date(),
            isSubmitted,
            score,
            totalQuestions
        });
        // Save the updated chat document
        yield chat.save();
        res.status(200).json({
            success: true,
            message: "Quiz successfully saved to My Documents",
            savedQuiz: {
                fileName: req.file.originalname,
                fileUrl: uploadResult.Location,
                quizTitle: quizTitle || "Quiz"
            }
        });
        return;
    }
    catch (error) {
        console.error("Error saving quiz to documents:", error);
        res.status(500).json({ error: "Failed to save quiz to My Documents" });
        return;
    }
});
exports.saveQuizToDocuments = saveQuizToDocuments;
