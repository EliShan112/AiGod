import "dotenv/config";
import axios from "axios";

const getOpenAiApiResponse = async (message: string) => {
try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-5-nano",
                messages: [
                    { 
                        role: "user",
                        content: message
                    }
                ]
            },
        {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`
                }
            }
        );
        return (response.data.choices[0].message.content);
    } catch (err: any) {
        console.error(err.response?.data || err.message);
        return null;
    }
}

export default getOpenAiApiResponse;