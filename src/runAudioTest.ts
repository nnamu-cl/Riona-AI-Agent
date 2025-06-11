// src/runAudioTest.ts
import { AIAudioFileService } from './Agent/training/TrainWithAudio';
import logger from './config/logger';
import path from 'path';
import fs from 'fs';

async function main() {
    try {
        logger.info("Starting Audio processing test...");
        
        // Check if the sample audio file exists
        const audioFileName = "LilTjay.mp3";
        const audioFilePath = path.resolve(__dirname, "Agent/training/sample", audioFileName);
        
        if (!fs.existsSync(audioFilePath)) {
            logger.warn(`Sample audio file not found at: ${audioFilePath}`);
            logger.info("You can test this by placing an audio file (mp3, wav, etc.) in src/Agent/training/sample/");
            logger.info("Or modify this script to point to an existing audio file on your system.");
            return;
        }

        logger.info(`Found audio file: ${audioFilePath}`);
        
        // Create an instance of the audio service
        const audioService = new AIAudioFileService();
        
        // Process the audio file
        const result = await audioService.processFile(
            audioFilePath,
            "Test Audio Sample",
            "audio/mpeg" // Adjust MIME type based on your file
        );
        
        logger.info("Audio processing test completed successfully!");
        console.log("Result from audio processing:");
        console.log(result);
        
    } catch (error) {
        logger.error("Error in audio processing test:", error);
        if (error instanceof Error && error.cause) {
            logger.error("Cause:", error.cause);
        }
    }
}

main().catch(e => {
    logger.error("Unhandled error in audio processing test:", e);
    process.exit(1);
});