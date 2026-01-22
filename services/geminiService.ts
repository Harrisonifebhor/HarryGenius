
import { GoogleGenAI, Type } from "@google/genai";
import { Tone, ReplyLength } from "../types.ts";

export async function generateTwitterReply(
  tweetUrl: string,
  tone: Tone,
  length: ReplyLength,
  customPrompt?: string
): Promise<string> {
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
Rule: Just the text. No hashtags, no quotes.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
      },
    });

    return (response.text || '').trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Generation failed.");
  }
}

export async function generateBatchTwitterReplies(
  requests: { id: string, url: string }[],
  tone: Tone,
  length: ReplyLength,
  customPrompt?: string
): Promise<{ id: string, text: string }[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lengthPrompt = {
    [ReplyLength.SHORT]: "under 80 characters",
    [ReplyLength.MEDIUM]: "1-2 punchy sentences",
    [ReplyLength.LONG]: "3-4 sentences"
  }[length];

  const prompt = `You are an expert social media manager. Generate one unique, context-aware Twitter reply for EACH URL listed below.
  
Settings for ALL replies:
- Tone: ${tone}
- Length: ${lengthPrompt}
- Custom Instruction: ${customPrompt || 'None'}

Target URLs:
${requests.map(r => `- ID: ${r.id}, URL: ${r.url}`).join('\n')}

Output MUST be a JSON array of objects with "id" and "text" keys. No conversational filler.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The unique ID provided in the request" },
              text: { type: Type.STRING, description: "The generated Twitter reply text" },
            },
            required: ["id", "text"],
          },
        },
      },
    });

    const results = JSON.parse(response.text || '[]');
    return results;
  } catch (error) {
    console.error("Batch Generation Error:", error);
    throw new Error("Batch processing failed. The architect is overloaded.");
  }
}
