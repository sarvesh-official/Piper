"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.DEFAULT_LLM_MODEL = exports.groq = void 0;
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Groq LLM client (OpenAI-compatible endpoint).
 * Uses GROQ_API_KEY from env. Falls back to a secondary key if the primary
 * is rate-limited (set via GROQ_API_KEY_2).
 *
 * Default model: llama-3.3-70b-versatile
 * Other options: llama-3.1-8b-instant (faster, cheaper), deepseek-r1-distill-llama-70b
 */
const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2;
if (!groqApiKey) {
    throw new Error("Environment variable GROQ_API_KEY (or GROQ_API_KEY_2) is required but not found");
}
exports.groq = (0, openai_compatible_1.createOpenAICompatible)({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: groqApiKey,
});
/**
 * Default model identifier used across all LLM calls in Piper.
 * Change this single constant to switch models project-wide.
 */
exports.DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";
/**
 * Helper that returns the model reference for use with the Vercel AI SDK's
 * `generateText` / `streamText` functions.
 */
const getModel = (modelName = exports.DEFAULT_LLM_MODEL) => (0, exports.groq)(modelName);
exports.getModel = getModel;
