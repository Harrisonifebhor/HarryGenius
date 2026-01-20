
import { GoogleGenAI } from "@google/genai";
import { Tone, ReplyLength, GenerationSettings } from "../types.ts";

// Initialize the API client once, safely handling missing keys for UI-only testing
const apiKey = typeof process !== 'undefined' && process.env?.API_KEY ? process.env.API_KEY : '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateTwitterReply(
  tweetUrl: string,
  tone: Tone,
  length: ReplyLength,
  customPrompt?: string
): Promise<string> {
  if (!ai) {
    throw new Error("AI Client not initialized. API key missing.");
  }

  const lengthPrompt = {
    [ReplyLength.SHORT]: "under 80 characters.",
    [ReplyLength.MEDIUM]: "1-2 punchy sentences.",
    [ReplyLength.LONG]: "3-4 sentences with high detail."
  }[length];

  const customInstruction = customPrompt?.trim() 
    ? `Additional user instruction: ${customPrompt.trim()}`
    : "";

  const prompt = `Task: Write a Twitter (X) reply.
Context: Replying to a post at ${tweetUrl}.
Tone: ${tone}.
Constraint: ${lengthPrompt}.
${customInstruction}
Rule: No hashtags, no quotes, no conversational filler like "Here is your reply". Just the text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 1,
      },
    });

    return (response.text || '').trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Generation failed. Likely a network hiccup.");
  }
}
