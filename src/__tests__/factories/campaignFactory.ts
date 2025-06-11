import { 
  CampaignObjective, 
  DailyProgress, 
  TimeWindow, 
  SleepConfiguration, 
  QueuedAction,
  CampaignState,
  InteractionResult,
  SessionConfig 
} from '../../types/campaign';

// Campaign Factory
export const createMockCampaign = (overrides: Partial<CampaignObjective> = {}): Partial<CampaignObjective> => {
  const baseDate = new Date('2024-01-01T09:00:00Z');
  
  return {
    id: 'test-campaign-123',
    name: 'Test Growth Campaign',
    type: 'follower_growth',
    status: 'active',
    
    targetMetrics: {
      followerTarget: 1000,
      engagementRate: 0.05,
      dailyInteractions: 50,
      duration: 30
    },
    
    progress: {
      startDate: baseDate,
      currentFollowers: 500,
      totalInteractions: 0,
      dailyStats: [],
      lastActiveDate: baseDate
    },
    
    schedule: {
      activePeriods: [createMockTimeWindow()],
      sleepPeriods: [createMockSleepConfiguration()],
      currentPhase: 'active',
      nextWakeup: new Date(baseDate.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      nextSleep: new Date(baseDate.getTime() + 16 * 60 * 60 * 1000)   // 16 hours later
    },
    
    recoveryData: {
      lastSuccessfulAction: baseDate,
      sessionState: {},
      pendingActions: [],
      errorCount: 0
    },
    
    settings: {
      timezone: 'UTC',
      characterPersonality: 'elon.character.json',
      safetyLevel: 'balanced'
    },
    
    ...overrides
  } as Partial<CampaignObjective>;
};

// Daily Progress Factory
export const createMockDailyProgress = (overrides: Partial<DailyProgress> = {}): DailyProgress => ({
  date: new Date('2024-01-01'),
  postsLiked: 25,
  commentsPosted: 15,
  followersGained: 5,
  engagementRate: 0.03,
  activeTime: 120, // 2 hours
  ...overrides
});

// Time Window Factory
export const createMockTimeWindow = (overrides: Partial<TimeWindow> = {}): TimeWindow => ({
  start: '09:00',
  end: '17:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
  ...overrides
});

// Sleep Configuration Factory
export const createMockSleepConfiguration = (overrides: Partial<SleepConfiguration> = {}): SleepConfiguration => ({
  type: 'daily_rest',
  duration: 8 * 60 * 60 * 1000, // 8 hours
  pattern: '0 23 * * *', // 11 PM daily
  reason: 'Natural sleep cycle',
  ...overrides
});

// Queued Action Factory
export const createMockQueuedAction = (overrides: Partial<QueuedAction> = {}): QueuedAction => ({
  id: 'action-123',
  type: 'comment',
  scheduledFor: new Date(),
  data: { postId: 'post-123', caption: 'Test caption' },
  retryCount: 0,
  priority: 0,
  ...overrides
});

// Campaign State Factory
export const createMockCampaignState = (overrides: Partial<CampaignState> = {}): Partial<CampaignState> => ({
  campaignId: 'test-campaign-123',
  timestamp: new Date(),
  
  sessionData: {
    cookies: [],
    lastProcessedPost: 'post-456',
    currentPosition: 10,
    browserState: {}
  },
  
  aiContext: {
    recentComments: ['Great post!', 'Amazing content!'],
    characterState: {},
    learningData: {}
  },
  
  metrics: {
    todaysProgress: createMockDailyProgress(),
    weeklyTrends: {},
    goalProgress: 0.25 // 25% complete
  },
  
  pendingActions: [],
  
  systemHealth: {
    memoryUsage: {
      rss: 50000000, // 50MB
      heapTotal: 30000000,
      heapUsed: 20000000,
      external: 1000000,
      arrayBuffers: 500000
    },
    errorCounts: {},
    performanceMetrics: {}
  },
  
  ...overrides
});

// Interaction Result Factory
export const createMockInteractionResult = (overrides: Partial<InteractionResult> = {}): InteractionResult => ({
  success: true,
  postsProcessed: 10,
  commentsPosted: 8,
  likesGiven: 10,
  errors: [],
  metrics: {
    averageEngagement: 0.05,
    viralRateAverage: 75,
    timeSpent: 300 // 5 minutes
  },
  ...overrides
});

// Session Config Factory
export const createMockSessionConfig = (overrides: Partial<SessionConfig> = {}): SessionConfig => ({
  maxPosts: 50,
  character: 'elon.character.json',
  targetEngagement: 0.05,
  focusAreas: ['technology', 'innovation'],
  contentStrategy: 'engaging_questions',
  ...overrides
});

// Factory for different campaign types
export const createFollowerGrowthCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    type: 'follower_growth',
    targetMetrics: {
      followerTarget: 2000,
      dailyInteractions: 75,
      duration: 60
    },
    ...overrides
  });

export const createEngagementCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    type: 'engagement_rate',
    targetMetrics: {
      engagementRate: 0.08,
      dailyInteractions: 40,
      duration: 30
    },
    ...overrides
  });

export const createBrandAwarenessCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    type: 'brand_awareness',
    targetMetrics: {
      dailyInteractions: 100,
      duration: 90
    },
    ...overrides
  });

// Factory for campaigns in different states
export const createSleepingCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    status: 'paused',
    schedule: {
      ...createMockCampaign().schedule!,
      currentPhase: 'sleeping',
      nextWakeup: new Date(Date.now() + 4 * 60 * 60 * 1000) // Wake up in 4 hours
    },
    ...overrides
  });

export const createCompletedCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    status: 'completed',
    progress: {
      ...createMockCampaign().progress!,
      currentFollowers: 1000, // Reached target
      totalInteractions: 1500
    },
    ...overrides
  });

export const createFailedCampaign = (overrides: Partial<CampaignObjective> = {}) => 
  createMockCampaign({
    status: 'failed',
    recoveryData: {
      ...createMockCampaign().recoveryData!,
      errorCount: 10,
      lastError: 'Rate limit exceeded'
    },
    ...overrides
  });

// Utility functions for test data
export const createMultipleCampaigns = (count: number, factory = createMockCampaign) => 
  Array.from({ length: count }, (_, i) => factory({ 
    id: `test-campaign-${i + 1}`,
    name: `Test Campaign ${i + 1}`
  }));

export const createCampaignWithProgress = (daysActive: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysActive);
  
  const dailyStats = Array.from({ length: daysActive }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    return createMockDailyProgress({
      date,
      postsLiked: Math.floor(Math.random() * 50) + 10,
      commentsPosted: Math.floor(Math.random() * 30) + 5,
      followersGained: Math.floor(Math.random() * 10),
      engagementRate: Math.random() * 0.1,
      activeTime: Math.floor(Math.random() * 180) + 60
    });
  });
  
  return createMockCampaign({
    progress: {
      ...createMockCampaign().progress!,
      startDate,
      totalInteractions: dailyStats.reduce((sum, day) => sum + day.postsLiked + day.commentsPosted, 0),
      dailyStats
    }
  });
};

// Create mock interaction result for testing
export const createMockInteractionResult = (overrides: Partial<InteractionResult> = {}): InteractionResult => ({
  success: true,
  postsProcessed: 10,
  commentsPosted: 8,
  likesGiven: 10,
  errors: [],
  metrics: {
    averageEngagement: 0.05,
    viralRateAverage: 75,
    timeSpent: 300 // 5 minutes
  },
  ...overrides
}); 