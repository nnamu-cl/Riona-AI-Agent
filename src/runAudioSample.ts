// src/runAudioSample.ts
import logger from './config/logger';

async function main() {
    try {
        logger.info("Starting Audio sample script test...");
        logger.info("This will run the existing Audio.ts sample script with OpenRouter integration.");
        
        // Import and run the existing sample script
        // The Audio.ts file already has execution logic at the bottom
        await import('./Agent/training/sample/Audio');
        
        logger.info("Audio sample script test completed!");
        
    } catch (error) {
        logger.error("Error in audio sample script test:", error);
        if (error instanceof Error && error.cause) {
            logger.error("Cause:", error.cause);
        }
    }
}

main().catch(e => {
    logger.error("Unhandled error in audio sample script test:", e);
    process.exit(1);
});