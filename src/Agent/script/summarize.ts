/* eslint-disable no-unused-vars */
// import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"; // Replaced by OpenRouterService
import { SchemaType } from "@google/generative-ai"; // Keep SchemaType if it's used for defining schemas passed to OpenRouter
import logger from "../../config/logger";
import { generateContent as generateContentOpenRouter } from "../../services/OpenRouterService";
import { OPENROUTER_DEFAULT_MODEL } from "../../secret";

import dotenv from "dotenv";
dotenv.config();

// Removed geminiApiKeys array and currentApiKeyIndex, getNextApiKey as OpenRouter handles its own key.

function cleanTranscript(rawTranscript: string): string {
    // Remove music or any similar tags like [Music], [Applause], etc.
    const cleaned = rawTranscript.replace(/\[.*?\]/g, '');
    const decoded = cleaned.replace(/&amp;#39;/g, "'");
    return decoded;
}

// comment
const MainPrompt = "You are tasked with transforming the YouTube video transcript into a training-ready system prompt. The goal is to format the transcript into structured data without reducing its content, and prepare it for use in training another AI model.";

const getYouTubeTranscriptSchema = () => {
    return {
        description: `Transform the YouTube video transcript into a structured format, suitable for training another AI model. Ensure the content remains intact and is formatted correctly.`,
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                transcriptTitle: {
                    type: SchemaType.STRING,
                    description: "The title of the YouTube video transcript.",
                    nullable: false,
                },
                fullTranscript: {
                    type: SchemaType.STRING,
                    description: "The full, unaltered YouTube video transcript.",
                    nullable: false,
                },
                contentTokenCount: {
                    type: SchemaType.STRING,
                    description: "The total number of tokens in the full transcript.",
                    nullable: false,
                },
            },
            required: [
                "transcriptTitle",
                "fullTranscript",
                "contentTokenCount",
            ],
        },
    };
};

export async function generateTrainingPrompt(transcript: string, prompt: string = MainPrompt): Promise<any> {
    const schema = getYouTubeTranscriptSchema(); // Keep schema definition
    
    const cleanedTranscript = cleanTranscript(transcript);
    // Combine the prompt, title, and transcript for processing
    const combinedPrompt = `${prompt}\n\nVideo Transcript:\n${cleanedTranscript}`;
    
    // The modelId can be passed explicitly or use the default from secrets
    const modelId = OPENROUTER_DEFAULT_MODEL; // Or allow passing it as a parameter

    try {
        const data = await generateContentOpenRouter(combinedPrompt, modelId, { schema });

        if (!data) {
            logger.info("No response received from the AI model via OpenRouter for summarization. || Service Unavailable");
            return "Service unavailable or no data!";
        }
        return data;

    } catch (error) {
        logger.error(`Error in generateTrainingPrompt using OpenRouter: ${(error as Error).message}`);
        // The old error handling for API key rotation and specific Gemini errors is no longer directly applicable.
        // OpenRouterService's generateContent should handle basic API errors.
        // We might want to implement more specific retry logic here if needed, or let errors propagate.
        throw error; // Or return an error object
    }
}
