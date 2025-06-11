import axios, { AxiosError } from 'axios';
import logger from '../config/logger';
import {
    OPENROUTER_API_KEY,
    OPENROUTER_APP_NAME,
    OPENROUTER_DEFAULT_MODEL,
    OPENROUTER_SITE_URL
} from '../secret';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    // Add other OpenRouter parameters as needed, e.g., temperature, max_tokens
    // For JSON mode with compatible models:
    // response_format?: { type: "json_object" }; 
    // stream?: boolean;
}

interface OpenRouterChoice {
    message: {
        role: string;
        content: string | null;
    };
    // Add other fields like finish_reason, index etc.
}

interface OpenRouterResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenRouterChoice[];
    // Add usage, system_fingerprint etc.
}

interface GenerateContentOptions {
    schema?: any; // For structured output, similar to GoogleGenerativeAI's responseSchema
    // Add other options like temperature, maxTokens etc. to be passed to OpenRouter
}

export async function generateContent(
    prompt: string,
    modelId?: string,
    options?: GenerateContentOptions
): Promise<any> {
    if (!OPENROUTER_API_KEY) {
        logger.error('OpenRouter API key is not configured.');
        throw new Error('OpenRouter API key is not configured.');
    }

    const targetModel = modelId || OPENROUTER_DEFAULT_MODEL;

    const messages: OpenRouterMessage[] = [{ role: 'user', content: prompt }];
    
    // If a schema is provided, we might want to add a system prompt 
    // or use model-specific features for JSON output if OpenRouter/model supports it.
    // This part will require more specific handling based on model capabilities.
    if (options?.schema) {
        // Example: Add a system message to guide the model for JSON output
        // This is a generic approach; specific models might have better ways (e.g. OpenAI's JSON mode)
        messages.unshift({ 
            role: 'system', 
            content: `Please provide the output in a valid JSON format that adheres to the following schema: ${JSON.stringify(options.schema)}. Only output the JSON.` 
        });
    }

    const requestPayload: OpenRouterRequest = {
        model: targetModel,
        messages: messages,
    };

    // For models that support OpenAI-like JSON mode via response_format
    // if (options?.schema && (targetModel.includes("gpt-") || targetModel.includes("openai/"))) { // Example check
    //     requestPayload.response_format = { type: "json_object" };
    // }

    try {
        logger.info(`Sending request to OpenRouter with model: ${targetModel}`);
        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            requestPayload,
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': OPENROUTER_SITE_URL,
                    'X-Title': OPENROUTER_APP_NAME,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const messageContent = response.data.choices[0].message.content;
            if (messageContent) {
                if (options?.schema) {
                    try {
                        // Clean the response to extract JSON from markdown code blocks if present
                        let cleanedContent = messageContent.trim();
                        
                        // Remove markdown code block markers if present
                        if (cleanedContent.startsWith('```json')) {
                            cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                        } else if (cleanedContent.startsWith('```')) {
                            cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                        }
                        
                        // Attempt to parse the cleaned JSON
                        return JSON.parse(cleanedContent);
                    } catch (parseError) {
                        logger.error('Failed to parse OpenRouter response as JSON:', parseError);
                        logger.warn('Raw response from OpenRouter:', messageContent);
                        // Fallback to returning raw text if JSON parsing fails but schema was expected
                        // Or throw a more specific error
                        throw new Error('Failed to parse model response into expected JSON schema.');
                    }
                }
                return messageContent; // Return raw text if no schema
            }
        }
        logger.warn('OpenRouter response did not contain expected content.', response.data);
        throw new Error('No content received from OpenRouter model.');

    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.isAxiosError && axiosError.response) {
            logger.error('Error response from OpenRouter API:', {
                status: axiosError.response.status,
                data: axiosError.response.data,
            });
            throw new Error(`OpenRouter API error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        } else {
            logger.error('Error calling OpenRouter API:', error);
            throw new Error(`Failed to communicate with OpenRouter: ${ (error as Error).message }`);
        }
    }
}