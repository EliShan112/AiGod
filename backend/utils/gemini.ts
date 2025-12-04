import axios from "axios";

const getGeminiResponse = async (message: string) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: message }
            ]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;

  } catch (err: any) {
    console.error("Gemini Error:", err.response?.data || err.message);
    return null;
  }
};

export default getGeminiResponse;
