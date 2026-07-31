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

/**
 * Default model identifier used across all LLM calls in Piper.
 * Change this single constant to switch models project-wide.
 */
export const DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";

// Load packages via require — both have CJS entry points
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createOpenAICompatible } = require("@ai-sdk/openai-compatible");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateText: aiGenerateText } = require("ai");

const groq = createOpenAICompatible({
  name: "groq",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: groqApiKey!,
});

/**
 * Helper that returns the model reference for use with generateText.
 */
export async function getModel(modelName: string = DEFAULT_LLM_MODEL) {
  return groq(modelName);
}

/**
 * Wrapper around the Vercel AI SDK's generateText function.
 */
export async function generateText(params: {
  model: any;
  prompt?: string;
  messages?: any[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<{ text: string }> {
  return aiGenerateText(params);
}
