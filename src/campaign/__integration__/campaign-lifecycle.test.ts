import { CampaignOrchestrator } from '../services/CampaignOrchestrator';
import { SleepScheduler } from '../services/SleepScheduler';
import { StateManager } from '../services/StateManager';
import { Campaign } from '../schemas/CampaignSchema';
import { 
  createMockCampaign, 
  createFollowerGrowthCampaign,
  createMockInteractionResult 
} from '../../__tests__/factories/campaignFactory';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../../__tests__/setup';
import { CampaignObjective } from '../../types/campaign';

describe('Campaign Lifecycle Integration Tests', () => {
  let orchestrator: CampaignOrchestrator;
  let sleepScheduler: SleepScheduler;
  let stateManager: StateManager;
  let testCampaign: CampaignObjective;

  beforeEach(async () => {
    // 1. Set up test database
    await connectTestDB();
    await clearTestDB();

    // 2. Initialize services
    orchestrator = new CampaignOrchestrator();
    sleepScheduler = new SleepScheduler();
    stateManager = new StateManager();

    // 3. Create test campaign
    const campaignData = createFollowerGrowthCampaign({
      name: 'Integration Test Campaign',
      targetMetrics: {
        followerTarget: 1000,
        dailyInteractions: 20,
        duration: 7 // 7 days
      }
    });

    testCampaign = await Campaign.create(campaignData) as CampaignObjective;
  });

  afterEach(async () => {
    // Clean up
    if (orchestrator) {
      await orchestrator.shutdown();
    }
    if (stateManager) {
      await stateManager.close();
    }
    await disconnectTestDB();
  });

  describe('Complete Sleep/Wake Cycle', () => {
    it('should handle full campaign sleep and wake cycle', async () => {
      // 1. Schedule campaign to start
      await orchestrator.scheduleCampaign(testCampaign);

      // Verify campaign is active
      let updatedCampaign = await Campaign.findById(testCampaign.id);
      expect(updatedCampaign!.status).toBe('active');
      expect(updatedCampaign!.schedule.currentPhase).toBe('active');

      // 2. Force campaign to sleep phase
      testCampaign.schedule.currentPhase = 'sleeping';
      await orchestrator.scheduleSleep(testCampaign);

      // Verify sleep scheduling
      updatedCampaign = await Campaign.findById(testCampaign.id);
      expect(updatedCampaign!.schedule.currentPhase).toBe('sleeping');
      expect(updatedCampaign!.schedule.nextWakeup).toBeDefined();

      // 3. Verify state was saved
      const stateExists = await stateManager.restoreCampaignState(testCampaign.id);
      expect(stateExists).toBe(true);

      // 4. Simulate wake up
      await orchestrator.wakeupCampaign(testCampaign.id);

      // Verify campaign is active again
      updatedCampaign = await Campaign.findById(testCampaign.id);
      expect(updatedCampaign!.status).toBe('active');
      expect(updatedCampaign!.schedule.currentPhase).toBe('active');
    }, 15000);

    it('should maintain state consistency across services', async () => {
      // 1. Execute some interactions to create state
      const interactionResult = createMockInteractionResult({
        postsProcessed: 10,
        commentsPosted: 7,
        likesGiven: 10
      });

      // Simulate progress update
      await (orchestrator as any).updateCampaignProgress(testCampaign, interactionResult);

      // 2. Save state before sleep
      await stateManager.saveCampaignState(testCampaign);

      // 3. Verify state persistence
      const savedState = await stateManager.restoreCampaignState(testCampaign.id);
      expect(savedState).toBe(true);

      // 4. Check database consistency
      const campaignFromDB = await Campaign.findById(testCampaign.id);
      expect(campaignFromDB).toBeDefined();
      expect(campaignFromDB!.progress.totalInteractions).toBeGreaterThan(0);
    });

    it('should handle sleep scheduling based on time windows', async () => {
      // 1. Set specific active periods (weekdays 9-5)
      testCampaign.schedule.activePeriods = [{
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      }];

      // 2. Test outside active period (should sleep)
      const weekendTime = new Date('2024-01-06T14:00:00Z'); // Saturday
      jest.spyOn(Date, 'now').mockReturnValue(weekendTime.getTime());

      const shouldSleep = sleepScheduler.shouldEnterSleepPhase(testCampaign);
      expect(shouldSleep).toBe(true);

      // 3. Test during active period (should stay active)
      const weekdayTime = new Date('2024-01-02T14:00:00Z'); // Tuesday
      jest.spyOn(Date, 'now').mockReturnValue(weekdayTime.getTime());

      const shouldStayActive = !sleepScheduler.shouldEnterSleepPhase(testCampaign);
      expect(shouldStayActive).toBe(true);

      // Clean up mock
      (Date.now as jest.Mock).mockRestore();
    });

    it('should handle error recovery during sleep/wake transitions', async () => {
      // 1. Simulate error condition
      testCampaign.recoveryData.errorCount = 8; // High error count
      testCampaign.recoveryData.lastError = 'Rate limit exceeded';

      // 2. Check if sleep scheduler detects error condition
      const shouldSleep = sleepScheduler.shouldEnterSleepPhase(testCampaign);
      expect(shouldSleep).toBe(true);

      // 3. Execute sleep with error condition
      await orchestrator.scheduleSleep(testCampaign);

      // 4. Verify error recovery sleep configuration
      const sleepSchedule = sleepScheduler.calculateSleepSchedule(testCampaign);
      const errorRecoverySleep = sleepSchedule.macroSleeps.find(
        sleep => sleep.type === 'error_recovery'
      );
      expect(errorRecoverySleep).toBeDefined();
      expect(errorRecoverySleep!.duration).toBe(6 * 60 * 60 * 1000); // 6 hours
    });

    it('should handle concurrent campaign operations', async () => {
      // 1. Create multiple campaigns
      const campaigns = await Promise.all([
        Campaign.create(createMockCampaign({ name: 'Campaign 1' })),
        Campaign.create(createMockCampaign({ name: 'Campaign 2' })),
        Campaign.create(createMockCampaign({ name: 'Campaign 3' }))
      ]);

      // 2. Schedule all campaigns simultaneously
      const schedulePromises = campaigns.map(campaign => 
        orchestrator.scheduleCampaign(campaign as CampaignObjective)
      );
      
      await Promise.all(schedulePromises);

      // 3. Verify all campaigns are active
      for (const campaign of campaigns) {
        const updatedCampaign = await Campaign.findById(campaign._id);
        expect(updatedCampaign!.status).toBe('active');
      }

      // 4. Put all campaigns to sleep simultaneously
      const sleepPromises = campaigns.map(campaign => 
        orchestrator.scheduleSleep(campaign as CampaignObjective)
      );
      
      await Promise.all(sleepPromises);

      // 5. Verify all campaigns are sleeping
      for (const campaign of campaigns) {
        const updatedCampaign = await Campaign.findById(campaign._id);
        expect(updatedCampaign!.schedule.currentPhase).toBe('sleeping');
      }
    });

    it('should handle campaign completion detection', async () => {
      // 1. Set campaign close to completion
      testCampaign.targetMetrics.followerTarget = 100;
      testCampaign.progress.currentFollowers = 95; // Close to target

      // 2. Simulate successful interactions that reach target
      const completionResult = createMockInteractionResult({
        postsProcessed: 5,
        commentsPosted: 5,
        likesGiven: 5
      });

      // Mock follower gain
      testCampaign.progress.currentFollowers = 105; // Exceed target

      // 3. Execute active phase
      const result = await orchestrator.executeActivePhase(testCampaign);

      // 4. Verify campaign completion
      const updatedCampaign = await Campaign.findById(testCampaign.id);
      expect(updatedCampaign!.status).toBe('completed');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid sleep/wake cycles efficiently', async () => {
      const startTime = Date.now();

      // Perform 10 rapid sleep/wake cycles
      for (let i = 0; i < 10; i++) {
        await orchestrator.scheduleSleep(testCampaign);
        await orchestrator.wakeupCampaign(testCampaign.id);
      }

      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(5000); // Should complete in < 5 seconds
    });

    it('should maintain data consistency under concurrent access', async () => {
      // Simulate concurrent operations on the same campaign
      const operations = [
        orchestrator.executeActivePhase(testCampaign),
        stateManager.saveCampaignState(testCampaign),
        sleepScheduler.calculateNextSleepTime(testCampaign),
        sleepScheduler.shouldEnterSleepPhase(testCampaign)
      ];

      // All operations should complete without errors
      await expect(Promise.all(operations)).resolves.toBeDefined();

      // Data should remain consistent
      const campaignFromDB = await Campaign.findById(testCampaign.id);
      expect(campaignFromDB).toBeDefined();
      expect(campaignFromDB!.id).toBe(testCampaign.id);
    });

    it('should handle state manager failures gracefully', async () => {
      // Mock state manager failure
      jest.spyOn(stateManager, 'saveCampaignState')
        .mockRejectedValueOnce(new Error('Redis connection failed'));

      // Sleep scheduling should still work even if state save fails
      await expect(orchestrator.scheduleSleep(testCampaign))
        .resolves.not.toThrow();

      // Campaign should still be marked as sleeping
      const updatedCampaign = await Campaign.findById(testCampaign.id);
      expect(updatedCampaign!.schedule.currentPhase).toBe('sleeping');
    });
  });

  describe('Database Integration', () => {
    it('should persist campaign state across database reconnections', async () => {
      // 1. Save initial state
      await orchestrator.scheduleCampaign(testCampaign);

      // 2. Simulate database disconnection and reconnection
      await disconnectTestDB();
      await connectTestDB();

      // 3. Verify campaign data persists
      const persistedCampaign = await Campaign.findById(testCampaign.id);
      expect(persistedCampaign).toBeDefined();
      expect(persistedCampaign!.status).toBe('active');
    });

    it('should handle database transaction rollbacks correctly', async () => {
      // 1. Start with clean state
      const initialCampaign = await Campaign.findById(testCampaign.id);
      const initialErrorCount = initialCampaign!.recoveryData.errorCount;

      // 2. Mock database error during update
      jest.spyOn(Campaign, 'findByIdAndUpdate')
        .mockRejectedValueOnce(new Error('Database transaction failed'));

      // 3. Attempt operation that should fail
      await expect((orchestrator as any).updateCampaignDatabase(testCampaign))
        .rejects.toThrow('Database transaction failed');

      // 4. Verify data wasn't corrupted
      const unchangedCampaign = await Campaign.findById(testCampaign.id);
      expect(unchangedCampaign!.recoveryData.errorCount).toBe(initialErrorCount);
    });
  });
}); 