import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gets a response from the Gemini AI.
 * @param prompt The user's input.
 * @param role The role of the user (student or teacher).
 * @returns The AI's text response.
 */
export const getAiResponse = async (prompt: string, role: string): Promise<string> => {
  try {
    // Check both process.env (Node/Standard) and import.meta.env (Vite)
    // We use 'any' casting to avoid TypeScript errors in environments where one might be missing.
    let apiKey = '';
    
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
    } else if ((import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
        apiKey = (import.meta as any).env.VITE_API_KEY;
    }

    if (!apiKey) {
        console.warn("Gemini API Key is missing");
        return "The AI service is currently unavailable. Please check the API Key configuration.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Construct a role-specific system instruction
    let systemInstruction = "You are a helpful AI assistant for the KVISION school management platform.";
    if (role === 'student') {
        systemInstruction += " You are a study assistant. Help the student with homework, concepts, and organization. Keep answers concise and encouraging.";
    } else if (role === 'teacher') {
        systemInstruction += " You are a teaching assistant. Help with lesson planning, grading rubrics, and classroom management tips.";
    } else if (role === 'admin') {
        systemInstruction += " You are an administrative assistant. Help with drafting notices and organizing school data.";
    }

    // Use gemini-1.5-flash which is generally available and fast
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please try again later.";
  }
};