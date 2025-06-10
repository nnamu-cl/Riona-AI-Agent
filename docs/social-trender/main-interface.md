# Main Application Interface 🎛️

> **The Control Center**: Once users complete onboarding, they spend most of their time in these 3 core screens that control, monitor, and visualize their Instagram agent.

## 📱 Screen Overview

The main application consists of **3 primary screens**:

1. **Dashboard** - Control hub with real-time status and metrics
2. **Settings** - Comprehensive configuration management
3. **Streamer Mode** - Full-screen visualization and monitoring

## 🏠 Dashboard (Primary Hub)

**Purpose**: Central command center for monitoring and controlling the Instagram agent

### UI Layout & Components

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [@username] [Settings] [Streamer Mode]      │
├─────────────────────────────────────────────────────────────┤
│ Agent Status: [🟢 Running] [⏸️ Pause] [⚙️ Settings]        │
│ Current Action: Analyzing @creator's post about tech...    │
│ Next Action: in 2m 34s                                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌─────────────────────────────────┐│
│ │ TODAY'S STATS       │  │ WEEKLY PROGRESS                 ││
│ │ ├─ 47 Posts Liked   │  │ ├─ 312 Total Engagements       ││
│ │ ├─ 23 Comments      │  │ ├─ +156 New Followers           ││
│ │ ├─ 15 min Active    │  │ ├─ 89% Uptime                   ││
│ │ └─ 8/50 Session     │  │ └─ 🔥 12-day Streak             ││
│ └─────────────────────┘  └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY FEED                                        │
│ ├─ 🤖 2m ago: Generated comment with 78% viral score       │
│ ├─ 💬 3m ago: Posted "Great innovation!" on @tech's post   │
│ ├─ ❤️ 5m ago: Liked @creator's post about sustainability   │
│ ├─ ⏱️ 8m ago: Waited 7 seconds (human-like delay)          │
│ └─ 🎯 10m ago: Found new post matching interests           │
├─────────────────────────────────────────────────────────────┤
│ [🎬 Enter Streamer Mode] [📊 View Analytics] [⚙️ Settings] │
└─────────────────────────────────────────────────────────────┘
```

### Data Sources & Real-time Integration

**Source Code Mapping**:
```typescript
// Agent status monitoring
// From: src/client/Instagram.ts (Lines 65-73)
while (true) {
    await interactWithPosts(page);
    // Status: "Running" when active, "Paused" when in delay
    logger.info("Iteration complete, waiting 30 seconds...");
    await delay(30000);
}

// Current action detection
// From: src/client/Instagram.ts (Lines 98-201)
async function interactWithPosts(page: any) {
    // Track current post being processed
    console.log(`Liking post ${postIndex}...`);
    console.log(`Commenting on post ${postIndex}...`);
    console.log(`Waiting ${waitTime / 1000} seconds before moving...`);
}

// Activity logging for feed
// From: src/config/logger.ts
logger.info("Starting Instagram agent iteration...");
// All logged activities become feed items

// Metrics from database
// From: src/Agent/schema/index.ts (Lines 60-82)
const newTweet = new Tweet({
    tweetContent: tweetText,
    imageUrl: uri,
    timeTweeted: new Date(),
});
```

**Real-time Data Flow**:
```
Running Agent → Logger → WebSocket → Dashboard → Live Updates
```

**Key Metrics Calculated**:
- **Posts Liked**: Count from daily activity logs
- **Comments Posted**: Count from database entries  
- **Active Time**: Total time agent spent processing
- **Session Progress**: Current posts vs. `maxPosts` limit
- **Follower Growth**: Instagram API data (requires integration)
- **Uptime %**: (Active time / Total time) × 100

### WebSocket Events for Real-time Updates

```typescript
// Frontend subscribes to these events:
'agent_status_change'     // Running/Paused/Stopped
'current_action_update'   // What agent is doing now
'new_activity'           // New item for activity feed
'metrics_update'         // Updated daily/weekly stats
'next_action_countdown'  // Timer for next action
```

---

## ⚙️ Settings (Configuration Hub)

**Purpose**: Modify all agent configurations after initial setup

### Tabbed Interface Structure

#### **Tab 1: Instagram Account**
```
┌─────────────────────────────────────────────────────┐
│ Instagram Account Management                        │
├─────────────────────────────────────────────────────┤
│ Current Account: @username (2.3k followers) ✅     │
│ Connection Status: Active (last check: 2m ago)     │
├─────────────────────────────────────────────────────┤
│ Change Account:                                     │
│ Username: [current_username    ] [Test Connection] │
│ Password: [••••••••••••••••    ] [Update]          │
├─────────────────────────────────────────────────────┤
│ Session Management:                                 │
│ Cookie Status: Valid (expires in 14 days)          │
│ [Force Re-login] [Clear Session] [Download Backup] │
└─────────────────────────────────────────────────────┘
```

**Source Code Integration**:
```typescript
// Credential management
// From: src/secret/index.ts (Lines 3-4)
export const IGusername: string = process.env.IGusername;
export const IGpassword: string = process.env.IGpassword;

// Cookie session checking
// From: src/utils/index.ts (Line 6)
export async function Instagram_cookiesExist(): Promise<boolean>

// Session file location
// From: src/client/Instagram.ts (Line 33)
const cookiesPath = "./cookies/Instagramcookies.json";
```

#### **Tab 2: Agent Personality**
```
┌─────────────────────────────────────────────────────┐
│ AI Personality Configuration                        │
├─────────────────────────────────────────────────────┤
│ Current: Elon Musk (Tech innovator style)          │
│                                                     │
│ Available Personalities:                            │
│ ○ Elon Musk      - Innovation, tech-focused        │
│ ○ Professional   - Thoughtful, empathetic          │
│ ○ ArcanEdge      - Strategic, analytical           │
│ ● Custom         - Upload your own JSON file       │
├─────────────────────────────────────────────────────┤
│ Custom Personality Upload:                          │
│ [Choose File] personality.json [Upload]             │
│                                                     │
│ Preview Comment:                                    │
│ "Fascinating renewable energy breakthrough! 🌱      │
│ This innovation could transform sustainability."    │
└─────────────────────────────────────────────────────┘
```

**Source Code Integration**:
```typescript
// Character loading and selection
// From: src/Agent/index.ts (Lines 42-68)
export function chooseCharacter(): any {
    const charactersDir = path.join(__dirname, "characters");
    const files = fs.readdirSync(charactersDir);
    // Dynamic character loading
}

// Character file structure validation
// From: src/Agent/characters/*.json
{
    "name": "Custom Character",
    "style": { "post": [...] },
    "topics": [...],
    "adjectives": [...]
}
```

#### **Tab 3: Timing & Safety**
```
┌─────────────────────────────────────────────────────┐
│ Timing & Safety Configuration                       │
├─────────────────────────────────────────────────────┤
│ Engagement Speed: ● Balanced                       │
│ ├─ Between posts: 5-10 seconds                     │
│ ├─ Session breaks: 30 seconds                      │
│ └─ Agent restarts: 30 seconds                      │
│                                                     │
│ Daily Limits:                                       │
│ ├─ Posts per session: [50] ───────── (10-100)     │
│ ├─ Max daily sessions: [24] ──────── (1-48)       │
│ └─ Active hours: [9 AM] to [11 PM]                 │
├─────────────────────────────────────────────────────┤
│ Safety Features:                                    │
│ ☑️ Auto-pause if rate limited                      │
│ ☑️ Skip controversial content                       │
│ ☑️ Randomized interaction patterns                  │
│ ☑️ Human-like delays                                │
└─────────────────────────────────────────────────────┘
```

**Source Code Mapping**:
```typescript
// All timing parameters user can modify:

// Inter-post delays
// From: src/client/Instagram.ts (Lines 186-188)
const waitTime = Math.floor(Math.random() * 5000) + 5000;

// Posts per session limit  
// From: src/client/Instagram.ts (Line 99)
const maxPosts = 50;

// Session cooldown
// From: src/client/Instagram.ts (Line 68)
await delay(30000);

// Agent restart timing
// From: src/app.ts (Line 43)
await new Promise(resolve => setTimeout(resolve, 30000));
```

#### **Tab 4: Content Strategy**
```
┌─────────────────────────────────────────────────────┐
│ Content Generation Settings                         │
├─────────────────────────────────────────────────────┤
│ Comment Style:                                      │
│ ├─ Max length: [300] characters                     │
│ ├─ Tone: Thoughtful, empathetic, professional      │
│ └─ Avoid: Spam, controversial topics               │
│                                                     │
│ Content Preferences:                                │
│ ☑️ Technology & Innovation                          │
│ ☑️ Sustainability & Environment                     │
│ ☐ Business & Entrepreneurship                      │
│ ☐ Health & Wellness                                │
│                                                     │
│ Banned Words/Phrases:                               │
│ [Add phrases to avoid...                    ] [Add] │
│ ├─ "Check out my profile"                           │
│ ├─ "Follow for follow"                              │
│ └─ [Remove] [Remove]                                │
└─────────────────────────────────────────────────────┘
```

**Source Code Integration**:
```typescript
// Comment generation prompt customization
// From: src/client/Instagram.ts (Line 162)
const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${caption}". 
Ensure the reply is relevant, insightful, and adds value to the conversation. 
It should reflect empathy and professionalism, and avoid sounding too casual or superficial. 
also it should be 300 characters or less. and it should not go against instagram Community Standards on spam. 
so you will have to try your best to humanize the reply`;

// Schema for comment structure
// From: src/Agent/schema/index.ts (Lines 30-50)
export const getInstagramCommentSchema = (): InstagramCommentSchema => {
    return {
        description: `Lists comments that are engaging and have the potential to attract more likes`,
        // ... comment length and structure rules
    };
};
```

---

## 🎬 Streamer Mode (Full-Screen Visualization)

**Purpose**: Engaging, real-time visualization designed to showcase the agent's capabilities

### Full-Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 LIVE  Instagram Growth Agent  [Exit Streamer Mode] [⚙]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐  │
│ │ 🤖 CURRENT ACTION│ │ 📊 LIVE METRICS  │ │ 🧠 AI BRAIN     │  │
│ │                  │ │                  │ │                 │  │
│ │ Analyzing post   │ │ Today: 47 ❤️     │ │ Personality:    │  │
│ │ about solar      │ │ Comments: 23     │ │ Elon Musk       │  │
│ │ energy trends... │ │ Session: 12/50   │ │                 │  │
│ │                  │ │ New Followers:+3 │ │ Analyzing...    │  │
│ │ ⏱️ Next: 5s      │ │ Uptime: 98.2%    │ │ Viral Score:    │  │
│ │                  │ │ Rate Limit: ✅   │ │ 84% 🔥          │  │
│ └──────────────────┘ └──────────────────┘ └─────────────────┘  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📈 LIVE ACTIVITY STREAM                                     │ │
│ │ ├─ 🤖 Generated: "Incredible solar innovation! 🌞 This... │ │
│ │ ├─ ❤️ Liked @creator's renewable energy breakthrough      │ │
│ │ ├─ 💬 Posted comment with 84% viral potential             │ │
│ │ ├─ ⏱️ Waiting 8 seconds... (human-like delay)            │ │
│ │ ├─ 🎯 Found new post: future of sustainable tech         │ │
│ │ ├─ 🧠 AI analyzing caption sentiment and topics...       │ │
│ │ └─ 📊 Session progress: 12/50 posts processed            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📈 GROWTH VISUALIZATION                                     │ │
│ │                                                             │ │
│ │  Followers │ 💬 Comments │ ❤️ Likes │ 🎯 Viral Scores      │ │
│ │     2,347   │     156      │   1,234   │     Avg: 78%       │ │
│ │                                                             │ │
│ │    [Real-time animated charts showing growth trends]       │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Real-time Data Streams

**Source Code Integration**:
```typescript
// Live action monitoring
// From: src/client/Instagram.ts (Lines 98-201)
async function interactWithPosts(page: any) {
    // Each action logged in real-time:
    console.log(`Liking post ${postIndex}...`);           // → "❤️ Liked @user's post"
    console.log(`Commenting on post ${postIndex}...`);    // → "🤖 Generating comment..."
    console.log(`Caption for post ${postIndex}: ${caption}`); // → Context analysis
    console.log(`Waiting ${waitTime / 1000} seconds...`); // → Countdown timer
}

// AI generation tracking
// From: src/Agent/index.ts (Lines 25-35)
const result = await model.generateContent(prompt);
// Track: Processing time, viral score, token count

// Viral rate scoring
// From: src/Agent/schema/index.ts (Lines 35-50)
{
    comment: "Generated comment text",
    viralRate: 85,           // Real-time score display
    commentTokenCount: 42    // Length optimization
}
```

### Interactive Features

**Real-time Controls**:
- **Pause/Resume**: Immediately stop or start agent
- **Speed Adjustment**: Change delays on-the-fly  
- **Settings Overlay**: Quick access to key settings
- **Export Stream**: Save session data or screenshots

**Visual Effects**:
- **Animated Counters**: Numbers increment with each action
- **Progress Bars**: Session completion, daily goals
- **Pulse Effects**: Highlight new activities
- **Color Coding**: Green=success, Yellow=processing, Red=error

**Sound Design** (Optional):
- **Action Sounds**: Subtle chimes for likes, comments
- **Achievement Sounds**: Special effects for milestones
- **Background Ambience**: Optional tech/productivity sounds
- **Mute Toggle**: Quick disable for professional settings

## 🔄 Data Synchronization

### Cross-Screen State Management

**Shared Data Sources**:
```typescript
// User configuration state
interface UserConfig {
    instagram: { username: string, connected: boolean };
    personality: { selected: string, customFile?: string };
    timing: { speed: string, limits: object };
    safety: { features: boolean[] };
}

// Real-time agent state  
interface AgentState {
    status: 'running' | 'paused' | 'stopped';
    currentAction: string;
    metrics: DailyMetrics;
    activityFeed: ActivityItem[];
    nextActionIn: number;
}
```

### WebSocket Event System

**Events the Frontend Listens For**:
```typescript
'config_updated'         // Settings changed
'agent_started'          // Agent begins execution  
'agent_paused'           // Agent temporarily stopped
'action_started'         // New action beginning
'action_completed'       // Action finished successfully
'metrics_updated'        // New statistics available
'error_occurred'         // Something went wrong
'session_ended'          // Daily session completed
```

**Events the Frontend Sends**:
```typescript
'pause_agent'           // User clicks pause
'resume_agent'          // User clicks resume  
'update_config'         // Settings modified
'enter_streamer_mode'   // Full-screen visualization
'exit_streamer_mode'    // Return to dashboard
```

## 🎯 Key Integration Points

### Backend APIs Needed

**Configuration Management**:
- `GET /api/user/config` - Load user settings
- `PUT /api/user/config` - Update user settings  
- `POST /api/instagram/test` - Validate Instagram credentials

**Agent Control**:
- `POST /api/agent/start` - Begin Instagram agent
- `POST /api/agent/pause` - Temporarily stop agent
- `POST /api/agent/resume` - Continue agent execution
- `GET /api/agent/status` - Current agent state

**Data & Analytics**:
- `GET /api/metrics/today` - Daily statistics
- `GET /api/metrics/weekly` - Weekly trends
- `GET /api/activity/recent` - Latest agent actions
- `GET /api/logs/stream` - Real-time log feed

---

*Ready to monitor safety and health?* **[Continue to Safety & Monitoring →](safety-monitoring.md)** 