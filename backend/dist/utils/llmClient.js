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
exports.DEFAULT_LLM_MODEL = void 0;
exports.generateText = generateText;
exports.getModel = getModel;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Groq LLM client using direct REST API calls (no SDK dependency).
 *
 * Uses GROQ_API_KEY from env. Falls back to GROQ_API_KEY_2.
 * Default model: llama-3.3-70b-versatile
 */
const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2;
if (!groqApiKey) {
    throw new Error("Environment variable GROQ_API_KEY (or GROQ_API_KEY_2) is required but not found");
}
exports.DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
/**
 * Generate text using Groq's OpenAI-compatible REST API.
 * No SDK dependency — just fetch().
 * Supports both `messages` (array) and `prompt` (string) params.
 */
function generateText(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const model = params.model || exports.DEFAULT_LLM_MODEL;
        const messages = params.messages || [
            { role: "user", content: params.prompt || "" },
        ];
        const response = yield fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: params.maxOutputTokens || 2048,
                temperature: (_a = params.temperature) !== null && _a !== void 0 ? _a : 0.7,
            }),
        });
        if (!response.ok) {
            const errorBody = yield response.text();
            throw new Error(`Groq API error (${response.status}): ${errorBody}`);
        }
        const data = yield response.json();
        const text = ((_d = (_c = (_b = data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || "";
        return { text };
    });
}
/**
 * Returns the model name for use with generateText.
 * Kept for backward compatibility with callers that use getModel().
 */
function getModel() {
    return __awaiter(this, arguments, void 0, function* (modelName = exports.DEFAULT_LLM_MODEL) {
        return modelName;
    });
}
