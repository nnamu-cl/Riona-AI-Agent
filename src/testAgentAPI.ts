// Test script for the Agent API
import axios from 'axios';
import logger from './config/logger';

const API_BASE = 'http://localhost:3000/api/agent';

// Test data
const TEST_AGENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // Example UUID
const TEST_CONFIG = {
  max_posts: 5,
  delay_ms: 3000,
  comment_enabled: true,
  like_enabled: true
};

async function testAgentAPI() {
  try {
    logger.info('Starting Agent API tests...');

    // Test 1: Get initial status (should show no agent running)
    logger.info('Test 1: Getting initial status...');
    const initialStatus = await axios.get(`${API_BASE}/status`);
    logger.info('Initial status:', initialStatus.data);

    // Test 2: Start an agent
    logger.info('Test 2: Starting agent...');
    const startResponse = await axios.post(`${API_BASE}/start`, {
      agent_id: TEST_AGENT_ID,
      config: TEST_CONFIG
    });
    logger.info('Start response:', startResponse.data);

    // Test 3: Get status while agent is running
    logger.info('Test 3: Getting status while agent is running...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const runningStatus = await axios.get(`${API_BASE}/status`);
    logger.info('Running status:', runningStatus.data);

    // Test 4: Try to start another agent (should fail)
    logger.info('Test 4: Trying to start another agent (should fail)...');
    try {
      const duplicateStart = await axios.post(`${API_BASE}/start`, {
        agent_id: 'another-agent-id',
        config: {}
      });
      logger.warn('Unexpected success:', duplicateStart.data);
    } catch (error: any) {
      if (error.response?.status === 409) {
        logger.info('Expected conflict error:', error.response.data);
      } else {
        logger.error('Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 5: Wait a bit to see some activity logs
    logger.info('Test 5: Waiting 10 seconds to see activity logs...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const statusWithLogs = await axios.get(`${API_BASE}/status`);
    logger.info('Status with activity logs:', statusWithLogs.data);

    // Test 6: Stop the agent
    logger.info('Test 6: Stopping agent...');
    const stopResponse = await axios.post(`${API_BASE}/stop`);
    logger.info('Stop response:', stopResponse.data);

    // Test 7: Get final status
    logger.info('Test 7: Getting final status...');
    const finalStatus = await axios.get(`${API_BASE}/status`);
    logger.info('Final status:', finalStatus.data);

    // Test 8: Try to stop when no agent is running (should fail)
    logger.info('Test 8: Trying to stop when no agent is running (should fail)...');
    try {
      const duplicateStop = await axios.post(`${API_BASE}/stop`);
      logger.warn('Unexpected success:', duplicateStop.data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('Expected error:', error.response.data);
      } else {
        logger.error('Unexpected error:', error.response?.data || error.message);
      }
    }

    logger.info('All Agent API tests completed!');

  } catch (error: any) {
    logger.error('Test failed:', error.response?.data || error.message);
  }
}

// Test with different configurations
async function testDifferentConfigs() {
  logger.info('Testing different configurations...');

  const configs = [
    { max_posts: 2, delay_ms: 1000, comment_enabled: false, like_enabled: true },
    { max_posts: 3, delay_ms: 2000, comment_enabled: true, like_enabled: false },
    {} // Default config
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      logger.info(`Testing config ${i + 1}:`, configs[i]);
      
      const startResponse = await axios.post(`${API_BASE}/start`, {
        agent_id: `test-agent-${i + 1}`,
        config: configs[i]
      });
      
      logger.info(`Config ${i + 1} start response:`, startResponse.data);
      
      // Let it run for a few seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Stop it
      const stopResponse = await axios.post(`${API_BASE}/stop`);
      logger.info(`Config ${i + 1} stop response:`, stopResponse.data);
      
      // Wait before next test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      logger.error(`Config ${i + 1} test failed:`, error.response?.data || error.message);
    }
  }
}

// Main test function
async function runAllTests() {
  try {
    // Basic API tests
    await testAgentAPI();
    
    // Wait a bit between test suites
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Configuration tests
    await testDifferentConfigs();
    
    logger.info('🎉 All tests completed successfully!');
    
  } catch (error) {
    logger.error('Test suite failed:', error);
  }
}

// Helper function to check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_BASE}/status`);
    logger.info('✅ Server is running and responsive');
    return true;
  } catch (error) {
    logger.error('❌ Server is not running. Please start the server first with: npm start');
    return false;
  }
}

// Run tests if server is healthy
async function main() {
  logger.info('🚀 Starting Agent API Test Suite...');
  
  const serverHealthy = await checkServerHealth();
  if (serverHealthy) {
    await runAllTests();
  } else {
    logger.error('Please start the server first and then run this test script.');
    process.exit(1);
  }
}

// Export for use in other scripts
export { testAgentAPI, testDifferentConfigs, checkServerHealth };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Test script failed:', error);
    process.exit(1);
  });
}