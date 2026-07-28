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
exports.getModel = exports.DEFAULT_LLM_MODEL = exports.groq = void 0;
exports.generateText = generateText;
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
/**
 * Lazy-loaded `generateText` from the Vercel AI SDK.
 * The `ai` package is ESM-only, so we use a runtime dynamic import (kept as a
 * native `import()` call via `eval`) instead of `require()` which fails for
 * ESM modules in CommonJS contexts.
 */
function generateText(params) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use eval to prevent TypeScript from compiling import() to require()
        const ai = (yield eval('import("ai")'));
        return ai.generateText(params);
    });
}
