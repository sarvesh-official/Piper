import dotenv from "dotenv";

dotenv.config();

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

export const DEFAULT_LLM_MODEL = "llama-3.3-70b-versatile";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generate text using Groq's OpenAI-compatible REST API.
 * No SDK dependency — just fetch().
 * Supports both `messages` (array) and `prompt` (string) params.
 */
export async function generateText(params: {
  messages?: any[];
  prompt?: string;
  maxOutputTokens?: number;
  temperature?: number;
  model?: string;
}): Promise<{ text: string }> {
  const model = params.model || DEFAULT_LLM_MODEL;

  const messages = params.messages || [
    { role: "user" as const, content: params.prompt || "" },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: params.maxOutputTokens || 2048,
      temperature: params.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  return { text };
}

/**
 * Returns the model name for use with generateText.
 * Kept for backward compatibility with callers that use getModel().
 */
export async function getModel(modelName: string = DEFAULT_LLM_MODEL) {
  return modelName;
}
