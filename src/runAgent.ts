// src/runAgent.ts
import { runAgent } from './Agent/index';
import { getInstagramCommentSchema } from './Agent/schema';
import logger from './config/logger';

async function main() {
    try {
        logger.info("Starting runAgent test...");
        
        // Use the existing Instagram comment schema
        const schema = getInstagramCommentSchema();

        const samplePrompt = `Generate engaging Instagram comments for a post about AI technology.
        The comments should be friendly, informative, and have high viral potential.
        Create comments that are between 150-250 characters and would encourage engagement.`;

        const result = await runAgent(schema, samplePrompt);
        
        logger.info("runAgent test completed successfully!");
        console.log("Result from runAgent:");
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        logger.error("Error in runAgent test:", error);
        if (error instanceof Error && error.cause) {
            logger.error("Cause:", error.cause);
        }
    }
}

main().catch(e => {
    logger.error("Unhandled error in runAgent test:", e);
    process.exit(1);
});