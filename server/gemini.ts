// Referenced from javascript_gemini blueprint
import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function summarizeEmail(emailContent: string): Promise<string> {
  const prompt = `Analyze this email and provide a concise summary with key points. Also extract any meeting details (date, time, location, attendees) if present:\n\n${emailContent}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
  return text || "Could not generate summary";
}

export async function extractMeetingDetails(emailContent: string): Promise<any> {
  try {
    const systemPrompt = `You are an expert at extracting meeting information from emails. 
Extract meeting details and return JSON with these fields:
- date (string, e.g., "January 15, 2025")
- time (string, e.g., "2:00 PM - 3:00 PM")
- location (string, physical location or meeting link)
- attendees (array of strings, participant names)
Return null for any field not found. If no meeting is detected, return an empty object.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: emailContent,
    });

    const rawJson = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return Object.keys(data).length > 0 ? data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to extract meeting details:", error);
    return null;
  }
}

export async function analyzeEmailPriority(subject: string, snippet: string): Promise<"high" | "medium" | "low"> {
  try {
    const systemPrompt = `You are an email priority analyzer. Analyze the email and classify its priority as "high", "medium", or "low" based on urgency, importance, and action requirements.

High priority: Urgent deadlines, critical issues, action required, executive requests
Medium priority: Meetings, scheduled events, routine follow-ups, information requests  
Low priority: Newsletters, notifications, non-urgent updates

Return only one word: "high", "medium", or "low"`;

    const prompt = `Subject: ${subject}\nPreview: ${snippet}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    const priority = rawText?.trim().toLowerCase();
    
    if (priority === "high" || priority === "medium" || priority === "low") {
      return priority as "high" | "medium" | "low";
    }

    // Fallback to heuristic if AI response is unexpected
    const text = `${subject} ${snippet}`.toLowerCase();
    if (text.includes("urgent") || text.includes("asap") || text.includes("critical")) {
      return "high";
    }
    if (text.includes("meeting") || text.includes("schedule")) {
      return "medium";
    }
    return "low";
  } catch (error) {
    console.error("Priority analysis error:", error);
    return "low";
  }
}

export async function detectTasks(emailContent: string): Promise<string[]> {
  try {
    const systemPrompt = `You are a task detection expert. Analyze this email and extract action items or tasks.
Return a JSON array of task strings. Each task should be clear and actionable.
If no tasks are found, return an empty array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" },
        },
      },
      contents: emailContent,
    });

    const rawJson = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    return [];
  } catch (error) {
    console.error("Failed to detect tasks:", error);
    return [];
  }
}

export async function chatWithAI(message: string, context?: any): Promise<string> {
  try {
    let prompt = message;
    
    if (context) {
      prompt = `Context: ${JSON.stringify(context)}\n\nUser question: ${message}\n\nProvide a helpful response based on the context.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    return text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("AI chat error:", error);
    return "I'm experiencing technical difficulties. Please try again.";
  }
}
