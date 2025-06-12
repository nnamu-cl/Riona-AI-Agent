import dotenv from 'dotenv';
import { runInstagramWithTracking } from './client/InstagramWithTracking';
import logger from './config/logger';

// Load environment variables from .env file
dotenv.config();

async function testInstagramLogin() {
    const testAgentId = 'local-test-agent-001';
    logger.info(`Starting Instagram login test for agent ID: ${testAgentId}`);

    // Basic config for testing login, disabling interactions to speed up the test.
    // Set headless to false in InstagramWithTracking.ts (line 55) if you want to see the browser.
    // Default is already headless: false in the current code.
    const testConfig = {
        max_posts: 1, // Interact with only 1 post to quickly test the flow after login
        delay_ms: 1000,
        comment_enabled: false, // Disable comments for a quicker login test
        like_enabled: false     // Disable likes for a quicker login test
    };

    try {
        // Initialize agent tracking first
        const { ActivityLogger } = await import('./services/ActivityLogger');
        await ActivityLogger.initializeAgent(testAgentId);

        await runInstagramWithTracking(testAgentId, testConfig);
        logger.info(`Instagram login test completed for agent ID: ${testAgentId}`);
    } catch (error) {
        logger.error(`Error during Instagram login test for agent ID: ${testAgentId}`, error);
    }
}

testInstagramLogin();