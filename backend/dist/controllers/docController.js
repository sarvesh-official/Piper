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
exports.getUserGeneratedDocuments = exports.getUserUploadedDocuments = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
// Get all uploaded documents for a user
const getUserUploadedDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user ID from request (assuming authentication middleware adds userId to req)
        const userId = req.auth.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User ID is required" });
            return;
        }
        // Find all chats with files for this user
        const chats = yield chatModel_1.default.find({ userId });
        // Extract all files from the chats
        const uploadedDocs = chats.flatMap(chat => chat.files.map(file => ({
            id: String(file._id), // Use type assertion to handle _id
            name: file.fileName,
            // Use chat name as topic if available, otherwise use filename
            topic: chat.chatName || file.fileName.split('.')[0],
            dateUploaded: chat.createdAt.toISOString().split('T')[0],
            fileUrl: file.fileUrl,
            fileKey: file.fileKey
        })));
        res.status(200).json(uploadedDocs);
        return;
    }
    catch (error) {
        console.error("Error fetching uploaded documents:", error);
        res.status(500).json({
            message: "Failed to fetch uploaded documents",
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return;
    }
});
exports.getUserUploadedDocuments = getUserUploadedDocuments;
// Get all generated documents (quizzes) for a user
const getUserGeneratedDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User ID is required" });
            return;
        }
        // Find all chats with quizzes for this user
        const chats = yield chatModel_1.default.find({
            userId,
            "quiz.savedQuizzes": { $exists: true, $not: { $size: 0 } }
        });
        // Extract all saved quizzes from the chats
        const generatedDocs = chats.flatMap(chat => {
            var _a;
            return ((_a = chat.quiz) === null || _a === void 0 ? void 0 : _a.savedQuizzes.map(quiz => ({
                id: String(quiz._id), // Use type assertion for _id
                name: quiz.fileName,
                topic: quiz.quizTitle,
                dateGenerated: quiz.savedAt.toISOString().split('T')[0],
                type: 'quiz', // All saved documents are quizzes for now
                fileUrl: quiz.fileUrl
            }))) || [];
        });
        res.status(200).json(generatedDocs);
        return;
    }
    catch (error) {
        console.error("Error fetching generated documents:", error);
        res.status(500).json({
            message: "Failed to fetch generated documents",
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return;
    }
});
exports.getUserGeneratedDocuments = getUserGeneratedDocuments;
