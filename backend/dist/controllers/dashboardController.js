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
exports.getDashboardCourseSummaries = exports.getDashboardChatSummaries = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
const courseModel_1 = require("../model/courseModel");
const getDashboardChatSummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const chats = yield chatModel_1.default.find({ userId })
            .select("chatId chatName files messages createdAt")
            .sort({ createdAt: -1 })
            .lean();
        if (!chats || chats.length === 0) {
            res.json([]);
            return;
        }
        const chatSummaries = chats.map(chat => {
            // Calculate a fake quiz psrogress for demo purposes (can be replaced with actual logic)
            const quizProgress = Math.floor(Math.random() * 100);
            // Get the most recent message content as preview
            const lastMessage = chat.messages && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1].content || "No message content"
                : "No messages";
            return {
                id: chat.chatId,
                topic: chat.chatName || "Untitled Chat",
                chat: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? "..." : ""),
                quiz: quizProgress,
                files: chat.files || [],
                createdAt: chat.createdAt
            };
        });
        res.json(chatSummaries);
    }
    catch (error) {
        console.error("Error fetching dashboard chat summaries:", error);
        res.status(500).json({ error: "Failed to fetch chat summaries" });
    }
});
exports.getDashboardChatSummaries = getDashboardChatSummaries;
const getDashboardCourseSummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const courses = yield courseModel_1.Course.find({ userId })
            .select("_id title description progress status")
            .sort({ createdAt: -1 })
            .lean();
        if (!courses) {
            res.json([]);
            return;
        }
        res.json(courses);
    }
    catch (error) {
        console.error("Error fetching dashboard course summaries:", error);
        res.status(500).json({ error: "Failed to fetch course summaries" });
    }
});
exports.getDashboardCourseSummaries = getDashboardCourseSummaries;
