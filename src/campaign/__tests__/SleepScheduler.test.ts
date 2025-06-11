import { SleepScheduler } from '../services/SleepScheduler';
import { 
  createMockCampaign, 
  createMockTimeWindow, 
  createMockSleepConfiguration 
} from '../../__tests__/factories/campaignFactory';
import { createMockDate, restoreDate } from '../../__tests__/setup';
import { CampaignObjective } from '../../types/campaign';

describe('SleepScheduler', () => {
  let scheduler: SleepScheduler;
  let mockCampaign: Partial<CampaignObjective>;

  beforeEach(() => {
    scheduler = new SleepScheduler();
    mockCampaign = createMockCampaign();
  });

  afterEach(() => {
    restoreDate();
  });

  describe('calculateNextSleepTime', () => {
    it('should schedule daily sleep at 11 PM', () => {
      // Set current time to 10 AM
      createMockDate('2024-01-01T10:00:00Z');
      
      const sleepTime = scheduler.calculateNextSleepTime(mockCampaign as CampaignObjective);
      
      expect(sleepTime.getHours()).toBe(23); // 11 PM
      expect(sleepTime.getMinutes()).toBe(0);
    });

    it('should schedule sleep for next day if after 11 PM', () => {
      // Set current time to 11:30 PM
      createMockDate('2024-01-01T23:30:00Z');
      
      const sleepTime = scheduler.calculateNextSleepTime(mockCampaign as CampaignObjective);
      
      expect(sleepTime.getDate()).toBe(2); // Next day
      expect(sleepTime.getHours()).toBe(23);
    });

    it('should handle high error rate with immediate sleep', () => {
      mockCampaign.recoveryData!.errorCount = 10; // High error count
      
      const sleepTime = scheduler.calculateNextSleepTime(mockCampaign as CampaignObjective);
      
      // Should schedule immediate sleep (within 1 minute)
      const now = new Date();
      const timeDiff = sleepTime.getTime() - now.getTime();
      expect(timeDiff).toBeLessThan(2 * 60 * 1000); // Less than 2 minutes
    });

    it('should schedule strategic rest for long campaigns', () => {
      mockCampaign.targetMetrics!.duration = 60; // 60-day campaign
      
      const sleepSchedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const strategicRest = sleepSchedule.macroSleeps.find(
        sleep => sleep.type === 'strategic_rest'
      );
      expect(strategicRest).toBeDefined();
      expect(strategicRest!.duration).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });

  describe('calculateWakeupTime', () => {
    it('should wake up 8 hours after sleep for balanced safety level', () => {
      const sleepTime = new Date('2024-01-01T23:00:00Z');
      mockCampaign.settings!.safetyLevel = 'balanced';
      
      const wakeTime = scheduler.calculateWakeupTime(mockCampaign as CampaignObjective, sleepTime);
      
      expect(wakeTime.getHours()).toBe(7); // 7 AM next day
    });

    it('should wake up 10 hours after sleep for conservative safety level', () => {
      const sleepTime = new Date('2024-01-01T23:00:00Z');
      mockCampaign.settings!.safetyLevel = 'conservative';
      
      const wakeTime = scheduler.calculateWakeupTime(mockCampaign as CampaignObjective, sleepTime);
      
      expect(wakeTime.getHours()).toBe(9); // 9 AM next day
    });

    it('should wake up 6 hours after sleep for aggressive safety level', () => {
      const sleepTime = new Date('2024-01-01T23:00:00Z');
      mockCampaign.settings!.safetyLevel = 'aggressive';
      
      const wakeTime = scheduler.calculateWakeupTime(mockCampaign as CampaignObjective, sleepTime);
      
      expect(wakeTime.getHours()).toBe(5); // 5 AM next day
    });

    it('should adjust wakeup time to active periods', () => {
      const sleepTime = new Date('2024-01-01T23:00:00Z'); // Sunday night
      mockCampaign.settings!.safetyLevel = 'balanced';
      
      // Set active periods to weekdays 9 AM - 5 PM
      mockCampaign.schedule!.activePeriods = [createMockTimeWindow({
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      })];
      
      const wakeTime = scheduler.calculateWakeupTime(mockCampaign as CampaignObjective, sleepTime);
      
      // Should adjust to Monday 9 AM since Sunday/Monday early morning is not active
      expect(wakeTime.getDay()).toBe(1); // Monday
      expect(wakeTime.getHours()).toBe(9);
    });
  });

  describe('calculateSleepSchedule', () => {
    it('should include micro sleeps for post interactions', () => {
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      expect(schedule.microSleeps).toHaveLength(2);
      
      const postInteractionSleep = schedule.microSleeps.find(s => s.type === 'post_interaction');
      expect(postInteractionSleep).toBeDefined();
      expect(postInteractionSleep!.duration).toBe(7500); // 7.5 seconds
      expect(postInteractionSleep!.randomization).toBe(5000); // ±5 seconds
    });

    it('should include session break micro sleeps', () => {
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const sessionBreakSleep = schedule.microSleeps.find(s => s.type === 'session_break');
      expect(sessionBreakSleep).toBeDefined();
      expect(sessionBreakSleep!.duration).toBe(30000); // 30 seconds
      expect(sessionBreakSleep!.randomization).toBe(10000); // ±10 seconds
    });

    it('should include daily rest macro sleep', () => {
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const dailyRest = schedule.macroSleeps.find(s => s.type === 'daily_rest');
      expect(dailyRest).toBeDefined();
      expect(dailyRest!.pattern).toBe('0 23 * * *'); // 11 PM daily
      expect(dailyRest!.reason).toBe('Natural sleep cycle');
    });

    it('should include weekend reduced activity', () => {
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const weekendReduced = schedule.macroSleeps.find(s => s.type === 'weekend_reduced');
      expect(weekendReduced).toBeDefined();
      expect(weekendReduced!.pattern).toBe('0 18 * * 5'); // Friday 6 PM
      expect(weekendReduced!.duration).toBe(12 * 60 * 60 * 1000); // 12 hours
    });

    it('should not include strategic rest for short campaigns', () => {
      mockCampaign.targetMetrics!.duration = 15; // Short campaign
      
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const strategicRest = schedule.macroSleeps.find(s => s.type === 'strategic_rest');
      expect(strategicRest).toBeUndefined();
    });

    it('should include emergency sleep configuration', () => {
      const schedule = scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      expect(schedule.emergencySleep).toBeDefined();
      expect(schedule.emergencySleep.triggers).toContain('rate_limit_exceeded');
      expect(schedule.emergencySleep.triggers).toContain('account_suspended');
      expect(schedule.emergencySleep.duration).toBe(2 * 60 * 60 * 1000); // 2 hours
      expect(schedule.emergencySleep.escalation).toBe(true);
    });
  });

  describe('isWithinActivePeriod', () => {
    beforeEach(() => {
      // Set active periods to weekdays 9 AM - 5 PM
      mockCampaign.schedule!.activePeriods = [createMockTimeWindow({
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      })];
    });

    it('should return true during active hours on weekdays', () => {
      const tuesdayAfternoon = new Date('2024-01-02T14:00:00Z'); // Tuesday 2 PM
      
      const isActive = scheduler.isWithinActivePeriod(
        mockCampaign as CampaignObjective, 
        tuesdayAfternoon
      );
      
      expect(isActive).toBe(true);
    });

    it('should return false during non-active hours on weekdays', () => {
      const tuesdayEvening = new Date('2024-01-02T20:00:00Z'); // Tuesday 8 PM
      
      const isActive = scheduler.isWithinActivePeriod(
        mockCampaign as CampaignObjective, 
        tuesdayEvening
      );
      
      expect(isActive).toBe(false);
    });

    it('should return false on weekends', () => {
      const saturdayAfternoon = new Date('2024-01-06T14:00:00Z'); // Saturday 2 PM
      
      const isActive = scheduler.isWithinActivePeriod(
        mockCampaign as CampaignObjective, 
        saturdayAfternoon
      );
      
      expect(isActive).toBe(false);
    });

    it('should return true if no active periods are defined', () => {
      mockCampaign.schedule!.activePeriods = [];
      const anytime = new Date('2024-01-06T02:00:00Z'); // Saturday 2 AM
      
      const isActive = scheduler.isWithinActivePeriod(
        mockCampaign as CampaignObjective, 
        anytime
      );
      
      expect(isActive).toBe(true);
    });
  });

  describe('shouldEnterSleepPhase', () => {
    beforeEach(() => {
      // Set active periods to weekdays 9 AM - 5 PM
      mockCampaign.schedule!.activePeriods = [createMockTimeWindow({
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5]
      })];
    });

    it('should return true when outside active periods', () => {
      const saturdayNight = new Date('2024-01-06T22:00:00Z');
      createMockDate('2024-01-06T22:00:00Z');
      
      const shouldSleep = scheduler.shouldEnterSleepPhase(mockCampaign as CampaignObjective);
      
      expect(shouldSleep).toBe(true);
    });

    it('should return true when error rate is high', () => {
      mockCampaign.recoveryData!.errorCount = 10; // High error count
      createMockDate('2024-01-02T14:00:00Z'); // Tuesday afternoon (active period)
      
      const shouldSleep = scheduler.shouldEnterSleepPhase(mockCampaign as CampaignObjective);
      
      expect(shouldSleep).toBe(true);
    });

    it('should return true when daily interaction limit is reached', () => {
      const today = new Date('2024-01-02');
      mockCampaign.progress!.dailyStats = [{
        date: today,
        postsLiked: 30,
        commentsPosted: 25, // Total: 55, exceeds target of 50
        followersGained: 5,
        engagementRate: 0.05,
        activeTime: 120
      }];
      mockCampaign.targetMetrics!.dailyInteractions = 50;
      createMockDate('2024-01-02T14:00:00Z');
      
      const shouldSleep = scheduler.shouldEnterSleepPhase(mockCampaign as CampaignObjective);
      
      expect(shouldSleep).toBe(true);
    });

    it('should return false during active period with normal conditions', () => {
      mockCampaign.recoveryData!.errorCount = 1; // Low error count
      createMockDate('2024-01-02T14:00:00Z'); // Tuesday afternoon
      
      const shouldSleep = scheduler.shouldEnterSleepPhase(mockCampaign as CampaignObjective);
      
      expect(shouldSleep).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined campaign properties gracefully', () => {
      const incompleteCampaign = {
        schedule: { activePeriods: [] },
        settings: { safetyLevel: 'balanced' as const },
        recoveryData: { errorCount: 0 },
        progress: { dailyStats: [] },
        targetMetrics: {}
      } as Partial<CampaignObjective>;
      
      expect(() => {
        scheduler.calculateNextSleepTime(incompleteCampaign as CampaignObjective);
      }).not.toThrow();
    });

    it('should handle empty active periods array', () => {
      mockCampaign.schedule!.activePeriods = [];
      
      const anytime = new Date();
      const isActive = scheduler.isWithinActivePeriod(mockCampaign as CampaignObjective, anytime);
      
      expect(isActive).toBe(true);
    });

    it('should handle campaigns with no target metrics', () => {
      mockCampaign.targetMetrics = {};
      
      expect(() => {
        scheduler.shouldEnterSleepPhase(mockCampaign as CampaignObjective);
      }).not.toThrow();
    });

    it('should handle timezone considerations', () => {
      mockCampaign.settings!.timezone = 'America/New_York';
      
      const sleepTime = scheduler.calculateNextSleepTime(mockCampaign as CampaignObjective);
      
      // Should still return a valid date regardless of timezone setting
      expect(sleepTime).toBeInstanceOf(Date);
      expect(sleepTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('performance tests', () => {
    it('should calculate sleep schedule quickly', () => {
      const start = Date.now();
      
      scheduler.calculateSleepSchedule(mockCampaign as CampaignObjective);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('should handle multiple time calculations efficiently', () => {
      const campaigns = Array.from({ length: 100 }, () => createMockCampaign());
      
      const start = Date.now();
      
      campaigns.forEach(campaign => {
        scheduler.calculateNextSleepTime(campaign as CampaignObjective);
        scheduler.shouldEnterSleepPhase(campaign as CampaignObjective);
      });
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should handle 100 campaigns in less than 100ms
    });
  });
}); 