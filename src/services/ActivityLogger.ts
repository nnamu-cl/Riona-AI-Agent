import { supabaseService } from './supabase';
import logger from '../config/logger';

export interface ActivityMetadata {
  post_index?: number;
  post_caption?: string;
  comment?: string;
  viral_rate?: number;
  token_count?: number;
  error_message?: string;
  response_time_ms?: number;
  already_liked?: boolean;
  [key: string]: any;
}

/**
 * Simple activity logger that appends actions to agent_tracking table
 */
export class ActivityLogger {
  
  /**
   * Log a single activity for an agent
   */
  static async logActivity(
    agentId: string,
    action: string,
    success: boolean,
    metadata: ActivityMetadata = {}
  ): Promise<void> {
    try {
      const activityEntry = {
        action,
        success,
        timestamp: new Date().toISOString(),
        metadata
      };

      // Get current record first
      const existing = await supabaseService.select('agent_tracking', {
        filters: { agent_id: agentId },
        limit: 1
      });

      if (existing.length > 0) {
        const currentLog = existing[0].activity_log || [];
        const updatedLog = [...currentLog, activityEntry];
        
        // Update with new activity log
        await supabaseService.update('agent_tracking',
          {
            activity_log: updatedLog,
            total_actions: (existing[0].total_actions || 0) + 1,
            updated_at: new Date().toISOString()
          },
          { agent_id: agentId }
        );

        logger.info(`Activity logged for agent ${agentId}: ${action} - ${success ? 'SUCCESS' : 'FAILED'}`);
      } else {
        logger.warn(`No agent tracking record found for agent ${agentId}`);
      }
      
    } catch (error) {
      logger.error(`Failed to log activity for agent ${agentId}:`, error);
      // Don't throw error - agent should continue even if logging fails
    }
  }

  /**
   * Initialize agent tracking record
   */
  static async initializeAgent(agentId: string): Promise<void> {
    try {
      // Check if record exists
      const existing = await supabaseService.select('agent_tracking', {
        filters: { agent_id: agentId },
        limit: 1
      });

      if (existing.length === 0) {
        // Create new record
        await supabaseService.insert('agent_tracking', {
          agent_id: agentId,
          status: 'active',
          started_at: new Date().toISOString(),
          activity_log: [],
          total_actions: 0
        });
      } else {
        // Update existing record
        await supabaseService.update('agent_tracking', 
          { 
            status: 'active', 
            started_at: new Date().toISOString() 
          },
          { agent_id: agentId }
        );
      }

      logger.info(`Agent tracking initialized for agent ${agentId}`);
    } catch (error) {
      logger.error(`Failed to initialize agent tracking for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Stop agent tracking
   */
  static async stopAgent(agentId: string): Promise<void> {
    try {
      await supabaseService.update('agent_tracking',
        { 
          status: 'stopped', 
          stopped_at: new Date().toISOString() 
        },
        { agent_id: agentId }
      );

      logger.info(`Agent tracking stopped for agent ${agentId}`);
    } catch (error) {
      logger.error(`Failed to stop agent tracking for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get agent status
   */
  static async getAgentStatus(agentId?: string): Promise<any> {
    try {
      const filters = agentId ? { agent_id: agentId } : {};
      const tracking = await supabaseService.select('agent_tracking', {
        filters,
        limit: 1,
        orderBy: { column: 'updated_at', ascending: false }
      });

      return tracking[0] || { status: 'stopped', total_actions: 0 };
    } catch (error) {
      logger.error(`Failed to get agent status:`, error);
      return { status: 'error', total_actions: 0 };
    }
  }
}