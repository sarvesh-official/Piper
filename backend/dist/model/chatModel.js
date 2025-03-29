"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const fileSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileType: { type: String, required: true },
    extractedText: { type: String },
    embeddingId: { type: mongoose_1.Schema.Types.Mixed },
});
const messageSchema = new mongoose_1.Schema({
    role: { type: String, required: true, enum: ["user", "system", "assistant"] },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const quizQuestionSchema = new mongoose_1.default.Schema({
    id: Number,
    type: {
        type: String,
        enum: ['mcq', 'true/false', 'true_false'],
        required: true
    },
    question: String,
    options: [String],
    correctAnswer: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true
    },
    explanation: String
});
const savedQuizSchema = new mongoose_1.default.Schema({
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    quizTitle: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
    isSubmitted: { type: Boolean, default: false },
    score: { type: Number },
    totalQuestions: { type: Number }
});
const quizSchema = new mongoose_1.default.Schema({
    questions: [quizQuestionSchema],
    generatedAt: { type: Date, default: Date.now },
    settings: {
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced']
        },
        questionCount: { type: Number, default: 10 },
        questionTypes: {
            mcq: Boolean,
            trueFalse: Boolean
        },
        customPrompt: String
    },
    savedQuizzes: [savedQuizSchema]
});
const chatSchema = new mongoose_1.Schema({
    chatId: { type: String, default: () => (0, uuid_1.v4)(), unique: true },
    chatName: { type: String, required: true },
    userId: { type: String, required: true },
    files: [fileSchema],
    messages: [messageSchema],
    quiz: quizSchema,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});
const Chat = mongoose_1.default.model("Chat", chatSchema);
exports.default = Chat;
