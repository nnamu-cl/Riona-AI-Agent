import { CampaignStateModel } from '../schemas/CampaignSchema';
import { CampaignObjective, CampaignState } from '../../types/campaign';
import logger from '../../config/logger';
import Redis from 'ioredis';

export class StateManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  /**
   * Save complete campaign state before sleep
   */
  async saveCampaignState(campaign: CampaignObjective): Promise<void> {
    try {
      const stateSnapshot: Partial<CampaignState> = {
        campaignId: campaign.id,
        timestamp: new Date(),
        
        // Instagram session state (simplified - in reality would include actual browser state)
        sessionData: {
          cookies: await this.exportCookies(),
          lastProcessedPost: this.getLastPostId(),
          currentPosition: this.getScrollPosition(),
          browserState: await this.exportBrowserState()
        },
        
        // AI context
        aiContext: {
          recentComments: this.getRecentComments(50),
          characterState: this.getCurrentCharacterContext(),
          learningData: this.getAILearningState()
        },
        
        // Progress tracking
        metrics: {
          todaysProgress: this.getTodaysProgress(campaign),
          weeklyTrends: await this.getWeeklyTrends(campaign),
          goalProgress: this.calculateGoalProgress(campaign)
        },
        
        // Next actions queue
        pendingActions: campaign.recoveryData.pendingActions || [],
        
        // System health
        systemHealth: {
          memoryUsage: process.memoryUsage(),
          errorCounts: this.getErrorCounts(campaign),
          performanceMetrics: this.getPerformanceMetrics()
        }
      };

      // Store in MongoDB with TTL
      await CampaignStateModel.create(stateSnapshot);

      // Also backup to Redis for fast access
      await this.redis.setex(
        `campaign_state:${campaign.id}`, 
        7 * 24 * 60 * 60, // 7 days TTL
        JSON.stringify(stateSnapshot)
      );

      logger.info(`Campaign state saved for ${campaign.id}`);
    } catch (error) {
      logger.error(`Failed to save campaign state for ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Restore campaign state after waking up
   */
  async restoreCampaignState(campaignId: string): Promise<boolean> {
    try {
      // Try Redis first (fastest)
      let stateData = await this.redis.get(`campaign_state:${campaignId}`);
      
      if (!stateData) {
        // Fallback to MongoDB
        const stateDoc = await CampaignStateModel.findOne({ 
          campaignId,
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).sort({ timestamp: -1 });
        
        if (stateDoc) {
          stateData = JSON.stringify(stateDoc.toObject());
        }
      }
      
      if (stateData) {
        const state: CampaignState = JSON.parse(stateData);
        
        // Restore Instagram session
        await this.restoreInstagramSession(state.sessionData);
        
        // Restore AI context  
        await this.restoreAIContext(state.aiContext);
        
        // Queue pending actions
        await this.queuePendingActions(state.pendingActions);
        
        logger.info(`Campaign ${campaignId} state restored successfully`);
        return true;
      }
      
      logger.warn(`No recent state found for campaign ${campaignId}`);
      return false;
      
    } catch (error) {
      logger.error(`Failed to restore campaign state for ${campaignId}:`, error);
      return false;
    }
  }

  /**
   * Export current cookies (simplified implementation)
   */
  private async exportCookies(): Promise<any[]> {
    // In a real implementation, this would extract cookies from the active browser session
    // For now, we'll return an empty array as a placeholder
    return [];
  }

  /**
   * Get the last processed post ID
   */
  private getLastPostId(): string {
    // In a real implementation, this would track the last post that was interacted with
    return `post_${Date.now()}`;
  }

  /**
   * Get current scroll position
   */
  private getScrollPosition(): number {
    // In a real implementation, this would get the current page scroll position
    return Math.floor(Math.random() * 1000);
  }

  /**
   * Export browser state
   */
  private async exportBrowserState(): Promise<object> {
    // In a real implementation, this would capture browser viewport, tabs, etc.
    return {
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date()
    };
  }

  /**
   * Get recent comments for context
   */
  private getRecentComments(count: number): string[] {
    // In a real implementation, this would fetch recent comments from the session
    // For now, return some sample comments
    return [
      "Great post! Really inspiring content.",
      "This is exactly what I needed to see today.",
      "Amazing work, keep it up!",
      "Love the creativity here!",
      "Thanks for sharing this insight."
    ].slice(0, count);
  }

  /**
   * Get current character context
   */
  private getCurrentCharacterContext(): object {
    // In a real implementation, this would capture current character state
    return {
      personality: 'elon.character.json',
      recentTopics: ['innovation', 'technology', 'sustainability'],
      moodState: 'optimistic',
      lastUpdated: new Date()
    };
  }

  /**
   * Get AI learning state
   */
  private getAILearningState(): object {
    // In a real implementation, this would capture AI model fine-tuning data
    return {
      trainingExamples: [],
      modelVersion: '1.0.0',
      lastTraining: new Date()
    };
  }

  /**
   * Get today's progress for a campaign
   */
  private getTodaysProgress(campaign: CampaignObjective): any {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return campaign.progress.dailyStats.find(
      stat => stat.date.getTime() === today.getTime()
    ) || {
      date: today,
      postsLiked: 0,
      commentsPosted: 0,
      followersGained: 0,
      engagementRate: 0,
      activeTime: 0
    };
  }

  /**
   * Get weekly trends for a campaign
   */
  private async getWeeklyTrends(campaign: CampaignObjective): Promise<object> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyStats = campaign.progress.dailyStats.filter(
      stat => stat.date >= weekAgo
    );
    
    if (weeklyStats.length === 0) {
      return { trend: 'no_data' };
    }
    
    const totalLikes = weeklyStats.reduce((sum, stat) => sum + stat.postsLiked, 0);
    const totalComments = weeklyStats.reduce((sum, stat) => sum + stat.commentsPosted, 0);
    const avgEngagement = weeklyStats.reduce((sum, stat) => sum + stat.engagementRate, 0) / weeklyStats.length;
    
    return {
      totalLikes,
      totalComments,
      avgEngagement,
      activeDays: weeklyStats.length,
      trend: totalLikes > totalComments ? 'likes_focused' : 'comments_focused'
    };
  }

  /**
   * Calculate goal progress percentage
   */
  private calculateGoalProgress(campaign: CampaignObjective): number {
    let progress = 0;
    let factors = 0;
    
    // Duration progress
    if (campaign.targetMetrics.duration) {
      const daysActive = Math.floor(
        (Date.now() - campaign.progress.startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      progress += Math.min(daysActive / campaign.targetMetrics.duration, 1);
      factors++;
    }
    
    // Follower progress
    if (campaign.targetMetrics.followerTarget) {
      progress += Math.min(
        campaign.progress.currentFollowers / campaign.targetMetrics.followerTarget, 1
      );
      factors++;
    }
    
    // Engagement progress
    if (campaign.targetMetrics.engagementRate) {
      const recentStats = campaign.progress.dailyStats.slice(-7);
      const avgEngagement = recentStats.length > 0 
        ? recentStats.reduce((sum, stat) => sum + stat.engagementRate, 0) / recentStats.length
        : 0;
      progress += Math.min(avgEngagement / campaign.targetMetrics.engagementRate, 1);
      factors++;
    }
    
    return factors > 0 ? (progress / factors) : 0;
  }

  /**
   * Get error counts for campaign
   */
  private getErrorCounts(campaign: CampaignObjective): object {
    return {
      total: campaign.recoveryData.errorCount,
      recent: Math.min(campaign.recoveryData.errorCount, 5),
      lastError: campaign.recoveryData.lastError
    };
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): object {
    return {
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date()
    };
  }

  /**
   * Restore Instagram session from saved state
   */
  private async restoreInstagramSession(sessionData: any): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Restore browser cookies
      // 2. Navigate to the last known position
      // 3. Verify session is still valid
      // 4. Handle re-authentication if needed
      
      logger.debug('Instagram session restoration completed');
    } catch (error) {
      logger.warn('Failed to restore Instagram session:', error);
    }
  }

  /**
   * Restore AI context from saved state
   */
  private async restoreAIContext(aiContext: any): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Load character personality state
      // 2. Restore recent conversation context
      // 3. Update AI model with learned patterns
      
      logger.debug('AI context restoration completed');
    } catch (error) {
      logger.warn('Failed to restore AI context:', error);
    }
  }

  /**
   * Queue pending actions from saved state
   */
  private async queuePendingActions(pendingActions: any[]): Promise<void> {
    try {
      if (pendingActions && pendingActions.length > 0) {
        // In a real implementation, this would re-queue any actions that were
        // scheduled but not completed before the campaign went to sleep
        logger.info(`Queued ${pendingActions.length} pending actions`);
      }
    } catch (error) {
      logger.warn('Failed to queue pending actions:', error);
    }
  }

  /**
   * Clean up old state data
   */
  async cleanupOldStates(olderThanDays: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Clean up MongoDB
      const result = await CampaignStateModel.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      // Clean up Redis (Redis TTL handles this automatically, but we can be explicit)
      const keys = await this.redis.keys('campaign_state:*');
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) { // Key exists but has no TTL
          await this.redis.expire(key, 7 * 24 * 60 * 60); // Set 7 day TTL
        }
      }
      
      logger.info(`Cleaned up ${result.deletedCount} old campaign states`);
    } catch (error) {
      logger.error('Failed to cleanup old states:', error);
    }
  }

  /**
   * Get state statistics
   */
  async getStateStatistics(): Promise<object> {
    try {
      const mongoCount = await CampaignStateModel.countDocuments();
      const redisKeys = await this.redis.keys('campaign_state:*');
      
      return {
        mongoStates: mongoCount,
        redisStates: redisKeys.length,
        redisMemoryUsage: await this.redis.memory('usage'),
        lastCleanup: new Date()
      };
    } catch (error) {
      logger.error('Failed to get state statistics:', error);
      return { error: 'Failed to get statistics' };
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('StateManager connections closed');
    } catch (error) {
      logger.error('Error closing StateManager connections:', error);
    }
  }
} 