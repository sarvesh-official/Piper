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
exports.deleteChat = exports.addMessageToChat = exports.getChatById = exports.getChatHistory = exports.createChat = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
const uuid_1 = require("uuid");
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, files } = req.body;
        if (!userId || !Array.isArray(files) || files.length === 0) {
            res.status(400).json({ error: "Invalid request parameters" });
            return;
        }
        const chatId = (0, uuid_1.v4)();
        const chatName = files.length === 1
            ? files[0].fileName
            : `${files[0].fileName}, ${((_a = files[1]) === null || _a === void 0 ? void 0 : _a.fileName) || "..."}`;
        const newChat = new chatModel_1.default({
            chatId,
            userId,
            chatName,
            files: files.map((file) => ({
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                fileType: file.fileName.split(".").pop(),
                fileKey: file.fileKey
            })),
            messages: []
        });
        yield newChat.save();
        res.status(201).json({
            success: true,
            chatId,
            chatName,
            message: "Chat created successfully"
        });
    }
    catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ error: "Failed to create chat" });
    }
});
exports.createChat = createChat;
const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const { page = 1, limit = 10 } = req.query;
        const chatHistory = yield chatModel_1.default.find({ userId })
            .select("chatId chatName createdAt files") // Ensure chatName & files are selected
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .lean();
        const formattedHistory = chatHistory.map((chat) => {
            const chatName = chat.chatName || "Untitled Chat"; // Handle missing chatName
            const files = Array.isArray(chat.files) ? chat.files : []; // Ensure files is an array
            return {
                chatId: chat.chatId,
                title: chatName.length > 50 ? chatName.substring(0, 50) + "..." : chatName,
                timestamp: chat.createdAt,
                preview: `${files.length} file(s) uploaded`
            };
        });
        res.json(formattedHistory);
    }
    catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});
exports.getChatHistory = getChatHistory;
const getChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const userId = req.auth.userId;
        const chat = yield chatModel_1.default.findOne({ chatId, userId }).lean();
        if (!chat) {
            res.status(404).json({ error: "Chat not found" });
            return;
        }
        res.json(chat);
    }
    catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});
exports.getChatById = getChatById;
const addMessageToChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const { role, content } = req.body;
        const userId = req.auth.userId;
        const chat = yield chatModel_1.default.findOneAndUpdate({ chatId, userId }, { $push: { messages: { role, content, timestamp: new Date() } } }, { new: true })
            .select("chatId messages")
            .lean();
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.json({ success: true, chat });
    }
    catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Failed to add message" });
    }
});
exports.addMessageToChat = addMessageToChat;
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const userId = req.auth.userId;
        const deletedChat = yield chatModel_1.default.findOneAndDelete({ chatId, userId });
        if (!deletedChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.json({ success: true, message: "Chat deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Failed to delete chat" });
    }
});
exports.deleteChat = deleteChat;
