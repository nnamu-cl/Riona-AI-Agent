# Authentication & Onboarding 🚀

> **Getting Users Started**: This section covers the complete user journey from landing page to launching their first Instagram agent - 7 screens that transform visitors into active users.

## 📱 Screen Overview

The authentication and onboarding flow consists of **7 screens** designed to quickly get users up and running:

1. **Landing Page** - Marketing and conversion
2. **Login/Signup** - User authentication  
3. **Welcome** - Introduction and expectations
4. **Instagram Connection** - Link Instagram account
5. **Agent Personality** - Choose AI character
6. **Safety Settings** - Configure timing and limits
7. **Review & Launch** - Confirm and start agent

## 🎯 Screen Details & Source Code Integration

### 1. **Landing Page**
**Purpose**: Convert visitors to users with compelling value proposition

**UI Components**:
- Hero section with agent demo video
- Feature highlights (AI comments, growth tracking, safety)
- Pricing tiers display
- "Start Free Trial" CTA button

**Data Requirements**:
- Static marketing content
- Pricing information
- Demo screenshots/videos from Streamer Mode

**Source Code**: Frontend only (no backend integration needed)

---

### 2. **Login/Signup Screen**
**Purpose**: User authentication and account creation

**UI Components**:
```
┌─────────────────────────────────────┐
│ Welcome to Social Media Trender    │
├─────────────────────────────────────┤
│ [ Email Input             ]         │
│ [ Password Input          ]         │
│ [ Remember Me ] [ Sign In ]         │
├─────────────────────────────────────┤
│ Or sign up with:                    │
│ [Google] [Twitter] [Email]          │
└─────────────────────────────────────┘
```

**Data Flow**:
- **Input**: Email, password, OAuth tokens
- **Output**: User session, authentication token
- **Storage**: User database, session management

**Backend Integration Needed**:
- User authentication API
- Session management
- OAuth integration (Google, Twitter)

---

### 3. **Welcome Screen**
**Purpose**: Set expectations and introduce the agent

**UI Components**:
- Welcome message with user's name
- Quick overview of what the agent does
- Success metrics from other users
- "Let's Get Started" button

**Data Requirements**:
- User's name from registration
- Sample success metrics (static or aggregated)

**Source Code**: Frontend only with user data from authentication

---

### 4. **Instagram Connection Screen**
**Purpose**: Capture and validate Instagram credentials

**UI Components**:
```
┌─────────────────────────────────────────┐
│ Connect Your Instagram Account         │
├─────────────────────────────────────────┤
│ Instagram Username: [              ]   │
│ Instagram Password: [              ]   │
├─────────────────────────────────────────┤
│ [Test Connection] [Skip for Now]       │
├─────────────────────────────────────────┤
│ ✅ Connection successful!               │
│ Account: @username (2.3k followers)    │
└─────────────────────────────────────────┘
```

**Source Code Mapping**:
```typescript
// Store credentials securely
// From: src/secret/index.ts (Lines 3-4)
export const IGusername: string = process.env.IGusername || "user_input_here";
export const IGpassword: string = process.env.IGpassword || "user_input_here";

// Test Instagram connection
// From: src/client/Instagram.ts (Lines 78-94)
const loginWithCredentials = async (page: any, browser: Browser) => {
    await page.goto("https://www.instagram.com/accounts/login/");
    await page.type('input[name="username"]', IGusername);
    await page.type('input[name="password"]', IGpassword);
    // ... validation logic
}

// Check existing session
// From: src/utils/index.ts (Line 6)
export async function Instagram_cookiesExist(): Promise<boolean>
```

**Data Flow**:
- **Input**: Instagram username, password
- **Process**: Test login via Puppeteer automation
- **Validation**: Verify credentials work and account is accessible
- **Storage**: Encrypted credentials in user profile
- **Output**: Connection status, basic account info (follower count, username)

---

### 5. **Agent Personality Screen**
**Purpose**: Select AI character to personalize content generation

**UI Components**:
```
┌───────────────────────────────────────────────────────┐
│ Choose Your Agent's Personality                       │
├───────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ Elon Musk   │ │ Professional│ │ ArcanEdge   │     │
│ │             │ │             │ │             │     │
│ │ Innovation  │ │ Thoughtful  │ │ Tech-savvy  │     │
│ │ Tech-focused│ │ Empathetic  │ │ Strategic   │     │
│ │ Optimistic  │ │ Insightful  │ │ Analytical  │     │
│ │             │ │             │ │             │     │
│ │ [Preview]   │ │ [Preview]   │ │ [Preview]   │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
├───────────────────────────────────────────────────────┤
│ Sample Comment: "Incredible solar innovation! 🌞      │
│ This could revolutionize renewable energy."           │
└───────────────────────────────────────────────────────┘
```

**Source Code Mapping**:
```typescript
// Character loading system
// From: src/Agent/index.ts (Lines 42-68)
export function chooseCharacter(): any {
    const charactersDir = path.join(__dirname, "characters");
    const files = fs.readdirSync(charactersDir);
    const jsonFiles = files.filter(file => file.endsWith(".json"));
    // Character selection logic
}

// Character files structure
// From: src/Agent/characters/*.json
{
    "name": "Elon Musk",
    "style": {
        "post": ["uses concise and impactful language", "mentions specific projects"]
    },
    "topics": ["space travel", "electric vehicles", "AI safety"],
    "adjectives": ["innovative", "sustainable", "visionary"]
}
```

**Data Flow**:
- **Source**: Load all character JSON files from `src/Agent/characters/`
- **Display**: Character cards with name, description, sample traits
- **Preview**: Generate sample comment using selected character
- **Storage**: Selected character ID in user profile
- **Integration**: Character selection affects AI content generation

**Character Files**:
- `elon.character.json` - Tech innovator personality
- `ArcanEdge.System.Agent.json` - Strategic tech-savvy personality  
- `sample.character.json` - Generic professional personality

---

### 6. **Safety Settings Screen**
**Purpose**: Configure timing, limits, and safety parameters

**UI Components**:
```
┌─────────────────────────────────────────────────────┐
│ Safety & Speed Settings                             │
├─────────────────────────────────────────────────────┤
│ Engagement Speed:                                   │
│ ○ Conservative (10-20s delays) - Safest            │
│ ● Balanced (5-10s delays) - Recommended            │
│ ○ Aggressive (3-7s delays) - Fastest               │
├─────────────────────────────────────────────────────┤
│ Daily Limits:                                       │
│ Posts per session: [50    ] (10-100)               │
│ Sessions per day:  [24    ] (1-48)                 │
│ Active hours: [9 AM] to [11 PM]                    │
├─────────────────────────────────────────────────────┤
│ Safety Features:                                    │
│ ☑️ Auto-pause if rate limited                      │
│ ☑️ Skip controversial content                       │
│ ☑️ Humanized interaction patterns                   │
└─────────────────────────────────────────────────────┘
```

**Source Code Mapping**:
```typescript
// Inter-post delay configuration
// From: src/client/Instagram.ts (Lines 186-188)
const waitTime = Math.floor(Math.random() * 5000) + 5000; // 5-10s (Balanced)
// Conservative: Math.floor(Math.random() * 10000) + 10000; // 10-20s
// Aggressive: Math.floor(Math.random() * 4000) + 3000;     // 3-7s

// Posts per session limit
// From: src/client/Instagram.ts (Line 99)
const maxPosts = 50; // User configurable

// Session cooldown between iterations
// From: src/client/Instagram.ts (Line 68)
await delay(30000); // 30 seconds, user configurable

// Application-level timing between agent restarts
// From: src/app.ts (Line 43)
await new Promise(resolve => setTimeout(resolve, 30000)); // User configurable
```

**Data Flow**:
- **Input**: Speed preference, daily limits, active hours, safety toggles
- **Processing**: Convert UI selections to timing parameters
- **Storage**: Timing configuration in user profile
- **Application**: Parameters injected into agent configuration files

**Configuration Mapping**:
- **Conservative**: 10-20s delays, 20 posts/session, longer breaks
- **Balanced**: 5-10s delays, 50 posts/session, standard breaks  
- **Aggressive**: 3-7s delays, 80 posts/session, shorter breaks

---

### 7. **Review & Launch Screen**
**Purpose**: Confirm all settings and start the agent

**UI Components**:
```
┌─────────────────────────────────────────────────────┐
│ Ready to Launch Your Instagram Agent!              │
├─────────────────────────────────────────────────────┤
│ Configuration Summary:                              │
│ ├─ Instagram: @username (connected ✅)             │
│ ├─ Personality: Elon Musk                          │
│ ├─ Speed: Balanced (5-10s delays)                  │
│ ├─ Limits: 50 posts/session, 24 sessions/day       │
│ └─ Safety: All protections enabled                 │
├─────────────────────────────────────────────────────┤
│ [🚀 Launch Agent] [← Back to Edit]                 │
├─────────────────────────────────────────────────────┤
│ ⏱️ Estimated setup time: 30 seconds                │
│ 🎯 Expected daily engagement: 200-400 interactions │
└─────────────────────────────────────────────────────┘
```

**Source Code Integration**:
```typescript
// Start the main agent process
// From: src/app.ts (Lines 30-43)
const runAgents = async () => {
    while (true) {
        logger.info("Starting Instagram agent iteration...");
        await runInstagram(); // Launch with user configuration
        // ... continues with user's timing settings
    }
};

// Apply user configuration to agent
// Inject user settings into:
// - src/client/Instagram.ts (timing parameters)
// - src/Agent/characters/ (selected personality)
// - src/secret/index.ts (Instagram credentials)
```

**Data Flow**:
- **Summary**: Display all user selections from previous screens
- **Validation**: Final check that all required settings are configured
- **Launch**: Start agent process with user's configuration
- **Redirect**: Navigate to Dashboard to show agent in action

**Launch Process**:
1. Write user configuration to agent files
2. Start Instagram agent with custom settings
3. Initialize WebSocket connection for real-time updates
4. Redirect to Dashboard with live agent status

## 🔄 Data Flow Summary

### **Configuration Pipeline**:
```
User Input → Frontend State → Backend API → Agent Configuration Files → Running Agent
```

### **Key Data Transformations**:
1. **Instagram Credentials**: UI form → Encrypted storage → `src/secret/index.ts`
2. **Personality Selection**: Character cards → Character ID → Load `src/Agent/characters/*.json`
3. **Timing Settings**: UI sliders → Timing values → Inject into `src/client/Instagram.ts`
4. **Safety Settings**: UI toggles → Boolean flags → Agent safety logic

### **Onboarding Completion**:
- User profile created with all preferences
- Agent configuration files updated
- Instagram agent starts with custom settings
- User redirected to Dashboard for monitoring

---

*Ready to build the main interface?* **[Continue to Main Application →](main-interface.md)** 