import mongoose, { Schema, Model } from 'mongoose';
import { CampaignObjective, DailyProgress, TimeWindow, SleepConfiguration, QueuedAction, CampaignState } from '../../types/campaign';

// Daily Progress Schema
const dailyProgressSchema = new Schema<DailyProgress>({
  date: { type: Date, required: true },
  postsLiked: { type: Number, default: 0 },
  commentsPosted: { type: Number, default: 0 },
  followersGained: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  activeTime: { type: Number, default: 0 }
});

// Time Window Schema
const timeWindowSchema = new Schema<TimeWindow>({
  start: { type: String, required: true }, // HH:MM format
  end: { type: String, required: true },   // HH:MM format
  days: [{ type: Number, min: 0, max: 6 }] // 0-6, Sunday=0
});

// Sleep Configuration Schema
const sleepConfigurationSchema = new Schema<SleepConfiguration>({
  type: { 
    type: String, 
    enum: ['daily_rest', 'weekend_reduced', 'strategic_rest', 'error_recovery'],
    required: true 
  },
  duration: { type: Number, required: true }, // milliseconds
  pattern: { type: String, required: true },  // cron pattern or 'immediate'
  reason: { type: String, required: true }
});

// Queued Action Schema
const queuedActionSchema = new Schema<QueuedAction>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['comment', 'like', 'follow', 'post'],
    required: true 
  },
  scheduledFor: { type: Date, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  retryCount: { type: Number, default: 0 },
  priority: { type: Number, default: 0 }
});

// Main Campaign Schema
const campaignSchema = new Schema<CampaignObjective>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['follower_growth', 'engagement_rate', 'brand_awareness', 'lead_generation'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active' 
  },
  
  // Target metrics
  targetMetrics: {
    followerTarget: { type: Number },
    engagementRate: { type: Number },
    dailyInteractions: { type: Number, default: 50 },
    duration: { type: Number, default: 30 } // days
  },
  
  // Progress tracking
  progress: {
    startDate: { type: Date, default: Date.now },
    currentFollowers: { type: Number, default: 0 },
    totalInteractions: { type: Number, default: 0 },
    dailyStats: [dailyProgressSchema],
    lastActiveDate: { type: Date, default: Date.now }
  },
  
  // Sleep scheduling
  schedule: {
    activePeriods: [timeWindowSchema],
    sleepPeriods: [sleepConfigurationSchema],
    currentPhase: { 
      type: String, 
      enum: ['active', 'sleeping'],
      default: 'active' 
    },
    nextWakeup: { type: Date },
    nextSleep: { type: Date }
  },
  
  // Recovery data
  recoveryData: {
    lastSuccessfulAction: { type: Date, default: Date.now },
    sessionState: { type: Schema.Types.Mixed, default: {} },
    pendingActions: [queuedActionSchema],
    errorCount: { type: Number, default: 0 },
    lastError: { type: String }
  },

  // Settings
  settings: {
    timezone: { type: String, default: 'UTC' },
    characterPersonality: { type: String, default: 'elon.character.json' },
    safetyLevel: { 
      type: String, 
      enum: ['conservative', 'balanced', 'aggressive'],
      default: 'balanced' 
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Campaign State Schema (for state persistence)
const campaignStateSchema = new Schema<CampaignState>({
  campaignId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  
  sessionData: {
    cookies: [{ type: Schema.Types.Mixed }],
    lastProcessedPost: { type: String },
    currentPosition: { type: Number, default: 0 },
    browserState: { type: Schema.Types.Mixed, default: {} }
  },
  
  aiContext: {
    recentComments: [{ type: String }],
    characterState: { type: Schema.Types.Mixed, default: {} },
    learningData: { type: Schema.Types.Mixed, default: {} }
  },
  
  metrics: {
    todaysProgress: dailyProgressSchema,
    weeklyTrends: { type: Schema.Types.Mixed, default: {} },
    goalProgress: { type: Number, default: 0 }
  },
  
  pendingActions: [queuedActionSchema],
  
  systemHealth: {
    memoryUsage: { type: Schema.Types.Mixed },
    errorCounts: { type: Schema.Types.Mixed, default: {} },
    performanceMetrics: { type: Schema.Types.Mixed, default: {} }
  }
}, {
  timestamps: true,
  // TTL index - remove state after 7 days
  expireAt: { type: Date, default: Date.now, expires: 7 * 24 * 60 * 60 } // 7 days
});

// Indexes for performance
campaignSchema.index({ status: 1, 'schedule.currentPhase': 1 });
campaignSchema.index({ 'progress.lastActiveDate': 1 });
campaignSchema.index({ 'schedule.nextWakeup': 1 });

campaignStateSchema.index({ campaignId: 1, timestamp: -1 });

// Models
export const Campaign: Model<CampaignObjective> = mongoose.model<CampaignObjective>('Campaign', campaignSchema);
export const CampaignStateModel: Model<CampaignState> = mongoose.model<CampaignState>('CampaignState', campaignStateSchema); 