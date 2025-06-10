import { Document } from 'mongoose';

export interface CampaignObjective extends Document {
  id: string;
  name: string;
  type: 'follower_growth' | 'engagement_rate' | 'brand_awareness' | 'lead_generation';
  status: 'active' | 'paused' | 'completed' | 'failed';
  
  // Long-term goals
  targetMetrics: {
    followerTarget?: number;
    engagementRate?: number;
    dailyInteractions?: number;
    duration?: number; // days
  };
  
  // Current progress
  progress: {
    startDate: Date;
    currentFollowers: number;
    totalInteractions: number;
    dailyStats: DailyProgress[];
    lastActiveDate: Date;
  };
  
  // Sleep scheduling
  schedule: {
    activePeriods: TimeWindow[];
    sleepPeriods: SleepConfiguration[];
    currentPhase: 'active' | 'sleeping';
    nextWakeup: Date;
    nextSleep: Date;
  };
  
  // Recovery data
  recoveryData: {
    lastSuccessfulAction: Date;
    sessionState: object;
    pendingActions: QueuedAction[];
    errorCount: number;
    lastError?: string;
  };

  // Settings
  settings: {
    timezone: string;
    characterPersonality: string;
    safetyLevel: 'conservative' | 'balanced' | 'aggressive';
  };
}

export interface DailyProgress {
  date: Date;
  postsLiked: number;
  commentsPosted: number;
  followersGained: number;
  engagementRate: number;
  activeTime: number; // minutes
}

export interface TimeWindow {
  start: string; // HH:MM format
  end: string; // HH:MM format
  days: number[]; // 0-6, Sunday=0
}

export interface SleepConfiguration {
  type: 'daily_rest' | 'weekend_reduced' | 'strategic_rest' | 'error_recovery';
  duration: number; // milliseconds
  pattern: string; // cron pattern or 'immediate'
  reason: string;
}

export interface QueuedAction {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'post';
  scheduledFor: Date;
  data: object;
  retryCount: number;
  priority: number;
}

export interface InteractionResult {
  success: boolean;
  postsProcessed: number;
  commentsPosted: number;
  likesGiven: number;
  errors: string[];
  metrics: {
    averageEngagement: number;
    viralRateAverage: number;
    timeSpent: number;
  };
}

export interface SessionConfig {
  maxPosts: number;
  character: string;
  targetEngagement?: number;
  focusAreas?: string[];
  contentStrategy?: string;
}

export interface HealthStatus {
  isStuck: boolean;
  errorRate: number;
  memoryUsage: number;
  shouldSleep: boolean;
  sleepDuration: number;
  recommendation: string;
}

export interface SleepSchedule {
  microSleeps: MicroSleep[];
  macroSleeps: MacroSleep[];
  emergencySleep: EmergencySleep;
}

export interface MicroSleep {
  type: 'post_interaction' | 'session_break';
  duration: number;
  randomization: number;
}

export interface MacroSleep {
  type: 'daily_rest' | 'weekend_reduced' | 'strategic_rest' | 'error_recovery';
  duration: number;
  pattern: string;
  reason: string;
}

export interface EmergencySleep {
  triggers: string[];
  duration: number;
  escalation: boolean;
}

export interface CampaignState {
  campaignId: string;
  timestamp: Date;
  sessionData: {
    cookies: any[];
    lastProcessedPost: string;
    currentPosition: number;
    browserState: object;
  };
  aiContext: {
    recentComments: string[];
    characterState: object;
    learningData: object;
  };
  metrics: {
    todaysProgress: DailyProgress;
    weeklyTrends: object;
    goalProgress: number;
  };
  pendingActions: QueuedAction[];
  systemHealth: {
    memoryUsage: NodeJS.MemoryUsage;
    errorCounts: object;
    performanceMetrics: object;
  };
} 