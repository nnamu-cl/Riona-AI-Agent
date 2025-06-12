# Configuration Guide ⚙️

Complete guide to configuring your Instagram AI Agent for optimal performance and customization.

## Environment Variables

### Core Configuration

Your `.env` file is the central configuration hub:

```env
# === REQUIRED SETTINGS ===

# Instagram Authentication
IGusername=your_instagram_username
IGpassword=your_instagram_password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Database Connection
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent

# === OPTIONAL SETTINGS ===

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging Configuration
LOG_LEVEL=info
LOG_MAX_FILES=14d

# AI Configuration
MAX_COMMENT_LENGTH=300
VIRAL_RATE_THRESHOLD=70

# Automation Timing
INTERACTION_DELAY_MIN=5000
INTERACTION_DELAY_MAX=10000
MAX_POSTS_PER_SESSION=50

# Proxy Configuration (optional)
PROXY_HOST=your_proxy_host
PROXY_PORT=8080
PROXY_USERNAME=proxy_user
PROXY_PASSWORD=proxy_pass
```

### Configuration Sections

#### 🔐 Authentication Settings

```env
# Instagram Credentials
IGusername=your_username    # Without @ symbol
IGpassword=your_password    # Use strong, unique password

# Gemini AI API Key
GEMINI_API_KEY=AIzaSyD...  # From Google AI Studio
```

!!! warning "Security Best Practices"
    - Use dedicated Instagram account for automation
    - Enable 2FA on your Google account
    - Rotate API keys regularly
    - Never commit `.env` to version control

#### 🗄️ Database Configuration

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/instagram-ai-agent

# MongoDB with Authentication
MONGODB_URI=mongodb://username:password@localhost:27017/instagram-ai-agent
```

#### 📊 Logging Configuration

```env
# Log Levels: error, warn, info, debug
LOG_LEVEL=info

# Log Retention (days or file count)
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m

# Custom Log Directory
LOG_DIR=./logs
```

## AI Agent Configuration

### 1. Character Selection

Characters are defined in `src/Agent/characters/`:

```typescript
// src/Agent/index.ts - Character selection logic
export function chooseCharacter(): any {
    const charactersDir = path.join(__dirname, "characters");
    const files = fs.readdirSync(charactersDir);
    const jsonFiles = files.filter(file => file.endsWith(".json"));
    
    // Interactive selection or programmatic choice
    const selection = parseInt(answer);
    const chosenFile = path.join(charactersDir, jsonFiles[selection - 1]);
    return JSON.parse(fs.readFileSync(chosenFile, "utf8"));
}
```

### 2. Response Schema Configuration

Edit `src/Agent/schema/index.ts`:

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
                    description: "Viral potential score 0-100", // Configure scoring
                    nullable: false,
                },
                commentTokenCount: {
                    type: SchemaType.NUMBER,
                    description: "Token count for rate limiting",
                    nullable: false,
                },
            },
            required: ["comment", "viralRate", "commentTokenCount"],
        },
    };
};
```

## Instagram Client Configuration

### 1. Interaction Timing

Edit `src/client/Instagram.ts`:

```typescript
// 1. Maximum posts per session
const maxPosts = process.env.MAX_POSTS_PER_SESSION || 50;

// 2. Randomized delay between interactions
const waitTimeMin = process.env.INTERACTION_DELAY_MIN || 5000;
const waitTimeMax = process.env.INTERACTION_DELAY_MAX || 10000;
const waitTime = Math.floor(Math.random() * (waitTimeMax - waitTimeMin)) + waitTimeMin;

// 3. Session duration (30 seconds between iterations)
const sessionDelay = process.env.SESSION_DELAY || 30000;
```

### 2. Browser Configuration

```typescript
// Puppeteer launch options
const browser = await puppeteer.launch({
    headless: process.env.HEADLESS_MODE === 'true', // Environment controlled
    args: [
        `--proxy-server=${proxyUrl}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
    ],
    defaultViewport: {
        width: 1366,
        height: 768
    }
});
```

### 3. Stealth Configuration

The project uses stealth plugins for anti-detection:

```typescript
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
}));
```

## Proxy Configuration

### 1. Basic Proxy Setup

```env
# HTTP Proxy
PROXY_HOST=proxy.example.com
PROXY_PORT=8080
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password
```

### 2. Advanced Proxy Configuration

Edit `src/client/Instagram.ts`:

```typescript
import { Server } from "proxy-chain";

async function setupProxy() {
    const server = new Server({
        port: 8000,
        prepareRequestFunction: ({ request, username, password }) => {
            return {
                upstreamProxyUrl: `http://${username}:${password}@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
            };
        },
    });
    
    await server.listen();
    return `http://localhost:8000`;
}
```

### 3. Proxy Rotation

```typescript
const proxyList = [
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:8080',
    'http://proxy3.example.com:8080'
];

const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
```

## Advanced Configuration

### 1. Comment Generation Customization

Edit the prompt in `src/client/Instagram.ts`:

```typescript
const prompt = `
Craft a ${process.env.COMMENT_STYLE || 'thoughtful'} comment for: "${caption}".

Requirements:
- Length: ${process.env.MAX_COMMENT_LENGTH || 300} characters max
- Tone: ${process.env.COMMENT_TONE || 'professional and empathetic'}
- Style: ${process.env.COMMENT_STYLE || 'engaging and mature'}
- Language: ${process.env.COMMENT_LANGUAGE || 'English'}

Avoid:
- Spam-like content
- Generic responses
- Controversial topics
- Self-promotion

Generate a comment that adds value to the conversation.
`;
```

### 2. Rate Limiting Configuration

```typescript
// API rate limiting
const rateLimitConfig = {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 3600,
    backoffMultiplier: 2,
    maxBackoffTime: 30000
};

// Instagram interaction limits
const instagramLimits = {
    likesPerHour: 50,
    commentsPerHour: 20,
    followsPerHour: 15
};
```

### 3. Error Handling Configuration

Edit `src/config/logger.ts`:

```typescript
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        // File logging
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            maxSize: process.env.LOG_MAX_SIZE || '20m'
        }),
        
        // Console logging
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
```

## Database Configuration

### 1. MongoDB Connection Options

```typescript
// src/config/db.ts
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions);
```

### 2. Database Schema Configuration

```typescript
// Tweet schema for future Twitter integration
const tweetSchema = new Schema({
    tweetContent: { 
        type: String, 
        required: true,
        maxLength: process.env.MAX_TWEET_LENGTH || 280
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    timeTweeted: { 
        type: Date, 
        default: Date.now 
    },
    engagement: {
        likes: { type: Number, default: 0 },
        retweets: { type: Number, default: 0 },
        replies: { type: Number, default: 0 }
    }
});
```

## Cron Job Configuration

### 1. Automated Scheduling

```typescript
// src/app.ts - Configure automation intervals
const cron = require('node-cron');

// Run every hour
cron.schedule('0 * * * *', () => {
    logger.info('Starting scheduled Instagram automation');
    runInstagram();
});

// Run at specific times
cron.schedule('0 9,12,15,18 * * *', () => {
    logger.info('Starting scheduled automation - prime time');
    runInstagram();
});
```

### 2. Dynamic Scheduling

```typescript
const scheduleConfig = {
    enabled: process.env.CRON_ENABLED === 'true',
    pattern: process.env.CRON_PATTERN || '0 */2 * * *', // Every 2 hours
    timezone: process.env.TIMEZONE || 'America/New_York'
};
```

## Configuration Validation

### 1. Environment Validation

Create `src/config/validation.ts`:

```typescript
export function validateConfig() {
    const required = [
        'IGusername',
        'IGpassword', 
        'GEMINI_API_KEY',
        'MONGODB_URI'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate API key format
    if (!process.env.GEMINI_API_KEY?.startsWith('AIza')) {
        throw new Error('Invalid Gemini API key format');
    }
    
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI?.startsWith('mongodb')) {
        throw new Error('Invalid MongoDB URI format');
    }
}
```

### 2. Runtime Configuration Check

```typescript
// Add to src/index.ts
import { validateConfig } from './config/validation';

async function startServer() {
    try {
        validateConfig();
        logger.info('✅ Configuration validation passed');
        
        await initAgent();
        // ... rest of startup
    } catch (err) {
        logger.error('❌ Configuration validation failed:', err);
        process.exit(1);
    }
}
```

## Configuration Templates

### 1. Development Environment

```env
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
HEADLESS_MODE=false
MAX_POSTS_PER_SESSION=5
INTERACTION_DELAY_MIN=2000
INTERACTION_DELAY_MAX=5000
```

### 2. Production Environment

```env
# .env.production  
NODE_ENV=production
LOG_LEVEL=info
HEADLESS_MODE=true
MAX_POSTS_PER_SESSION=50
INTERACTION_DELAY_MIN=10000
INTERACTION_DELAY_MAX=20000
```

### 3. Testing Environment

```env
# .env.test
NODE_ENV=test
LOG_LEVEL=error
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent-test
HEADLESS_MODE=true
MAX_POSTS_PER_SESSION=1
```

## Troubleshooting Configuration

### Common Configuration Issues

#### Invalid API Keys
```bash
# Test Gemini API key
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
console.log('API key format valid');
"
```

#### Database Connection Issues
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err.message));
"
```

#### Environment Variable Loading
```bash
# Check if .env is loaded
node -e "
require('dotenv').config();
console.log('IGusername:', process.env.IGusername ? '✅ Set' : '❌ Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
"
```

## Performance Tuning

### 1. Memory Optimization

```env
# Node.js memory settings
NODE_OPTIONS=--max-old-space-size=4096

# MongoDB connection pooling
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

### 2. Network Optimization

```env
# Timeout settings
HTTP_TIMEOUT=30000
MONGODB_TIMEOUT=5000
PUPPETEER_TIMEOUT=60000

# Retry settings
MAX_RETRIES=3
RETRY_DELAY=5000
```

## Next Steps

✅ **Configuration Complete!** Now you can:

1. **[Run Quick Start](quick-start.md)** - Test your configuration
2. **[Understand Architecture](../architecture/overview.md)** - Learn system design
3. **[Train Your AI](../guides/training-ai.md)** - Customize AI behavior

---

**Ready to run your agent?** Continue to [Quick Start Guide](quick-start.md) → 