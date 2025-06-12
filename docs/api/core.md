# Core API Reference 📚

Complete API documentation for the Instagram AI Agent core functions and interfaces.

## Agent Controller API

### `runAgent(schema, prompt)`

Main function for AI content generation with structured output.

```typescript
async function runAgent(
  schema: InstagramCommentSchema, 
  prompt: string
): Promise<any>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `schema` | `InstagramCommentSchema` | Response structure definition |
| `prompt` | `string` | Context and instructions for AI |

#### Returns

```typescript
Promise<Array<{
  comment: string;        // Generated comment text
  viralRate: number;      // Viral potential score (0-100)
  commentTokenCount: number; // Token count for rate limiting
}>>
```

#### Example Usage

```typescript
import { runAgent } from './Agent';
import { getInstagramCommentSchema } from './Agent/schema';

const schema = getInstagramCommentSchema();
const prompt = `Craft a thoughtful comment for: "Amazing sunset at the beach! 🌅"`;

const result = await runAgent(schema, prompt);
console.log(result[0].comment); // "The beauty of nature never fails to inspire..."
```

#### Error Handling

The function implements automatic failover with multiple API keys:

```typescript
try {
  const result = await runAgent(schema, prompt);
  return result;
} catch (error) {
  // Automatic retry with backup API keys
  // Exponential backoff on failure
  // Graceful degradation
}
```

### `chooseCharacter()`

Interactive character selection from available personality files.

```typescript
function chooseCharacter(): any
```

#### Returns

```typescript
{
  name: string;
  personality: {
    traits: string[];
    communication_style: object;
    response_patterns: object;
  };
  content_guidelines: object;
  ai_instructions: object;
}
```

#### Example Usage

```typescript
const character = chooseCharacter();
// Console prompt:
// Select a character:
// 1: ArcanEdge.System.Agent.json
// 2: elon.character.json
// 3: sample.character.json
// Enter the number of your choice: 2

console.log(character.name); // "Elon Musk Character"
```

### `initAgent()`

Initialize the AI agent system with character selection.

```typescript
function initAgent(): any
```

#### Returns

Selected character configuration object.

#### Example Usage

```typescript
try {
  const character = initAgent();
  console.log('Character selected:', character.name);
} catch (error) {
  console.error('Agent initialization failed:', error);
  process.exit(1);
}
```

## Schema API

### `getInstagramCommentSchema()`

Returns the structured schema for Instagram comment generation.

```typescript
function getInstagramCommentSchema(): InstagramCommentSchema
```

#### Returns

```typescript
{
  description: string;
  type: SchemaType.ARRAY;
  items: {
    type: SchemaType.OBJECT;
    properties: {
      comment: {
        type: SchemaType.STRING;
        description: string;
        nullable: false;
      };
      viralRate: {
        type: SchemaType.NUMBER;
        description: string;
        nullable: false;
      };
      commentTokenCount: {
        type: SchemaType.NUMBER;
        description: string;
        nullable: false;
      };
    };
    required: string[];
  };
}
```

#### Schema Customization

```typescript
// Customize response schema
export const getCustomCommentSchema = (): InstagramCommentSchema => {
  return {
    description: `Generate personalized comments for specific niches`,
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        comment: {
          type: SchemaType.STRING,
          description: "Comment between 100-200 characters for mobile users",
          nullable: false,
        },
        viralRate: {
          type: SchemaType.NUMBER,
          description: "Engagement prediction score 0-100",
          nullable: false,
        },
        sentiment: {
          type: SchemaType.STRING,
          description: "Comment sentiment: positive, neutral, negative",
          nullable: false,
        },
        hashtags: {
          type: SchemaType.ARRAY,
          description: "Suggested hashtags for the comment",
          nullable: true,
        }
      },
      required: ["comment", "viralRate", "sentiment"],
    },
  };
};
```

## Instagram Client API

### `runInstagram()`

Main Instagram automation function that handles the complete interaction cycle.

```typescript
async function runInstagram(): Promise<void>
```

#### Workflow

1. **Browser Setup**: Launch Puppeteer with stealth configuration
2. **Authentication**: Login with credentials or load saved cookies
3. **Navigation**: Navigate to Instagram feed
4. **Content Extraction**: Extract post captions and metadata
5. **AI Processing**: Generate contextual comments using AI
6. **Interaction**: Like posts and submit comments
7. **Session Management**: Save cookies and handle errors

#### Configuration Options

```typescript
// Browser configuration
const browserConfig = {
  headless: process.env.HEADLESS_MODE === 'true',
  args: [
    '--proxy-server=${proxyUrl}',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
};

// Interaction limits
const interactionConfig = {
  maxPosts: 50,
  waitTimeMin: 5000,
  waitTimeMax: 10000,
  sessionDuration: 30000
};
```

### `interactWithPosts(page)`

Handles individual post interactions within the Instagram feed.

```typescript
async function interactWithPosts(page: Page): Promise<void>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `Page` | Puppeteer page object |

#### Process Flow

```typescript
async function interactWithPosts(page: any) {
  let postIndex = 1;
  const maxPosts = 50;
  
  while (postIndex <= maxPosts) {
    // 1. Identify post elements
    const postSelector = `article:nth-of-type(${postIndex})`;
    
    // 2. Extract post caption
    const caption = await extractCaption(page, postSelector);
    
    // 3. Generate AI comment
    const schema = getInstagramCommentSchema();
    const prompt = createPrompt(caption);
    const result = await runAgent(schema, prompt);
    
    // 4. Like and comment
    await likePost(page, postSelector);
    await postComment(page, postSelector, result[0].comment);
    
    // 5. Wait before next interaction
    await randomDelay();
    postIndex++;
  }
}
```

### `loginWithCredentials(page, browser)`

Handles Instagram login process with credential validation.

```typescript
async function loginWithCredentials(
  page: Page, 
  browser: Browser
): Promise<void>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `Page` | Puppeteer page object |
| `browser` | `Browser` | Puppeteer browser instance |

#### Process

1. Navigate to Instagram login page
2. Fill username and password fields
3. Submit login form
4. Wait for navigation
5. Save authentication cookies

```typescript
try {
  await page.goto("https://www.instagram.com/accounts/login/");
  await page.waitForSelector('input[name="username"]');
  
  await page.type('input[name="username"]', IGusername);
  await page.type('input[name="password"]', IGpassword);
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  const cookies = await browser.cookies();
  await saveCookies("./cookies/Instagramcookies.json", cookies);
} catch (error) {
  logger.error("Login failed:", error);
  throw error;
}
```

## Utility Functions API

### Cookie Management

#### `saveCookies(path, cookies)`

Save browser cookies to file for session persistence.

```typescript
async function saveCookies(
  path: string, 
  cookies: Protocol.Network.Cookie[]
): Promise<void>
```

#### `loadCookies(path)`

Load saved cookies from file.

```typescript
async function loadCookies(path: string): Promise<Protocol.Network.Cookie[]>
```

#### `Instagram_cookiesExist()`

Check if Instagram cookies file exists.

```typescript
async function Instagram_cookiesExist(): Promise<boolean>
```

### Error Handling

#### `handleError(error, apiKeyIndex, schema, prompt, retryFunction)`

Comprehensive error handling with automatic failover and retry logic.

```typescript
async function handleError(
  error: any,
  currentApiKeyIndex: number,
  schema: any,
  prompt: string,
  retryFunction: Function
): Promise<any>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `error` | `any` | The error object |
| `currentApiKeyIndex` | `number` | Current API key index |
| `schema` | `any` | Response schema |
| `prompt` | `string` | Original prompt |
| `retryFunction` | `Function` | Function to retry |

#### Error Recovery Strategies

```typescript
// 1. API key failover
if (currentApiKeyIndex + 1 < geminiApiKeys.length) {
  return await retryFunction(schema, prompt, currentApiKeyIndex + 1);
}

// 2. Exponential backoff
const backoffTime = Math.min(1000 * Math.pow(2, currentApiKeyIndex), 30000);
await new Promise(resolve => setTimeout(resolve, backoffTime));

// 3. Reset and retry
return await retryFunction(schema, prompt, 0);
```

## Training API

### YouTube Training

#### `processYouTubeVideo(videoUrl)`

Extract and process YouTube video transcripts for AI training.

```typescript
async function processYouTubeVideo(videoUrl: string): Promise<TrainingData>
```

#### Returns

```typescript
{
  source: 'youtube';
  content: string;
  vocabulary: string[];
  speaking_style: object;
  topic_preferences: string[];
  emotional_tone: object;
}
```

### Audio Training

#### `processAudioFile(audioPath)`

Process audio files to extract conversational patterns.

```typescript
async function processAudioFile(audioPath: string): Promise<TrainingData>
```

#### Returns

```typescript
{
  transcription: string;
  tone_profile: object;
  conversation_style: object;
  emotional_markers: object;
}
```

### Document Training

#### `processDocument(filePath)`

Process documents (PDF, DOC, DOCX, TXT) for knowledge extraction.

```typescript
async function processDocument(filePath: string): Promise<TrainingData>
```

#### Supported Formats

- **PDF**: `pdf-parse` library
- **DOCX**: `mammoth` library  
- **TXT**: Native `fs.readFileSync`
- **DOC**: Legacy document support

#### Returns

```typescript
{
  content: string;
  topics: string[];
  concepts: object[];
  writing_style: object;
}
```

### Website Scraping

#### `scrapeWebsite(websiteUrl)`

Scrape website content for contextual training.

```typescript
async function scrapeWebsite(websiteUrl: string): Promise<TrainingData>
```

#### Returns

```typescript
{
  content: string;
  themes: string[];
  writing_style: object;
  topic_categories: string[];
}
```

## Database API

### Connection Management

#### `connectDB()`

Establish MongoDB connection with error handling.

```typescript
async function connectDB(): Promise<void>
```

#### Configuration

```typescript
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};
```

### Models

#### Tweet Model

```typescript
interface ITweet extends Document {
  tweetContent: string;
  imageUrl: string;
  timeTweeted: Date;
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

const Tweet: Model<ITweet> = mongoose.model<ITweet>('Tweet', tweetSchema);
```

## Logging API

### Logger Configuration

#### Winston Setup

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m'
    }),
    new winston.transports.Console()
  ]
});
```

#### Usage Examples

```typescript
// Information logging
logger.info('Instagram automation started', {
  character: 'elon.character.json',
  maxPosts: 50,
  sessionId: 'session_123'
});

// Error logging with context
logger.error('AI generation failed', {
  error: error.message,
  prompt: prompt.substring(0, 100),
  apiKey: currentApiKeyIndex,
  retryAttempt: 3
});

// Performance logging
logger.info('Performance metrics', {
  operation: 'comment_generation',
  executionTime: '250ms',
  memoryUsage: process.memoryUsage(),
  timestamp: new Date().toISOString()
});
```

## Response Types

### Character Configuration

```typescript
interface CharacterConfig {
  name: string;
  version: string;
  description: string;
  personality: {
    traits: string[];
    communication_style: {
      tone: string;
      formality: string;
      emoji_usage: string;
      vocabulary_level: string;
    };
    response_patterns: {
      greeting_style: string;
      question_handling: string;
      advice_giving: string;
      emotional_response: string;
    };
  };
  content_guidelines: {
    max_length: number;
    forbidden_topics: string[];
    preferred_hashtags: string[];
    engagement_focus: string;
  };
  ai_instructions: {
    system_prompt: string;
    response_format: string;
    quality_metrics: {
      relevance_weight: number;
      professionalism_weight: number;
      engagement_weight: number;
    };
  };
}
```

### Training Data

```typescript
interface TrainingData {
  source: 'youtube' | 'audio' | 'document' | 'website';
  content: string;
  metadata: {
    extractedAt: string;
    characterId?: string;
    sourceUrl?: string;
    fileType?: string;
  };
  analysis: {
    vocabulary?: string[];
    topics?: string[];
    style?: object;
    tone?: object;
  };
}
```

### AI Response

```typescript
interface AIResponse {
  comment: string;
  viralRate: number;
  commentTokenCount: number;
  metadata?: {
    character: string;
    processingTime: number;
    confidence: number;
  };
}
```

## Error Types

### API Errors

```typescript
interface APIError extends Error {
  code: string;
  statusCode?: number;
  apiKeyIndex?: number;
  retryable: boolean;
}
```

### Training Errors

```typescript
interface TrainingError extends Error {
  source: string;
  filePath?: string;
  url?: string;
  stage: 'extraction' | 'processing' | 'analysis';
}
```

## Next Steps

Explore related documentation:

1. **[Schema Reference](schemas.md)** - Detailed schema definitions
2. **[Development Setup](../development/setup.md)** - Development environment
3. **[Architecture Overview](../architecture/overview.md)** - System design
4. **[Training Guide](../guides/training-ai.md)** - AI training implementation

---

**Need more specific API details?** Check the source code or create an issue on GitHub →
