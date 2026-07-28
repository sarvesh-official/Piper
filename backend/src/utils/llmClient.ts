import dotenv from "dotenv";

dotenv.config();

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
export const DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";

// Lazy-loaded module references (populated on first use)
let _groqProvider: ((modelName: string) => any) | null = null;
let _aiGenerateText: ((params: any) => Promise<{ text: string }>) | null = null;

/**
 * Load the ESM-only AI SDK packages using native dynamic import.
 * The eval() prevents TypeScript from compiling import() to require().
 */
async function loadAISDK(): Promise<void> {
  if (_groqProvider && _aiGenerateText) return;

  const openaiCompatible = (await eval('import("@ai-sdk/openai-compatible")')) as typeof import("@ai-sdk/openai-compatible");
  const ai = (await eval('import("ai")')) as typeof import("ai");

  const groq = openaiCompatible.createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: groqApiKey!,
  });

  _groqProvider = (modelName: string) => groq(modelName);
  _aiGenerateText = ai.generateText;
}

/**
 * Helper that returns the model reference for use with generateText.
 */
export async function getModel(modelName: string = DEFAULT_LLM_MODEL) {
  await loadAISDK();
  return _groqProvider!(modelName);
}

/**
 * Wrapper around the Vercel AI SDK's generateText function.
 * Handles the ESM dynamic import internally.
 */
export async function generateText(params: {
  model: any;
  prompt?: string;
  messages?: any[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<{ text: string }> {
  await loadAISDK();
  return _aiGenerateText!(params);
}
