// src/runSummarize.ts
import { generateTrainingPrompt } from './Agent/script/summarize';
import logger from './config/logger'; // Assuming your logger is at src/config/logger.ts

async function main() {
    const sampleTranscript = `
    Hello everyone, and welcome to the channel. Today we're talking about AI.
    AI is a rapidly evolving field with many exciting developments.
    One of the key areas is large language models.
    These models can understand and generate human-like text.
    Thanks for watching!
    `;

    // You can customize the main prompt if needed, otherwise it uses the default from summarize.ts
    // const customPrompt = "Your custom main prompt here...";

    try {
        logger.info("Starting summarization process via runSummarize.ts...");
        // const result = await generateTrainingPrompt(sampleTranscript, customPrompt);
        const result = await generateTrainingPrompt(sampleTranscript);
        logger.info("Summarization Result from runSummarize.ts:");
        // Using console.log for potentially large JSON output, as logger might truncate or format it differently.
        console.log(JSON.stringify(result, null, 2)); 
    } catch (error) {
        logger.error("Error running summarization script from runSummarize.ts:", error);
        if (error instanceof Error && error.cause) {
            logger.error("Cause:", error.cause);
        }
    }
}

main().catch(e => {
    logger.error("Unhandled error in runSummarize.ts main function:", e);
    process.exit(1);
});