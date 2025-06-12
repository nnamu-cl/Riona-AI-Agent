# Instagram Bot Guide 📱

Complete guide for configuring and running the Instagram automation bot with AI-powered interactions.

## Quick Overview

The Instagram Bot is a sophisticated automation tool that:
- **Automatically logs into Instagram** using your credentials
- **Scrolls through your feed** and identifies posts to engage with
- **Generates contextual comments** using AI character personalities  
- **Likes posts and leaves thoughtful comments** to build engagement
- **Manages sessions** with cookie persistence and anti-detection measures

## Prerequisites & File Structure

Before running the bot, ensure the project has the following structure:

```
Instagram-AI-Agent/
├── .env                    # Environment variables (IGusername, IGpassword, etc.)
├── cookies/               # Directory for session cookies
│   └── Instagramcookies.json
├── src/
│   ├── secret/
│   │   └── index.ts       # Exports Instagram credentials
│   ├── Agent/
│   │   ├── characters/    # AI personality definitions
│   │   └── training/      # Training data files (PDFs, MP3s, TXT, URLs)
│   └── client/
│       └── Instagram.ts   # Main Instagram automation logic
└── logs/                  # Application logs
```

## Setup Checklist

### 1. Credentials & Secret Management

Create your `.env` file with Instagram credentials:

```env
# Instagram Authentication  
IGusername=your_instagram_username
IGpassword=your_instagram_password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent

# Optional: Proxy Configuration
PROXY_HOST=your_proxy_host
PROXY_PORT=8080
```

!!! warning "Security Best Practices"
    - Use a dedicated Instagram account for automation
    - Never commit `.env` file to version control
    - Consider using Instagram test account for development
    - Enable 2FA on your Google account for API access

### 2. Cookie Management

The bot automatically handles session persistence:

- **First Run**: Creates `cookies/Instagramcookies.json` after login
- **Subsequent Runs**: Loads saved cookies to maintain session
- **Cookie Validation**: Verifies cookies are still valid before use
- **Auto-Refresh**: Re-authenticates if cookies are expired

### 3. Database Setup

Start MongoDB for session and analytics storage:

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name instagram-ai-mongodb \
  mongodb/mongodb-community-server:latest

# Verify connection
docker exec -it instagram-ai-mongodb mongosh
```

## AI Agent Training & Customization

### Training Data Configuration

The bot uses training data to refine comment generation. The AI learns from:

#### Input Data Types

| Format | Purpose | Location |
|--------|---------|----------|
| **Text Files (.txt)** | Sample responses and templates | `src/Agent/training/` |
| **PDF Documents** | Technical docs and guidelines | `src/Agent/training/` |
| **Audio Files (.mp3)** | Tone and conversational style | `src/Agent/training/` |
| **URLs** | Website content scraping | Configured in training scripts |

#### Training Process

1. **Add Training Files**: Place files in `src/Agent/training/`
2. **Run Training Scripts**: 
   ```bash
   # Train with YouTube video
   npm run train:link
   
   # Train with audio file  
   npm run train:audio
   
   # Process document files
   npm run train-model
   ```
3. **Model Updates**: The AI updates character responses based on training data
4. **Customization**: Modify training data to adjust response style and topics

### Character Configuration

#### Available Characters

Select from pre-built personalities during startup:

```
Select a character:
1: ArcanEdge.System.Agent.json     # Technical, professional
2: elon.character.json             # Entrepreneurial, visionary  
3: sample.character.json           # Basic template
Enter the number of your choice: 2
```

#### Character Customization

Edit character files in `src/Agent/characters/`:

```json
{
  "name": "Custom Character",
  "personality": {
    "traits": ["friendly", "enthusiastic", "supportive"],
    "communication_style": {
      "tone": "casual",
      "emoji_usage": "moderate",
      "vocabulary_level": "conversational"
    }
  },
  "content_guidelines": {
    "max_length": 250,
    "forbidden_topics": ["politics", "controversial subjects"],
    "preferred_hashtags": ["#motivation", "#inspiration"],
    "engagement_focus": "supportive comments"
  }
}
```

## Core Customization Points

### 1. Comment Generation Engine

**Location**: `src/Agent/schema/index.ts`

Configure response parameters:

```typescript
export const getInstagramCommentSchema = (): InstagramCommentSchema => {
    return {
        description: `Generate engaging comments with viral potential`,
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                comment: {
                    type: SchemaType.STRING,
                    description: "Comment between 150-300 characters", // Adjust length
                    nullable: false,
                },
                viralRate: {
                    type: SchemaType.NUMBER,
                    description: "Viral potential score 0-100", // Quality threshold
                    nullable: false,
                },
            },
            required: ["comment", "viralRate", "commentTokenCount"],
        },
    };
};
```

**Customization Options**:
- **Response Length**: Modify character limits (150-300 default)
- **Tone Rules**: Set professional, casual, or mixed tone requirements
- **Quality Thresholds**: Adjust viral rate minimums
- **Content Filters**: Add banned topics or required themes

### 2. Interaction Patterns

**Location**: `src/client/Instagram.ts`

Configure automation behavior:

```typescript
async function interactWithPosts(page: any) {
    // 1. Maximum posts per session
    const maxPosts = 50; // Adjust based on desired activity level
    
    // 2. Randomized delay between interactions
    const waitTime = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds
    
    // 3. Comment generation prompt
    const prompt = `Craft a thoughtful, engaging comment for: "${caption}".
    Requirements:
    - Keep under 300 characters
    - Sound genuine and add value
    - Match the tone of a ${selectedCharacter} personality
    - Avoid spam-like language`;
    
    // 4. Interaction logic
    while (postIndex <= maxPosts) {
        // Like post
        if (likeButton && ariaLabel === "Like") {
            await likeButton.click();
            console.log(`Post ${postIndex} liked.`);
        }
        
        // Generate and post comment
        const result = await runAgent(schema, prompt);
        const comment = result[0]?.comment;
        await commentBox.type(comment);
        await postButton.click();
        
        // Wait before next interaction
        await delay(waitTime);
        postIndex++;
    }
}
```

**Configurable Parameters**:
- **`maxPosts`**: Number of posts to interact with per session
- **`waitTime`**: Delay range between interactions (randomized)
- **`prompt`**: AI instruction template for comment generation
- **Interaction Logic**: Like/comment behavior patterns

### 3. Session Management

**Location**: `src/client/Instagram.ts`

```typescript
async function runInstagram() {
    // 1. Proxy configuration
    const server = new Server({ port: 8000 });
    await server.listen();
    const proxyUrl = `http://localhost:8000`;
    
    // 2. Browser launch options
    const browser = await puppeteer.launch({
        headless: false,           // Set to true for background operation
        args: [`--proxy-server=${proxyUrl}`],
    });
    
    // 3. Cookie-based authentication
    const checkCookies = await Instagram_cookiesExist();
    if (checkCookies) {
        const cookies = await loadCookies(cookiesPath);
        await page.setCookie(...cookies);
    } else {
        await loginWithCredentials(page, browser);
    }
    
    // 4. Continuous operation loop
    while (true) {
        await interactWithPosts(page);
        logger.info("Iteration complete, waiting 30 seconds...");
        await delay(30000);
        await page.reload({ waitUntil: "networkidle2" });
    }
}
```

## Running the Bot

### 1. Start the Application

```bash
# Compile TypeScript and start
npm start

# Alternative: Development mode with auto-reload
npm run dev  # If available
```

### 2. Monitor Operation

**Console Output**:
```
[INFO] Server is running on port 3000
[INFO] Character selected: elon.character.json
[INFO] Checking cookies existence: true
[INFO] Cookies loaded and set on the page
[INFO] Login verified with cookies
[INFO] Starting Instagram agent iteration...

Caption for post 1: Amazing sunset at the beach! 🌅
Commenting on post 1...
Comment: "The beauty of nature never fails to inspire innovation! 🚀 
This sunset reminds me that the best ideas often come when we pause 
to appreciate the world around us."
Comment posted on post 1.
Post 1 liked.
Waiting 7 seconds before moving to the next post...
```

**Log Files**:
```bash
# View real-time logs
tail -f logs/application-$(date +%Y-%m-%d).log

# Check for errors
grep ERROR logs/application-$(date +%Y-%m-%d).log

# Monitor interactions
grep "Comment posted" logs/application-$(date +%Y-%m-%d).log
```

### 3. Control Operation

**Stop the Bot**:
- **Keyboard**: `Ctrl+C` for graceful shutdown
- **Process**: The application handles `SIGTERM` and `SIGINT` signals
- **Browser**: Automatically closes Puppeteer instances

**Restart After Changes**:
```bash
# After modifying character or configuration files
npm start
```

## Advanced Configuration

### 1. Stealth & Anti-Detection

The bot includes built-in anti-detection measures:

```typescript
// Stealth plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
}));

// User agent rotation
const userAgent = new UserAgent();
await page.setUserAgent(userAgent.toString());

// Randomized timing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = Math.floor(Math.random() * 5000) + 5000;
```

### 2. Proxy Configuration

For enhanced anonymity and rate limit avoidance:

```typescript
// Proxy setup in runInstagram()
const server = new Server({ 
    port: 8000,
    prepareRequestFunction: ({ request, username, password }) => {
        return {
            upstreamProxyUrl: `http://${username}:${password}@proxy.example.com:8080`,
        };
    },
});
```

### 3. Rate Limiting & Safety

**Built-in Safety Features**:
- **Interaction Delays**: 5-10 second randomized waits
- **Session Limits**: Maximum posts per session (default: 50)
- **Quality Filters**: AI-generated viral rate thresholds
- **Content Validation**: Anti-spam and appropriateness checks

**Customizable Safety Settings**:
```typescript
// Adjust in Instagram.ts
const safetyConfig = {
    maxPostsPerHour: 30,
    minDelayBetweenActions: 5000,
    maxDelayBetweenActions: 15000,
    viralRateThreshold: 70,
    maxCommentsPerSession: 20
};
```

## Troubleshooting

### Common Issues

#### "Login Failed" or "Cookies Invalid"
```bash
# Solutions:
1. Verify credentials in .env file
2. Check for Instagram verification emails/SMS
3. Delete existing cookies: rm cookies/Instagramcookies.json
4. Ensure account isn't restricted or requiring verification
5. Try logging in manually to check account status
```

#### "AI Response Generation Failed"
```bash
# Solutions:
1. Verify GEMINI_API_KEY in .env
2. Check API quota at Google AI Studio
3. Review character file JSON syntax
4. Check network connectivity
5. Review logs for specific error messages
```

#### "Browser Launch Issues"
```bash
# Solutions:
1. Install required browser dependencies:
   # Linux: sudo apt install chromium-browser
   # macOS: brew install chromium
2. Check if port 8000 is available
3. Disable headless mode for debugging: headless: false
4. Review proxy configuration
```

#### "High Memory Usage"
```bash
# Solutions:
1. Enable headless mode: headless: true
2. Reduce maxPosts per session
3. Restart application periodically
4. Monitor with: ps aux | grep node
```

### Performance Optimization

#### Memory Management
```typescript
// Add to Instagram.ts
setInterval(() => {
    const usage = process.memoryUsage();
    if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
        logger.warn('High memory usage detected, consider restart');
    }
}, 60000); // Check every minute
```

#### Network Optimization
```typescript
// Optimize Puppeteer settings
const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-images', // Skip image loading for faster operation
        '--disable-javascript', // Disable JS if not needed
    ],
});
```

## Maintenance & Updates

### Regular Maintenance Tasks

1. **Update Training Data**: Add new content weekly
2. **Review Generated Comments**: Check quality and appropriateness  
3. **Monitor Logs**: Watch for errors or unusual patterns
4. **Update Character Configurations**: Refine based on performance
5. **Check API Usage**: Monitor Gemini AI quota and costs

### Character Performance Analysis

```bash
# Analyze comment performance
grep "viral rate" logs/application-*.log | awk '{print $NF}' | sort -n

# Check interaction success rates  
grep -c "Comment posted" logs/application-$(date +%Y-%m-%d).log
grep -c "Error" logs/application-$(date +%Y-%m-%d).log
```

## Next Steps

After setting up the Instagram bot:

1. **[Train Your AI](training-ai.md)** - Enhance AI with custom training data
2. **[Create Custom Characters](custom-characters.md)** - Build unique AI personalities
3. **[Architecture Overview](../architecture/overview.md)** - Understand system design
4. **[Development Setup](../development/setup.md)** - Set up development environment

---

**Ready to train your AI?** Continue to [Training the AI](training-ai.md) → 