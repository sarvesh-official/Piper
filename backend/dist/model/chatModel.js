"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const chatSchema = new mongoose_1.default.Schema({
    chatId: { type: String, unique: true, default: uuid_1.v4 },
    chatName: { type: String, required: true },
    userId: { type: String, required: true },
    messages: [
        {
            role: String,
            content: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
    files: [
        {
            userId: String,
            fileName: String,
            fileUrl: String,
            fileType: String,
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});
const Chat = mongoose_1.default.model("Chat", chatSchema);
exports.default = Chat;
