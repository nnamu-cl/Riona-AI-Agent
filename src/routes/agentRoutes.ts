import { Router, Request, Response } from 'express';
import { ActivityLogger } from '../services/ActivityLogger';
import logger from '../config/logger';

const router = Router();

// Global variable to track running agent
let currentAgentId: string | null = null;
let shouldStopAgent = false;

// Forward declaration - will be implemented in step 3
declare function runInstagramWithTracking(agentId: string, config: any): Promise<void>;

/**
 * Start an agent
 * POST /api/agent/start
 * Body: { agent_id: "uuid", config: {...} }
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { agent_id, config = {} } = req.body;

    if (!agent_id) {
      res.status(400).json({
        success: false,
        error: 'agent_id is required'
      });
      return;
    }

    // Check if an agent is already running
    if (currentAgentId) {
      res.status(409).json({
        success: false,
        error: 'Another agent is already running',
        current_agent_id: currentAgentId
      });
      return;
    }

    // Initialize agent tracking
    await ActivityLogger.initializeAgent(agent_id);
    
    // Set current agent
    currentAgentId = agent_id;
    shouldStopAgent = false;

    // Start the Instagram agent in background
    runInstagramWithTracking(agent_id, config).catch((error: any) => {
      logger.error(`Instagram agent error for ${agent_id}:`, error);
      currentAgentId = null;
      ActivityLogger.stopAgent(agent_id);
    });

    logger.info(`Agent ${agent_id} started with config:`, config);

    res.json({
      success: true,
      agent_id,
      status: 'active',
      config
    });

  } catch (error) {
    logger.error('Error starting agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start agent'
    });
  }
});

/**
 * Get agent status
 * GET /api/agent/status
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await ActivityLogger.getAgentStatus(currentAgentId || undefined);
    
    res.json({
      agent_id: currentAgentId,
      ...status,
      is_running: currentAgentId !== null
    });

  } catch (error) {
    logger.error('Error getting agent status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get agent status' 
    });
  }
});

/**
 * Stop the current agent
 * POST /api/agent/stop
 */
router.post('/stop', async (_req: Request, res: Response) => {
  try {
    if (!currentAgentId) {
      res.status(400).json({
        success: false,
        error: 'No agent is currently running'
      });
      return;
    }

    // Set stop flag
    shouldStopAgent = true;
    
    // Update database
    await ActivityLogger.stopAgent(currentAgentId);
    
    const stoppedAgentId = currentAgentId;
    currentAgentId = null;

    logger.info(`Agent ${stoppedAgentId} stop requested`);

    res.json({
      success: true,
      agent_id: stoppedAgentId,
      stopped_at: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error stopping agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop agent'
    });
  }
});

// Export the stop flag checker
export const shouldStop = () => shouldStopAgent;
export const getCurrentAgentId = () => currentAgentId;
export const setCurrentAgentId = (agentId: string | null) => { currentAgentId = agentId; };

export default router;