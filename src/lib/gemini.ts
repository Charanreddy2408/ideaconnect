/**
 * Server-side only. Call Gemini API with your key from env (GEMINI_API_KEY).
 * Use from API routes, never expose the key to the client.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.0-flash";

export type GeminiGenerateOptions = {
  model?: string;
  apiKey?: string;
};

export async function geminiGenerateContent(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string> {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = options.model || DEFAULT_MODEL;
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`Gemini API error (${res.status}): ${msg}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return text;
}
