import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import dotenv from "dotenv";

dotenv.config();

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

export const groq = createOpenAICompatible({
  name: "groq",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: groqApiKey,
});

/**
 * Default model identifier used across all LLM calls in Piper.
 * Change this single constant to switch models project-wide.
 */
export const DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";

/**
 * Helper that returns the model reference for use with the Vercel AI SDK's
 * `generateText` / `streamText` functions.
 */
export const getModel = (modelName: string = DEFAULT_LLM_MODEL) => groq(modelName);

/**
 * Lazy-loaded `generateText` from the Vercel AI SDK.
 * The `ai` package is ESM-only, so we use a runtime dynamic import (kept as a
 * native `import()` call via `eval`) instead of `require()` which fails for
 * ESM modules in CommonJS contexts.
 */
export async function generateText(params: {
  model: ReturnType<typeof getModel>;
  prompt?: string;
  messages?: any[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<{ text: string }> {
  // Use eval to prevent TypeScript from compiling import() to require()
  const ai = (await eval('import("ai")')) as typeof import("ai");
  return ai.generateText(params as any);
}
