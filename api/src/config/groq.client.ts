import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not set. AI extraction will fail.");
}

export const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});