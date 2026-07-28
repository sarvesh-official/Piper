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
exports.getModel = getModel;
exports.generateText = generateText;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Groq LLM client (OpenAI-compatible endpoint).
 * Uses GROQ_API_KEY from env. Falls back to a secondary key if the primary
 * is rate-limited (set via GROQ_API_KEY_2).
 *
 * Default model: llama-3.3-70b-versatile
 * Other options: llama-3.1-8b-instant (faster, cheaper), deepseek-r1-distill-llama-70b
 *
 * NOTE: Both `ai` and `@ai-sdk/openai-compatible` are ESM-only packages.
 * This module uses eval('import()') to load them at runtime as native ESM
 * dynamic imports, since TypeScript with module:commonjs compiles import()
 * to require() which fails for ESM modules.
 */
const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2;
if (!groqApiKey) {
    throw new Error("Environment variable GROQ_API_KEY (or GROQ_API_KEY_2) is required but not found");
}
/**
 * Default model identifier used across all LLM calls in Piper.
 * Change this single constant to switch models project-wide.
 */
exports.DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";
// Lazy-loaded module references (populated on first use)
let _groqProvider = null;
let _aiGenerateText = null;
/**
 * Load the ESM-only AI SDK packages using native dynamic import.
 * The eval() prevents TypeScript from compiling import() to require().
 */
function loadAISDK() {
    return __awaiter(this, void 0, void 0, function* () {
        if (_groqProvider && _aiGenerateText)
            return;
        const openaiCompatible = (yield eval('import("@ai-sdk/openai-compatible")'));
        const ai = (yield eval('import("ai")'));
        const groq = openaiCompatible.createOpenAICompatible({
            name: "groq",
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: groqApiKey,
        });
        _groqProvider = (modelName) => groq(modelName);
        _aiGenerateText = ai.generateText;
    });
}
/**
 * Helper that returns the model reference for use with generateText.
 */
function getModel() {
    return __awaiter(this, arguments, void 0, function* (modelName = exports.DEFAULT_LLM_MODEL) {
        yield loadAISDK();
        return _groqProvider(modelName);
    });
}
/**
 * Wrapper around the Vercel AI SDK's generateText function.
 * Handles the ESM dynamic import internally.
 */
function generateText(params) {
    return __awaiter(this, void 0, void 0, function* () {
        yield loadAISDK();
        return _aiGenerateText(params);
    });
}
