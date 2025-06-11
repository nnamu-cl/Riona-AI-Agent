import { FileState, GoogleAIFileManager } from "@google/generative-ai/server"; // Keep for file uploads to Google
import dotenv from "dotenv";
import fs from "fs";
import logger from "../../config/logger"; // Assuming logger exists
import { generateContent as generateContentOpenRouter } from "../../services/OpenRouterService";
import { OPENROUTER_DEFAULT_MODEL } from "../../secret";


dotenv.config();

// This API key is for GoogleAIFileManager
const googleFileManagerApiKey = process.env.GEMINI_API_KEY_41 as string;
if (!googleFileManagerApiKey) {
    // Consider logging this error with your logger if available
    console.error("Google File Manager API key (GEMINI_API_KEY_41) is missing for AIAudioFileService.");
    throw new Error("Google File Manager API key is missing");
}

export class AIAudioFileService {

    private fileManager: GoogleAIFileManager;
    // private genAI: GoogleGenerativeAI; // Removed, OpenRouterService will be used

    constructor() {
        this.fileManager = new GoogleAIFileManager(googleFileManagerApiKey);
        // this.genAI = new GoogleGenerativeAI(apiKey); // Removed
    }
    /**
     * Uploads the files to Google AIFileManager, then attempts to process with OpenRouter.
     * @param filePath - The local path of the file to upload.
     * @param displayName - The display name for the uploaded file.
     * @param mimeType - The MIME type of the file.
     */
    async processFile(filePath: string, displayName: string, mimeType: string): Promise<string> {
        let uploadedFileNameForCleanup: string | null = null;
        try {
            const uploadResult = await this.fileManager.uploadFile(filePath, {
                mimeType,
                displayName,
            });
            uploadedFileNameForCleanup = uploadResult.file.name;

            let file = await this.fileManager.getFile(uploadResult.file.name);

            // Wait for the file to be processed by Google
            while (file.state === FileState.PROCESSING) {
                process.stdout.write(".");
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                file = await this.fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === FileState.FAILED) {
                throw new Error("Google File Manager: File processing failed.");
            }

            // Generate content using OpenRouter
            // IMPORTANT: Passing a Google File URI to OpenRouter is unlikely to work directly.
            // The model via OpenRouter (e.g., google/gemini-flash-1.5) may not have access to this Google-internal URI.
            // A more robust solution would involve transcribing the audio first (e.g., using a dedicated service or another API call if the model supports transcription from URI)
            // and then sending the text transcript to OpenRouter.
            // For now, we construct a text prompt including the URI.
            const promptForOpenRouter = `Tell me about this audio clip. URI: ${uploadResult.file.uri}, MIME Type: ${uploadResult.file.mimeType}. If you cannot access the URI, please indicate that.`;
            
            logger.info(`Attempting to process audio via OpenRouter with prompt: "${promptForOpenRouter}"`);
            
            const modelId = OPENROUTER_DEFAULT_MODEL; // Or allow passing it as a parameter
            const textResponse = await generateContentOpenRouter(promptForOpenRouter, modelId);

            if (typeof textResponse !== 'string') {
                logger.warn('Received non-string response from OpenRouter for audio processing, converting to string.');
                return JSON.stringify(textResponse);
            }
            return textResponse;

        } catch (error) {
            logger.error(`Error in AIAudioFileService.processFile: ${(error as Error).message}`);
            // Rethrow or handle more gracefully
            throw error;
        } finally {
            // Delete the uploaded file from Google AI if it was uploaded
            if (uploadedFileNameForCleanup) {
                try {
                    await this.fileManager.deleteFile(uploadedFileNameForCleanup);
                    logger.info(`Cleaned up Google AI File: ${displayName} (Name: ${uploadedFileNameForCleanup})`);
                } catch (cleanupError) {
                    logger.error(`Failed to cleanup Google AI File ${displayName} (Name: ${uploadedFileNameForCleanup}): ${(cleanupError as Error).message}`);
                }
            }
            // Delete the temporary file from the local server
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}
