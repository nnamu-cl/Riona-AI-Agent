import { Queue, Worker, Job } from 'bullmq';
import { Campaign, CampaignStateModel } from '../schemas/CampaignSchema';
import { CampaignObjective, InteractionResult, SessionConfig } from '../../types/campaign';
import { SleepScheduler } from './SleepScheduler';
import { StateManager } from './StateManager';
import { runInstagram } from '../../client/Instagram';
import { runAgent } from '../../Agent';
import { getInstagramCommentSchema } from '../../Agent/schema';
import logger from '../../config/logger';

export class CampaignOrchestrator {
  private campaignQueue: Queue;
  private sleepQueue: Queue;
  private worker: Worker;
  private sleepWorker: Worker;
  private sleepScheduler: SleepScheduler;
  private stateManager: StateManager;
  private isShuttingDown: boolean = false;

  constructor() {
    // Redis connection configuration
    const redisConnection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    };

    // Initialize queues
    this.campaignQueue = new Queue('campaign-execution', { 
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: 'exponential',
        removeOnComplete: 5,
        removeOnFail: 10
      }
    });

    this.sleepQueue = new Queue('sleep-scheduler', { 
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: 'exponential',
        removeOnComplete: 1,
        removeOnFail: 5
      }
    });

    this.sleepScheduler = new SleepScheduler();
    this.stateManager = new StateManager();

    this.setupWorkers();
  }

  /**
   * Schedule a campaign to start execution
   */
  async scheduleCampaign(campaign: CampaignObjective): Promise<void> {
    try {
      logger.info(`Scheduling campaign: ${campaign.name} (${campaign.id})`);

      // Update campaign status
      campaign.status = 'active';
      campaign.schedule.currentPhase = 'active';
      await this.updateCampaignDatabase(campaign);

      // Add immediate execution job
      await this.campaignQueue.add('execute-campaign-phase', {
        campaignId: campaign.id,
        phase: 'active'
      });

      logger.info(`Campaign ${campaign.id} scheduled successfully`);
    } catch (error) {
      logger.error(`Failed to schedule campaign ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Put campaign to sleep for extended period
   */
  async scheduleSleep(campaign: CampaignObjective): Promise<void> {
    try {
      const nextSleepTime = this.sleepScheduler.calculateNextSleepTime(campaign);
      const wakeupTime = this.sleepScheduler.calculateWakeupTime(campaign, nextSleepTime);

      // Save current state before sleeping
      await this.stateManager.saveCampaignState(campaign);

      // Update campaign schedule
      campaign.schedule.currentPhase = 'sleeping';
      campaign.schedule.nextWakeup = wakeupTime;
      campaign.schedule.nextSleep = nextSleepTime;
      await this.updateCampaignDatabase(campaign);

      // Schedule wake-up job
      const delay = wakeupTime.getTime() - Date.now();
      await this.sleepQueue.add('wake-campaign', {
        campaignId: campaign.id,
        sleepStartTime: nextSleepTime,
        plannedActions: await this.getPlannedActions(campaign)
      }, {
        delay: Math.max(delay, 1000) // Minimum 1 second delay
      });

      logger.info(`Campaign ${campaign.id} scheduled to wake up at ${wakeupTime}`);
    } catch (error) {
      logger.error(`Failed to schedule sleep for campaign ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute active phase of campaign
   */
  async executeActivePhase(campaign: CampaignObjective): Promise<InteractionResult> {
    try {
      logger.info(`Executing active phase for campaign: ${campaign.name}`);

      // 1. Check if we should continue or sleep
      if (this.sleepScheduler.shouldEnterSleepPhase(campaign)) {
        logger.info(`Campaign ${campaign.id} should enter sleep phase`);
        await this.scheduleSleep(campaign);
        return {
          success: true,
          postsProcessed: 0,
          commentsPosted: 0,
          likesGiven: 0,
          errors: [],
          metrics: { averageEngagement: 0, viralRateAverage: 0, timeSpent: 0 }
        };
      }

      // 2. Calculate session parameters
      const sessionConfig = this.calculateSessionConfig(campaign);

      // 3. Execute Instagram automation with campaign context
      const result = await this.runInstagramWithCampaignContext(campaign, sessionConfig);

      // 4. Update campaign progress
      await this.updateCampaignProgress(campaign, result);

      // 5. Check if campaign is completed
      if (this.isCampaignCompleted(campaign)) {
        campaign.status = 'completed';
        await this.updateCampaignDatabase(campaign);
        logger.info(`Campaign ${campaign.id} completed successfully!`);
        return result;
      }

      // 6. Schedule next sleep if needed
      if (this.sleepScheduler.shouldEnterSleepPhase(campaign)) {
        await this.scheduleSleep(campaign);
      } else {
        // Schedule next active phase
        await this.campaignQueue.add('execute-campaign-phase', {
          campaignId: campaign.id,
          phase: 'active'
        }, {
          delay: 30000 // 30 seconds delay
        });
      }

      return result;
    } catch (error) {
      logger.error(`Failed to execute active phase for campaign ${campaign.id}:`, error);
      campaign.recoveryData.errorCount++;
      campaign.recoveryData.lastError = error instanceof Error ? error.message : String(error);
      await this.updateCampaignDatabase(campaign);
      throw error;
    }
  }

  /**
   * Wake up campaign from sleep
   */
  async wakeupCampaign(campaignId: string, plannedActions?: any[]): Promise<void> {
    try {
      logger.info(`Waking up campaign: ${campaignId}`);

      // Load campaign from database
      const campaign = await this.loadCampaignFromDB(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      // Restore campaign state
      const stateRestored = await this.stateManager.restoreCampaignState(campaignId);
      if (!stateRestored) {
        logger.warn(`Could not restore state for campaign ${campaignId}, starting fresh`);
      }

      // Update campaign status
      campaign.status = 'active';
      campaign.schedule.currentPhase = 'active';
      campaign.recoveryData.lastSuccessfulAction = new Date();
      await this.updateCampaignDatabase(campaign);

      // Queue planned actions if any
      if (plannedActions && plannedActions.length > 0) {
        campaign.recoveryData.pendingActions = plannedActions;
        await this.updateCampaignDatabase(campaign);
      }

      // Schedule immediate active phase
      await this.campaignQueue.add('execute-campaign-phase', {
        campaignId,
        phase: 'active'
      });

      logger.info(`Campaign ${campaignId} woke up successfully`);
    } catch (error) {
      logger.error(`Failed to wake up campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Setup workers for queue processing
   */
  private setupWorkers(): void {
    // Main campaign worker
    this.worker = new Worker('campaign-execution', async (job: Job) => {
      if (this.isShuttingDown) {
        throw new Error('Orchestrator is shutting down');
      }

      const { campaignId, phase } = job.data;
      
      try {
        const campaign = await this.loadCampaignFromDB(campaignId);
        if (!campaign) {
          throw new Error(`Campaign ${campaignId} not found`);
        }

        if (phase === 'active') {
          const result = await this.executeActivePhase(campaign);
          return { success: true, result, processedAt: new Date() };
        }

        return { success: true, processedAt: new Date() };
      } catch (error) {
        logger.error(`Campaign worker error for ${campaignId}:`, error);
        throw error;
      }
    });

    // Sleep scheduler worker
    this.sleepWorker = new Worker('sleep-scheduler', async (job: Job) => {
      if (this.isShuttingDown) {
        throw new Error('Orchestrator is shutting down');
      }

      const { campaignId, plannedActions } = job.data;
      
      try {
        await this.wakeupCampaign(campaignId, plannedActions);
        return { success: true, processedAt: new Date() };
      } catch (error) {
        logger.error(`Sleep worker error for ${campaignId}:`, error);
        throw error;
      }
    });

    // Error handlers
    this.worker.on('failed', (job, err) => {
      logger.error(`Campaign job ${job?.id} failed:`, err.message);
    });

    this.sleepWorker.on('failed', (job, err) => {
      logger.error(`Sleep job ${job?.id} failed:`, err.message);
    });
  }

  /**
   * Enhanced Instagram execution with campaign context
   */
  private async runInstagramWithCampaignContext(
    campaign: CampaignObjective, 
    sessionConfig: SessionConfig
  ): Promise<InteractionResult> {
    const startTime = Date.now();
    let postsProcessed = 0;
    let commentsPosted = 0;
    let likesGiven = 0;
    const errors: string[] = [];
    let totalViralRate = 0;

    try {
      // This is a simplified version - in reality, you'd integrate more deeply
      // with the existing Instagram automation
      
      // Simulate post processing based on sessionConfig
      const maxPosts = Math.min(sessionConfig.maxPosts, 
        campaign.targetMetrics.dailyInteractions || 50);

      for (let i = 0; i < maxPosts; i++) {
        try {
          // Simulate individual post interaction
          // In reality, this would call your existing Instagram automation
          
          // Simulate like action
          likesGiven++;
          
          // Simulate comment generation and posting
          if (Math.random() > 0.3) { // 70% chance to comment
            const prompt = `Generate engaging comment for post in campaign: ${campaign.name}`;
            const schema = getInstagramCommentSchema();
            const result = await runAgent(schema, prompt);
            
            if (result && result[0]) {
              commentsPosted++;
              totalViralRate += result[0].viralRate || 0;
            }
          }
          
          postsProcessed++;
          
          // Apply micro-sleep between posts
          const sleepSchedule = this.sleepScheduler.calculateSleepSchedule(campaign);
          const microSleep = sleepSchedule.microSleeps.find(s => s.type === 'post_interaction');
          if (microSleep) {
            const delay = microSleep.duration + (Math.random() - 0.5) * microSleep.randomization;
            await new Promise(resolve => setTimeout(resolve, Math.max(delay, 1000)));
          }

        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
          if (errors.length > 5) break; // Stop if too many errors
        }
      }

      const timeSpent = Date.now() - startTime;
      const averageEngagement = (likesGiven + commentsPosted) / Math.max(postsProcessed, 1);
      const viralRateAverage = commentsPosted > 0 ? totalViralRate / commentsPosted : 0;

      return {
        success: errors.length < postsProcessed * 0.1, // Success if <10% error rate
        postsProcessed,
        commentsPosted,
        likesGiven,
        errors,
        metrics: {
          averageEngagement,
          viralRateAverage,
          timeSpent
        }
      };

    } catch (error) {
      logger.error(`Instagram execution failed for campaign ${campaign.id}:`, error);
      return {
        success: false,
        postsProcessed,
        commentsPosted,
        likesGiven,
        errors: [...errors, error instanceof Error ? error.message : String(error)],
        metrics: {
          averageEngagement: 0,
          viralRateAverage: 0,
          timeSpent: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Calculate session configuration based on campaign
   */
  private calculateSessionConfig(campaign: CampaignObjective): SessionConfig {
    const baseConfig: SessionConfig = {
      maxPosts: 50,
      character: campaign.settings.characterPersonality || 'elon.character.json',
      targetEngagement: campaign.targetMetrics.engagementRate,
      focusAreas: ['general'],
      contentStrategy: 'balanced'
    };

    // Adjust based on safety level
    switch (campaign.settings.safetyLevel) {
      case 'conservative':
        baseConfig.maxPosts = Math.min(baseConfig.maxPosts, 20);
        break;
      case 'balanced':
        baseConfig.maxPosts = Math.min(baseConfig.maxPosts, 50);
        break;
      case 'aggressive':
        baseConfig.maxPosts = Math.min(baseConfig.maxPosts, 80);
        break;
    }

    // Adjust based on campaign type
    switch (campaign.type) {
      case 'follower_growth':
        baseConfig.contentStrategy = 'engagement_focused';
        baseConfig.focusAreas = ['trending', 'viral'];
        break;
      case 'engagement_rate':
        baseConfig.contentStrategy = 'high_quality_comments';
        baseConfig.focusAreas = ['niche', 'targeted'];
        break;
      case 'brand_awareness':
        baseConfig.contentStrategy = 'brand_relevant';
        baseConfig.focusAreas = ['industry', 'professional'];
        break;
    }

    return baseConfig;
  }

  /**
   * Update campaign progress after execution
   */
  private async updateCampaignProgress(
    campaign: CampaignObjective, 
    result: InteractionResult
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's stats
    let todayStats = campaign.progress.dailyStats.find(
      stat => stat.date.getTime() === today.getTime()
    );

    if (!todayStats) {
      todayStats = {
        date: today,
        postsLiked: 0,
        commentsPosted: 0,
        followersGained: 0,
        engagementRate: 0,
        activeTime: 0
      };
      campaign.progress.dailyStats.push(todayStats);
    }

    // Update stats
    todayStats.postsLiked += result.likesGiven;
    todayStats.commentsPosted += result.commentsPosted;
    todayStats.engagementRate = result.metrics.averageEngagement;
    todayStats.activeTime += Math.round(result.metrics.timeSpent / 60000); // Convert to minutes

    // Update overall progress
    campaign.progress.totalInteractions += result.postsProcessed;
    campaign.progress.lastActiveDate = new Date();

    // Update recovery data
    if (result.success) {
      campaign.recoveryData.lastSuccessfulAction = new Date();
      if (campaign.recoveryData.errorCount > 0) {
        campaign.recoveryData.errorCount = Math.max(0, campaign.recoveryData.errorCount - 1);
      }
    } else {
      campaign.recoveryData.errorCount += result.errors.length;
      campaign.recoveryData.lastError = result.errors[0] || 'Unknown error';
    }

    await this.updateCampaignDatabase(campaign);
  }

  /**
   * Check if campaign has reached its objectives
   */
  private isCampaignCompleted(campaign: CampaignObjective): boolean {
    // Check duration
    if (campaign.targetMetrics.duration) {
      const daysActive = Math.floor(
        (Date.now() - campaign.progress.startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysActive >= campaign.targetMetrics.duration) {
        return true;
      }
    }

    // Check follower target
    if (campaign.targetMetrics.followerTarget) {
      if (campaign.progress.currentFollowers >= campaign.targetMetrics.followerTarget) {
        return true;
      }
    }

    // Check engagement rate target
    if (campaign.targetMetrics.engagementRate) {
      const recentStats = campaign.progress.dailyStats.slice(-7); // Last 7 days
      const avgEngagement = recentStats.length > 0 
        ? recentStats.reduce((sum, stat) => sum + stat.engagementRate, 0) / recentStats.length
        : 0;
      
      if (avgEngagement >= campaign.targetMetrics.engagementRate) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get planned actions for campaign
   */
  private async getPlannedActions(campaign: CampaignObjective): Promise<any[]> {
    return campaign.recoveryData.pendingActions || [];
  }

  /**
   * Load campaign from database
   */
  private async loadCampaignFromDB(campaignId: string): Promise<CampaignObjective | null> {
    try {
      return await Campaign.findById(campaignId);
    } catch (error) {
      logger.error(`Failed to load campaign ${campaignId}:`, error);
      return null;
    }
  }

  /**
   * Update campaign in database
   */
  private async updateCampaignDatabase(campaign: CampaignObjective): Promise<void> {
    try {
      await Campaign.findByIdAndUpdate(campaign.id, campaign, { upsert: true });
    } catch (error) {
      logger.error(`Failed to update campaign ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    logger.info('Shutting down CampaignOrchestrator...');
    
    try {
      await Promise.all([
        this.worker.close(),
        this.sleepWorker.close(),
        this.campaignQueue.close(),
        this.sleepQueue.close()
      ]);
      
      logger.info('CampaignOrchestrator shutdown complete');
    } catch (error) {
      logger.error('Error during CampaignOrchestrator shutdown:', error);
    }
  }
} 