import axios from "axios";

// Define the shape of the object Gemini expects
interface IGeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const getGeminiResponse = async (message: string, history: IGeminiMessage[] = []) => {
  try {
    // Construct the full conversation payload
    // History comes first, then the new user message
    const conversation = [
      ...history, 
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: conversation
      }
    );

    return response.data.candidates[0].content.parts[0].text;

  } catch (err: any) {
    console.error("Gemini Error:", err.response?.data || err.message);
    return null;
  }
};

export default getGeminiResponse;