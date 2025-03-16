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
exports.handleChatQuery = exports.deleteChat = exports.addMessageToChat = exports.getChatById = exports.getChatHistory = exports.createChat = void 0;
const chatModel_1 = __importDefault(require("../model/chatModel"));
const uuid_1 = require("uuid");
const queryChat_1 = require("../services/queryChat");
const pineconeService_1 = require("../services/pineconeService");
const s3Service_1 = require("../services/s3Service");
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
            res.status(404).json({ error: "Chat not found" });
            return;
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
            res.status(404).json({ error: "Chat not found" });
            return;
        }
        // Extract valid file keys from the deleted chat
        const fileKeys = deletedChat.files && Array.isArray(deletedChat.files)
            ? deletedChat.files
                .filter(file => file && file.fileKey) // Ensure file and fileKey exist
                .map(file => file.fileKey)
            : [];
        let resourcesDeleted = true;
        try {
            // Delete files from S3
            if (fileKeys.length > 0) {
                console.log(`Attempting to delete ${fileKeys.length} files from S3:`, fileKeys);
                yield (0, s3Service_1.deleteFilesFromS3)(fileKeys);
                console.log(`Successfully deleted uploaded files of chat ${chatId}`);
            }
            else {
                console.log("No files to delete from S3");
            }
            // Delete embeddings from Pinecone
            if (fileKeys.length > 0) {
                yield (0, pineconeService_1.deleteEmbeddingsFromPinecone)(userId, chatId, fileKeys);
                console.log(`Successfully deleted vectors for chat ${chatId}`);
            }
            console.log(`Successfully deleted resources for chat ${chatId}`);
        }
        catch (deleteError) {
            console.error("Error deleting associated resources:", deleteError);
            resourcesDeleted = false;
        }
        res.json({
            success: true,
            message: resourcesDeleted
                ? "Chat and associated resources deleted successfully"
                : "Chat deleted, but there was an issue removing some associated resources"
        });
    }
    catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Failed to delete chat" });
    }
});
exports.deleteChat = deleteChat;
const handleChatQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, query } = req.body;
        const userId = req.auth.userId; // Get userId from auth middleware
        if (!userId || !chatId || !query) {
            res.status(400).json({ error: "chatId and query are required" });
            return;
        }
        // Fetch the chat session to get the associated files
        const chat = yield chatModel_1.default.findOne({ chatId, userId }).lean();
        if (!chat) {
            res.status(404).json({ error: "Chat session not found" });
            return;
        }
        const files = chat.files || [];
        if (files.length === 0) {
            res.status(400).json({ error: "No files available for this chat session" });
            return;
        }
        // Ensure the role is either "user" or "assistant"
        const { answer, sources } = yield (0, queryChat_1.queryChat)(userId, query, chatId, files, (chat.messages || []).map(message => (Object.assign(Object.assign({}, message), { role: message.role, content: message.content || "" }))));
        // Add the message to the chat history
        yield chatModel_1.default.findOneAndUpdate({ chatId, userId }, {
            $push: {
                messages: [
                    { role: "user", content: query, timestamp: new Date() },
                    { role: "assistant", content: answer, timestamp: new Date() }
                ]
            }
        });
        res.json({
            answer,
            sources,
            success: true
        });
    }
    catch (error) {
        console.error("Error handling chat query:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.handleChatQuery = handleChatQuery;
