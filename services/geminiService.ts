/**
 * Mock Service for AI Response.
 * The external dependency @google/genai has been removed to ensure the app loads without API keys.
 */

/**
 * Gets a response from the "AI" (Mocked for now).
 * @param prompt The user's input.
 * @param role The role of the user (student or teacher).
 * @returns The AI's text response.
 */
export const getAiResponse = async (prompt: string, role: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
    return `Hello! I am NaviAI. I am currently running in offline mode, but I can help you navigate the KVISION platform.`;
  }

  if (lowerPrompt.includes("homework")) {
    return "To view or submit homework, please navigate to the 'Homework' section in your dashboard. Teachers can upload new assignments there.";
  }

  if (lowerPrompt.includes("syllabus") || lowerPrompt.includes("course")) {
    return "You can view your enrolled courses and syllabus details in the 'Classes' section of the dashboard.";
  }
  
  if (lowerPrompt.includes("help")) {
      return "I can help you with:\n\n* Finding your homework\n* Checking announcements\n* Navigating the dashboard\n\nWhat do you need assistance with?";
  }

  return "I'm currently in offline mode and cannot generate generative AI responses. Please contact the school administration for specific queries, or try navigating the dashboard menu.";
};
