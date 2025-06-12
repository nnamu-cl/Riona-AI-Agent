import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Replaced by OpenRouterService
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { generateContent as generateContentOpenRouter } from "../../../services/OpenRouterService";
import { OPENROUTER_DEFAULT_MODEL } from "../../../secret";
import logger from "../../../config/logger"; // Assuming logger is available

dotenv.config();

// This API key is for GoogleAIFileManager
const googleFileManagerApiKey = process.env.GEMINI_API_KEY_41;
if (!googleFileManagerApiKey) {
  // Use logger if available, otherwise console.error
  const errorMsg = "Google File Manager API key (GEMINI_API_KEY_41) is missing for Audio.ts sample.";
  if (logger) logger.error(errorMsg); else console.error(errorMsg);
  throw new Error("Google File Manager API key is missing");
}

const fileManager = new GoogleAIFileManager(googleFileManagerApiKey);

// Function to upload, process, and delete the audio file with support for various formats
const processAudioFile = async (fileName: string): Promise<void> => {
  let uploadedFileNameForCleanup: string | null = null;
  try {
    // Resolve the file path relative to the project root
    const filePath = path.resolve(__dirname, fileName);

    // Check if the file exists at the resolved path
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get MIME type of the file based on the extension
    const mimeType = mime.lookup(filePath);
    if (!mimeType || !mimeType.startsWith("audio/")) {
      throw new Error("Invalid audio file format.");
    }

    // Upload the audio file with the correct MIME type
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: "Audio sample",
    });
    uploadedFileNameForCleanup = uploadResult.file.name;

    let file = await fileManager.getFile(uploadResult.file.name);

    // Wait for the audio file to be processed
    while (file.state === FileState.PROCESSING) {
      process.stdout.write(".");
      // Sleep for 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      // Fetch the file from the API again
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Google File Manager: Audio processing failed.");
    }

    // Log the uploaded file URI
    const logMsg = `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`;
    if (logger) logger.info(logMsg); else console.log(logMsg);
    

    // Generate content using OpenRouter
    // IMPORTANT: Passing a Google File URI to OpenRouter is unlikely to work directly.
    const promptForOpenRouter = `Generate a transcript of the audio. URI: ${uploadResult.file.uri}, MIME Type: ${uploadResult.file.mimeType}. If you cannot access the URI, please indicate that.`;
    
    const modelId = OPENROUTER_DEFAULT_MODEL;
    const textResponse = await generateContentOpenRouter(promptForOpenRouter, modelId);

    // Log the response
    if (logger) logger.info("OpenRouter Response:", textResponse); else console.log(textResponse);


  } catch (error) {
    const errorMsg = `Error processing audio file in sample: ${(error as Error).message}`;
    if (logger) logger.error(errorMsg); else console.error(errorMsg);
  } finally {
     // Delete the uploaded file after processing
    if (uploadedFileNameForCleanup) {
        try {
            await fileManager.deleteFile(uploadedFileNameForCleanup);
            const deleteMsg = `Deleted ${uploadedFileNameForCleanup} from Google AI File Manager.`;
            if (logger) logger.info(deleteMsg); else console.log(deleteMsg);
        } catch (cleanupError) {
            const cleanupErrorMsg = `Failed to delete ${uploadedFileNameForCleanup} from Google AI File Manager: ${(cleanupError as Error).message}`;
            if (logger) logger.error(cleanupErrorMsg); else console.error(cleanupErrorMsg);
        }
    }
  }
};

// Example usage: Call the function with the correct file name relative to the project root
processAudioFile("LilTjay.mp3").catch((error) => {
  console.error("An error occurred:", error);
});
