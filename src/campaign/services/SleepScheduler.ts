import { CampaignObjective, SleepSchedule, MacroSleep, MicroSleep, EmergencySleep } from '../../types/campaign';
import logger from '../../config/logger';

export class SleepScheduler {
  /**
   * Calculate the next sleep time for a campaign based on its schedule and current time
   */
  calculateNextSleepTime(campaign: CampaignObjective): Date {
    const now = new Date();
    const sleepSchedule = this.calculateSleepSchedule(campaign);
    
    // Find the next applicable macro sleep
    for (const macroSleep of sleepSchedule.macroSleeps) {
      const nextSleepTime = this.parsePattern(macroSleep.pattern, now);
      if (nextSleepTime && nextSleepTime > now) {
        logger.info(`Next sleep scheduled: ${nextSleepTime} (${macroSleep.reason})`);
        return nextSleepTime;
      }
    }
    
    // Default to next day 11 PM if no pattern matches
    const defaultSleep = new Date(now);
    defaultSleep.setHours(23, 0, 0, 0);
    if (defaultSleep <= now) {
      defaultSleep.setDate(defaultSleep.getDate() + 1);
    }
    
    return defaultSleep;
  }

  /**
   * Calculate when to wake up based on sleep time and campaign configuration
   */
  calculateWakeupTime(campaign: CampaignObjective, sleepTime: Date): Date {
    const wakeupTime = new Date(sleepTime);
    
    // Default sleep duration based on safety level
    let sleepDuration = 8 * 60 * 60 * 1000; // 8 hours default
    
    switch (campaign.settings.safetyLevel) {
      case 'conservative':
        sleepDuration = 10 * 60 * 60 * 1000; // 10 hours
        break;
      case 'balanced':
        sleepDuration = 8 * 60 * 60 * 1000;  // 8 hours
        break;
      case 'aggressive':
        sleepDuration = 6 * 60 * 60 * 1000;  // 6 hours
        break;
    }
    
    wakeupTime.setTime(wakeupTime.getTime() + sleepDuration);
    
    // Ensure wakeup time falls within active periods
    const adjustedWakeup = this.adjustForActivePeriods(campaign, wakeupTime);
    
    logger.info(`Wake up scheduled: ${adjustedWakeup}`);
    return adjustedWakeup;
  }

  /**
   * Calculate comprehensive sleep schedule for a campaign
   */
  calculateSleepSchedule(campaign: CampaignObjective): SleepSchedule {
    return {
      microSleeps: this.calculateMicroSleeps(),
      macroSleeps: this.calculateMacroSleeps(campaign),
      emergencySleep: this.calculateEmergencySleep(campaign)
    };
  }

  /**
   * Calculate micro-sleep periods (short delays between actions)
   */
  private calculateMicroSleeps(): MicroSleep[] {
    return [
      {
        type: 'post_interaction',
        duration: 7500, // 7.5 seconds average
        randomization: 5000 // ±5 seconds
      },
      {
        type: 'session_break',
        duration: 30000, // 30 seconds
        randomization: 10000 // ±10 seconds
      }
    ];
  }

  /**
   * Calculate macro-sleep periods (extended rest periods)
   */
  private calculateMacroSleeps(campaign: CampaignObjective): MacroSleep[] {
    const sleeps: MacroSleep[] = [];
    
    // Daily rest period
    sleeps.push({
      type: 'daily_rest',
      duration: this.getDailySleepDuration(campaign),
      pattern: '0 23 * * *', // 11 PM daily
      reason: 'Natural sleep cycle'
    });
    
    // Weekend reduced activity
    sleeps.push({
      type: 'weekend_reduced',
      duration: 12 * 60 * 60 * 1000, // 12 hours
      pattern: '0 18 * * 5', // Friday 6 PM
      reason: 'Lower weekend engagement'
    });
    
    // Strategic rest for long campaigns
    if (campaign.targetMetrics.duration && campaign.targetMetrics.duration > 30) {
      sleeps.push({
        type: 'strategic_rest',
        duration: 24 * 60 * 60 * 1000, // 24 hours
        pattern: 'every_7_days',
        reason: 'Long-term sustainability'
      });
    }
    
    // Error recovery sleep
    if (this.getRecentErrorRate(campaign) > 0.1) {
      sleeps.push({
        type: 'error_recovery',
        duration: 6 * 60 * 60 * 1000, // 6 hours
        pattern: 'immediate',
        reason: 'High error rate detected'
      });
    }
    
    return sleeps;
  }

  /**
   * Calculate emergency sleep configuration
   */
  private calculateEmergencySleep(campaign: CampaignObjective): EmergencySleep {
    return {
      triggers: [
        'rate_limit_exceeded',
        'account_suspended',
        'high_error_rate',
        'memory_leak_detected',
        'api_quota_exceeded'
      ],
      duration: 2 * 60 * 60 * 1000, // 2 hours minimum
      escalation: true
    };
  }

  /**
   * Parse cron-like pattern to next execution time
   */
  private parsePattern(pattern: string, from: Date): Date | null {
    const now = new Date(from);
    
    switch (pattern) {
      case '0 23 * * *': // Daily at 11 PM
        const dailySleep = new Date(now);
        dailySleep.setHours(23, 0, 0, 0);
        if (dailySleep <= now) {
          dailySleep.setDate(dailySleep.getDate() + 1);
        }
        return dailySleep;
        
      case '0 18 * * 5': // Friday 6 PM
        const fridaySleep = new Date(now);
        const daysUntilFriday = (5 - now.getDay() + 7) % 7;
        fridaySleep.setDate(now.getDate() + daysUntilFriday);
        fridaySleep.setHours(18, 0, 0, 0);
        if (fridaySleep <= now && daysUntilFriday === 0) {
          fridaySleep.setDate(fridaySleep.getDate() + 7);
        }
        return fridaySleep;
        
      case 'every_7_days':
        const weeklyRest = new Date(now);
        weeklyRest.setDate(now.getDate() + 7);
        return weeklyRest;
        
      case 'immediate':
        return new Date(now.getTime() + 60000); // 1 minute from now
        
      default:
        logger.warn(`Unknown sleep pattern: ${pattern}`);
        return null;
    }
  }

  /**
   * Adjust wakeup time to fall within campaign active periods
   */
  private adjustForActivePeriods(campaign: CampaignObjective, wakeupTime: Date): Date {
    if (!campaign.schedule.activePeriods.length) {
      return wakeupTime;
    }
    
    const dayOfWeek = wakeupTime.getDay();
    const timeStr = `${wakeupTime.getHours().toString().padStart(2, '0')}:${wakeupTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Find active period for this day
    const activePeriod = campaign.schedule.activePeriods.find(period => 
      period.days.includes(dayOfWeek)
    );
    
    if (!activePeriod) {
      // No active period for this day, move to next active day
      return this.findNextActiveDay(campaign, wakeupTime);
    }
    
    // Check if wakeup time is within active period
    if (timeStr >= activePeriod.start && timeStr <= activePeriod.end) {
      return wakeupTime;
    }
    
    // Adjust to start of active period
    const adjusted = new Date(wakeupTime);
    const [hours, minutes] = activePeriod.start.split(':').map(Number);
    adjusted.setHours(hours, minutes, 0, 0);
    
    // If we've moved backwards in time, advance to next day
    if (adjusted < wakeupTime) {
      return this.findNextActiveDay(campaign, wakeupTime);
    }
    
    return adjusted;
  }

  /**
   * Find the next day with an active period
   */
  private findNextActiveDay(campaign: CampaignObjective, from: Date): Date {
    const nextDay = new Date(from);
    nextDay.setDate(nextDay.getDate() + 1);
    
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = nextDay.getDay();
      const activePeriod = campaign.schedule.activePeriods.find(period => 
        period.days.includes(dayOfWeek)
      );
      
      if (activePeriod) {
        const [hours, minutes] = activePeriod.start.split(':').map(Number);
        nextDay.setHours(hours, minutes, 0, 0);
        return nextDay;
      }
      
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    // Fallback to next day at 9 AM if no active periods found
    const fallback = new Date(from);
    fallback.setDate(fallback.getDate() + 1);
    fallback.setHours(9, 0, 0, 0);
    return fallback;
  }

  /**
   * Get daily sleep duration based on campaign settings
   */
  private getDailySleepDuration(campaign: CampaignObjective): number {
    const baseHours = {
      'conservative': 10,
      'balanced': 8,
      'aggressive': 6
    };
    
    const hours = baseHours[campaign.settings.safetyLevel];
    return hours * 60 * 60 * 1000;
  }

  /**
   * Calculate recent error rate for the campaign
   */
  private getRecentErrorRate(campaign: CampaignObjective): number {
    // Look at last 3 days of activity
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentStats = campaign.progress.dailyStats.filter(
      stat => stat.date >= threeDaysAgo
    );
    
    if (recentStats.length === 0) {
      return 0;
    }
    
    // If we had more than 5 errors in 3 days, that's concerning
    return campaign.recoveryData.errorCount > 5 ? 0.15 : 0.05;
  }

  /**
   * Check if current time is within an active period
   */
  isWithinActivePeriod(campaign: CampaignObjective, time: Date = new Date()): boolean {
    if (!campaign.schedule.activePeriods.length) {
      return true; // No restrictions if no active periods defined
    }
    
    const dayOfWeek = time.getDay();
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    
    return campaign.schedule.activePeriods.some(period => 
      period.days.includes(dayOfWeek) && 
      timeStr >= period.start && 
      timeStr <= period.end
    );
  }

  /**
   * Check if campaign should sleep immediately
   */
  shouldEnterSleepPhase(campaign: CampaignObjective): boolean {
    // Check if we're outside active periods
    if (!this.isWithinActivePeriod(campaign)) {
      return true;
    }
    
    // Check if error rate is too high
    if (this.getRecentErrorRate(campaign) > 0.1) {
      return true;
    }
    
    // Check if we've exceeded daily interaction limits
    const today = new Date();
    const todayStats = campaign.progress.dailyStats.find(
      stat => stat.date.toDateString() === today.toDateString()
    );
    
    if (todayStats) {
      const totalInteractions = todayStats.postsLiked + todayStats.commentsPosted;
      const targetInteractions = campaign.targetMetrics.dailyInteractions || 50;
      
      if (totalInteractions >= targetInteractions) {
        return true;
      }
    }
    
    return false;
  }
} 