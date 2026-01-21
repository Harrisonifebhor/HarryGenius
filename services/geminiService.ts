
import { GoogleGenAI } from "@google/genai";
import { Tone, ReplyLength } from "../types.ts";

export async function generateTwitterReply(
  tweetUrl: string,
  tone: Tone,
  length: ReplyLength,
  customPrompt?: string
): Promise<string> {
  // Initialize the API client inside the function to avoid top-level ReferenceErrors
  // and ensure the app UI loads even if the API key is not immediately available.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    throw new Error("Generation failed. The architect encountered a data storm. Please check the post URL or try again later.");
  }
}
