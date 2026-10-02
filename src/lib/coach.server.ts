import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function runCoach(prompt: string, system: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown = null;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system,
    prompt,
    onError: ({ error }) => { failure = error; },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (failure) {
    const e = failure as { statusCode?: number; message?: string };
    if (e.statusCode === 429) throw new Error("AI is rate limited right now. Please try again in a minute.");
    if (e.statusCode === 402) throw new Error("AI credits are exhausted for this workspace.");
    throw new Error(e.message || "AI analysis failed.");
  }
  if (!text.trim()) throw new Error("The AI returned no analysis.");
  return text;
}
